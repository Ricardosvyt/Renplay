const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");

function loadTsModule(targetPath, mocks = {}) {
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
  const customRequire = (id) => {
    if (mocks[id]) return mocks[id];
    if (id.startsWith("@/")) {
      const resolved = id.replace("@/", "src/");
      const candidates = [
        path.resolve(projectRoot, resolved + ".ts"),
        path.resolve(projectRoot, resolved + "/index.ts"),
        path.resolve(projectRoot, resolved + ".js"),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return loadTsModule(cand, mocks);
        }
      }
    }
    return require(id);
  };

  const fn = new Function("require", "module", "exports", "__dirname", "__filename", transpiled);
  fn(customRequire, moduleObj, moduleObj.exports, path.dirname(fullPath), fullPath);
  return moduleObj.exports;
}

function calculateStats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const getPercentile = (p) => {
    const idx = (p / 100) * (n - 1);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    const weight = idx - low;
    return sorted[low] * (1 - weight) + sorted[high] * weight;
  };

  return {
    count: n,
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[n - 1].toFixed(2)),
    mean: Number(mean.toFixed(2)),
    median: Number(getPercentile(50).toFixed(2)),
    p90: Number(getPercentile(90).toFixed(2)),
    p95: Number(getPercentile(95).toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
  };
}

test("STATISTICAL TIMING BENCHMARK SUITE", async (t) => {
  const argon2 = require("argon2");
  const bcrypt = require("bcryptjs");

  const argonPassword = "PasswordTestArgon2026!";
  const argonHash = await argon2.hash(argonPassword, { type: argon2.argon2id });
  const bcryptPassword = "PasswordTestBcrypt2026!";
  const bcryptHash = await bcrypt.hash(bcryptPassword, 10);

  // In-memory mock database
  const mockLimits = new Map();
  const mockClient = {
    async query(sql, params = []) {
      if (sql.includes("FROM rp_limits") && (sql.includes("WHERE key IN") || sql.includes("WHERE key ="))) {
        const keys = Array.isArray(params[0]) ? params[0] : params;
        const rows = [];
        for (const k of keys) {
          if (mockLimits.has(k)) {
            rows.push({
              key: k,
              hits: mockLimits.get(k).hits,
              resets_at: mockLimits.get(k).resets_at,
              remaining_seconds: 900,
            });
          }
        }
        return { rows };
      }

      if (sql.includes("INSERT INTO rp_limits")) {
        const key = params[0];
        const existing = mockLimits.get(key);
        const hits = params[1] !== undefined ? params[1] : (existing ? existing.hits + 1 : 1);
        const resets_at = params[2] !== undefined ? params[2] : new Date(Date.now() + 15 * 60 * 1000);
        mockLimits.set(key, { hits, resets_at });
        return { rows: [{ hits, remaining_seconds: 900 }] };
      }

      if (sql.includes("FROM rp_users")) {
        const id = String(params[0]).toLowerCase();
        if (id === "existent_argon") {
          return {
            rows: [{
              id: "u-argon-1",
              username: "existent_argon",
              email: "existent_argon@renplay.site",
              password_hash: argonHash,
              active: true,
              banned: false,
              banned_until: null,
            }],
          };
        }
        if (id === "legacy_bcrypt") {
          return {
            rows: [{
              id: "u-bcrypt-1",
              username: "legacy_bcrypt",
              email: "legacy_bcrypt@renplay.site",
              password_hash: bcryptHash,
              active: true,
              banned: false,
              banned_until: null,
            }],
          };
        }
        if (id === "inactive_user") {
          return {
            rows: [{
              id: "u-inactive-1",
              username: "inactive_user",
              email: "inactive@renplay.site",
              password_hash: argonHash,
              active: false,
              banned: false,
              banned_until: null,
            }],
          };
        }
        // Non-existent user
        return { rows: [] };
      }

      return { rows: [] };
    },
    release() {},
  };

  const mockDb = {
    connect: async () => mockClient,
    query: async (sql, params) => mockClient.query(sql, params),
  };

  const authModule = loadTsModule("src/lib/auth.ts", {
    "@/lib/db": { getDb: () => mockDb },
  });

  const webLoginRoute = loadTsModule("src/app/api/auth/login/route.ts", {
    "@/lib/db": { getDb: () => mockDb },
    "@/lib/auth": authModule,
  });

  const ITERATIONS = 30;
  const WARMUP = 5;

  async function measureRequest(identifier, password, ipSuffix) {
    const start = performance.now();
    const req = new Request("https://renplay.site/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-forwarded-for": `198.51.100.${ipSuffix}`,
      },
      body: JSON.stringify({ identifier, password }),
    });
    const res = await webLoginRoute.POST(req);
    const elapsed = performance.now() - start;
    assert.equal(res.status, 401);
    return elapsed;
  }

  async function measureHashVerify(password, hash) {
    const start = performance.now();
    await authModule.verifyPasswordHash(password, hash);
    return performance.now() - start;
  }

  // Warmup phase to stabilize V8 compiler and avoid cold-start outliers
  for (let i = 0; i < WARMUP; i++) {
    await measureRequest("existent_argon", "WrongPass123!", 1);
    await measureRequest("non_existent_user", "WrongPass123!", 2);
    await measureRequest("legacy_bcrypt", "WrongPass123!", 3);
    await measureRequest("inactive_user", "WrongPass123!", 4);
    mockLimits.clear();
  }

  const cases = {
    A: { name: "Case A: Existent Argon2id User + Wrong Password", times: [], hashTimes: [] },
    B: { name: "Case B: Non-Existent User + Wrong Password", times: [], hashTimes: [] },
    C: { name: "Case C: Legacy Bcrypt User + Wrong Password", times: [], hashTimes: [] },
    D: { name: "Case D: Inactive Existent User + Wrong Password", times: [], hashTimes: [] },
  };

  // Run benchmark with interleaved iterations to prevent thermal throttling bias
  for (let i = 0; i < ITERATIONS; i++) {
    mockLimits.clear(); // Clear so rate limit 429 is not triggered during timing measurement

    // Case A
    cases.A.times.push(await measureRequest("existent_argon", "WrongPass123!", (i % 250) + 1));
    cases.A.hashTimes.push(await measureHashVerify("WrongPass123!", argonHash));

    // Case B
    cases.B.times.push(await measureRequest("non_existent_user", "WrongPass123!", (i % 250) + 1));
    cases.B.hashTimes.push(await measureHashVerify("WrongPass123!", authModule.DUMMY_ARGON2_HASH));

    // Case C
    cases.C.times.push(await measureRequest("legacy_bcrypt", "WrongPass123!", (i % 250) + 1));
    cases.C.hashTimes.push(await measureHashVerify("WrongPass123!", bcryptHash));

    // Case D
    cases.D.times.push(await measureRequest("inactive_user", "WrongPass123!", (i % 250) + 1));
    cases.D.hashTimes.push(await measureHashVerify("WrongPass123!", argonHash));
  }

  const results = {};
  for (const [key, item] of Object.entries(cases)) {
    results[key] = {
      name: item.name,
      totalRequest: calculateStats(item.times),
      hashVerify: calculateStats(item.hashTimes),
    };
  }

  console.log("\n================ STATISTICAL TIMING BENCHMARK REPORT ================");
  console.log(`Evaluated ${ITERATIONS} iterations per scenario (after ${WARMUP} warmup runs):\n`);

  for (const [key, data] of Object.entries(results)) {
    console.log(`[${key}] ${data.name}`);
    console.log(`    Total Request (ms): Mean=${data.totalRequest.mean} | Median=${data.totalRequest.median} | p90=${data.totalRequest.p90} | p95=${data.totalRequest.p95} | StdDev=${data.totalRequest.stdDev}`);
    console.log(`    Hash Verify   (ms): Mean=${data.hashVerify.mean} | Median=${data.hashVerify.median} | p90=${data.hashVerify.p90} | p95=${data.hashVerify.p95} | StdDev=${data.hashVerify.stdDev}`);
    console.log("");
  }

  // Timing difference comparison between Existent (A) and Non-Existent (B)
  const diffMedian = Math.abs(results.A.totalRequest.median - results.B.totalRequest.median);
  const diffHashMedian = Math.abs(results.A.hashVerify.median - results.B.hashVerify.median);
  console.log(`Median Difference (Case A vs Case B) Total Request: ${diffMedian.toFixed(2)} ms`);
  console.log(`Median Difference (Case A vs Case B) Hash Verify:   ${diffHashMedian.toFixed(2)} ms`);
  console.log("=======================================================================\n");

  // Save report data for documentation
  fs.writeFileSync(
    path.resolve(projectRoot, "scripts/timing-benchmark-results.json"),
    JSON.stringify(results, null, 2)
  );

  // Assertions: Case A and Case B should have tightly comparable median hash times (< 25ms difference)
  assert.ok(
    diffHashMedian < 25,
    `Hash verification difference between existent and non-existent accounts (${diffHashMedian}ms) should be minimal`
  );

  // Assertions: Inactive accounts (Case D) must also match existent Argon2 accounts
  const diffDMedian = Math.abs(results.A.totalRequest.median - results.D.totalRequest.median);
  assert.ok(
    diffDMedian < 25,
    `Inactive accounts should have timing equivalent to active existent accounts (${diffDMedian}ms)`
  );
});
