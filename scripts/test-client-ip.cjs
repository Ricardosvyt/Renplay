const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");

function loadTsModule(targetPath) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(projectRoot, targetPath);
  const code = fs.readFileSync(fullPath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;

  const moduleObj = { exports: {} };
  const customRequire = (id) => require(id);
  const fn = new Function("require", "module", "exports", "__dirname", "__filename", transpiled);
  fn(customRequire, moduleObj, moduleObj.exports, path.dirname(fullPath), fullPath);
  return moduleObj.exports;
}

const { normalizeIp, extractClientIp, hashIp, maskIp } = loadTsModule("src/lib/client-ip.ts");

function mockRequest(headers = {}) {
  const map = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return {
    headers: {
      get(name) {
        return map.get(name.toLowerCase()) || null;
      },
    },
  };
}

test("CLIENT IP & HEADER SECURITY SUITE", async (t) => {
  await t.test("1. Legitimate IP via Vercel authoritative header is correctly extracted", () => {
    const req = mockRequest({
      "x-vercel-forwarded-for": "203.0.113.195",
      "x-forwarded-for": "10.0.0.1, 192.168.1.1",
    });
    const info = extractClientIp(req);
    assert.equal(info.normalizedIp, "203.0.113.195");
    assert.equal(info.sourceHeader, "x-vercel-forwarded-for");
    assert.equal(info.isReliable, true);
    assert.notEqual(info.normalizedIp, "127.0.0.1");
  });

  await t.test("2. Spoofed x-forwarded-for and cf-connecting-ip do not override Vercel authoritative header", () => {
    const req = mockRequest({
      "x-forwarded-for": "1.2.3.4, 5.6.7.8", // Spoofed by attacker
      "cf-connecting-ip": "8.8.8.8", // Spoofed by attacker without Cloudflare proxy enabled
      "x-real-ip": "9.9.9.9", // Spoofed by attacker
      "x-vercel-forwarded-for": "198.51.100.55", // Injected by Vercel infrastructure
    });
    const info = extractClientIp(req);
    assert.equal(info.normalizedIp, "198.51.100.55");
    assert.equal(info.sourceHeader, "x-vercel-forwarded-for");
    assert.equal(info.isReliable, true);
  });

  await t.test("3. Arbitrary cf-connecting-ip sent by client is rejected when Cloudflare proxy is not configured", () => {
    delete process.env.TRUST_CLOUDFLARE_PROXY;
    const req = mockRequest({
      "cf-connecting-ip": "198.51.100.77",
    });
    // In production mode without Vercel header and without TRUST_CLOUDFLARE_PROXY
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const info = extractClientIp(req);
      assert.equal(info.normalizedIp, null);
      assert.equal(info.isReliable, false);
      assert.notEqual(info.normalizedIp, "198.51.100.77");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  await t.test("4. Absence of trusted headers explicitly returns null and NEVER falls back to 127.0.0.1", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const req = mockRequest({});
      const info = extractClientIp(req);
      assert.equal(info.normalizedIp, null);
      assert.equal(info.isReliable, false);
      assert.equal(info.sourceHeader, null);
      assert.equal(info.ipHash, null);
      assert.equal(info.maskedIp, "unverified-origin");
      // Explicit guarantee: external client without headers is NEVER labeled as localhost
      assert.notEqual(info.normalizedIp, "127.0.0.1");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  await t.test("5. External client with bogus headers is never confused with localhost (127.0.0.1)", () => {
    const req = mockRequest({
      "x-forwarded-for": "bogus-unparseable-ip",
      "user-agent": "malicious-bot",
    });
    const info = extractClientIp(req);
    assert.equal(info.normalizedIp, null);
    assert.notEqual(info.normalizedIp, "127.0.0.1");
  });

  await t.test("6. IPv4 addresses with port suffixes are sanitized and normalized", () => {
    const normalized = normalizeIp("198.51.100.42:3000");
    assert.equal(normalized, "198.51.100.42");
  });

  await t.test("7. Standard IPv6 addresses are parsed and canonicalized", () => {
    const normalized = normalizeIp("2001:db8:85a3:0:0:8a2e:370:7334");
    assert.equal(normalized, "2001:db8:85a3::8a2e:370:7334");
  });

  await t.test("8. Equivalent IP representations produce the exact same normalized string and hash", () => {
    // IPv6 zero expansion vs abbreviation
    const v6A = normalizeIp("2001:0db8:0000:0000:0000:0000:0000:0001");
    const v6B = normalizeIp("2001:db8:0:0:0:0:0:1");
    const v6C = normalizeIp("2001:db8::1");
    const v6D = normalizeIp("[2001:db8::1]:8080");

    assert.equal(v6A, "2001:db8::1");
    assert.equal(v6B, "2001:db8::1");
    assert.equal(v6C, "2001:db8::1");
    assert.equal(v6D, "2001:db8::1");
    assert.equal(hashIp(v6A), hashIp(v6C));

    // IPv4-mapped IPv6
    const mappedA = normalizeIp("::ffff:192.0.2.1");
    const mappedB = normalizeIp("0:0:0:0:0:ffff:192.0.2.1");
    const standardIpv4 = normalizeIp("192.0.2.1");

    assert.equal(mappedA, "192.0.2.1");
    assert.equal(mappedB, "192.0.2.1");
    assert.equal(standardIpv4, "192.0.2.1");
    assert.equal(hashIp(mappedA), hashIp(standardIpv4));
  });

  await t.test("9. Attacker IP changes are tracked independently without bleeding across boundaries", () => {
    const req1 = mockRequest({ "x-vercel-forwarded-for": "198.51.100.1" });
    const req2 = mockRequest({ "x-vercel-forwarded-for": "198.51.100.2" });
    const info1 = extractClientIp(req1);
    const info2 = extractClientIp(req2);
    assert.notEqual(info1.normalizedIp, info2.normalizedIp);
    assert.notEqual(info1.ipHash, info2.ipHash);
  });

  await t.test("10. Privacy masking avoids logging raw IP addresses", () => {
    assert.equal(maskIp("203.0.113.100"), "203.0.***.***");
    assert.equal(maskIp("2001:db8::1"), "2001:db8:****:****");
    assert.equal(maskIp(null), "unverified-origin");
  });
});
