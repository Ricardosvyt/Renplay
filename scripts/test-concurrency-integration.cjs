const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const ts = require("typescript");
const { Pool } = require("pg");

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

test("ATOMIC RATE LIMIT CONCURRENCY & INTEGRATION SUITE", async (t) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("DATABASE_URL não configurada; pulando teste de conexão direta com Neon.");
    return;
  }

  const realPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 20,
    connectionTimeoutMillis: 5000,
  });

  const authRateLimit = loadTsModule("src/lib/auth-rate-limit.ts", {
    "@/lib/db": { getDb: () => realPool },
  });

  const testPrefix = `test_cnc_${Date.now()}`;

  // Helper to construct mock requests with isolated action and IP
  function createReq(ip, identifier) {
    return {
      headers: {
        get(name) {
          if (name.toLowerCase() === "x-vercel-forwarded-for") return ip;
          return null;
        },
      },
    };
  }

  // Cleanup isolated test keys from Neon after tests
  t.after(async () => {
    try {
      await realPool.query("DELETE FROM rp_limits WHERE key LIKE $1", [`%${testPrefix}%`]);
    } catch {
      // non-fatal
    } finally {
      await realPool.end();
    }
  });

  await t.test("1. Simulação de 10 requisições simultâneas: exatamente 5 admitidas à verificação de senha", async () => {
    const action = `${testPrefix}_10`;
    const ip = "198.51.100.10";
    const user = "victim_10";

    const promises = Array.from({ length: 10 }).map(() =>
      authRateLimit.reserveAuthAttempt(createReq(ip, user), action, user)
    );

    const results = await Promise.all(promises);
    const admitted = results.filter((r) => r.allowed);
    const rejected = results.filter((r) => !r.allowed);

    console.log(`[10 Concorrentes] Admitidas para verificar senha: ${admitted.length} | Bloqueadas (HTTP 429): ${rejected.length}`);
    assert.equal(admitted.length, 5, "Exatamente 5 requisições devem ser admitidas à verificação de senha");
    assert.equal(rejected.length, 5, "Exatamente 5 requisições devem receber HTTP 429");
    for (const r of rejected) {
      assert.equal(r.reason, "PAIR_EXCEEDED");
      assert.ok(r.retryAfter > 0);
    }
  });

  await t.test("2. Simulação de 50 requisições simultâneas: exatamente 5 admitidas, 45 bloqueadas", async () => {
    const action = `${testPrefix}_50`;
    const ip = "198.51.100.50";
    const user = "victim_50";

    const promises = Array.from({ length: 50 }).map(() =>
      authRateLimit.reserveAuthAttempt(createReq(ip, user), action, user)
    );

    const results = await Promise.all(promises);
    const admitted = results.filter((r) => r.allowed);
    const rejected = results.filter((r) => !r.allowed);

    console.log(`[50 Concorrentes] Admitidas para verificar senha: ${admitted.length} | Bloqueadas (HTTP 429): ${rejected.length}`);
    assert.equal(admitted.length, 5, "Exatamente 5 requisições devem ser admitidas");
    assert.equal(rejected.length, 45, "Exatamente 45 requisições devem receber HTTP 429");
  });

  await t.test("3. Simulação de 100 requisições simultâneas: exatamente 5 admitidas, 95 bloqueadas", async () => {
    const action = `${testPrefix}_100`;
    const ip = "198.51.100.100";
    const user = "victim_100";

    const promises = Array.from({ length: 100 }).map(() =>
      authRateLimit.reserveAuthAttempt(createReq(ip, user), action, user)
    );

    const results = await Promise.all(promises);
    const admitted = results.filter((r) => r.allowed);
    const rejected = results.filter((r) => !r.allowed);

    console.log(`[100 Concorrentes] Admitidas para verificar senha: ${admitted.length} | Bloqueadas (HTTP 429): ${rejected.length}`);
    assert.equal(admitted.length, 5, "Exatamente 5 requisições devem ser admitidas");
    assert.equal(rejected.length, 95, "Exatamente 95 requisições devem receber HTTP 429 sem calcular Argon2id");
  });

  await t.test("4. Vários usuários no mesmo IP compartilhado (NAT/Rede): limites isolados por par", async () => {
    const action = `${testPrefix}_nat`;
    const sharedIp = "203.0.113.88";

    // 5 falhas para user_a
    for (let i = 0; i < 5; i++) {
      const res = await authRateLimit.reserveAuthAttempt(createReq(sharedIp, "user_a"), action, "user_a");
      assert.equal(res.allowed, true);
    }
    // 6ª para user_a deve ser bloqueada
    const resA6 = await authRateLimit.reserveAuthAttempt(createReq(sharedIp, "user_a"), action, "user_a");
    assert.equal(resA6.allowed, false);

    // user_b no MESMO IP deve ter suas próprias 5 tentativas livres
    const resB1 = await authRateLimit.reserveAuthAttempt(createReq(sharedIp, "user_b"), action, "user_b");
    assert.equal(resB1.allowed, true, "User B no mesmo IP não deve ser bloqueado por falhas do User A");
  });

  await t.test("5. Ataque distribuído contra uma única conta a partir de diferentes IPs", async () => {
    const action = `${testPrefix}_distrib`;
    const targetUser = "target_account";

    // Simular 20 IPs diferentes atacando com 1 tentativa cada
    for (let i = 1; i <= 20; i++) {
      const ip = `198.51.${Math.floor(i / 256)}.${i % 256}`;
      const res = await authRateLimit.reserveAuthAttempt(createReq(ip, targetUser), action, targetUser);
      assert.equal(res.allowed, true);
      // Registra falha distribuída
      await authRateLimit.recordAuthFailure(createReq(ip, targetUser), action, targetUser);
    }

    // 21º IP acessando a conta atacada: deve acionar micro-tarpit mas NÃO bloquear com 429
    const res21 = await authRateLimit.reserveAuthAttempt(createReq("203.0.113.99", targetUser), action, targetUser);
    assert.equal(res21.allowed, true, "Usuário legítimo não deve receber 429 em ataque distribuído");
    assert.equal(res21.shouldTarpit, true, "Deve acionar micro-tarpit para desacelerar o ataque");
    assert.ok(res21.tarpitMs >= 400, "Tarpit deve ser de pelo menos 400ms");
  });

  await t.test("6. Login legítimo durante tentativas maliciosas e limpeza no sucesso", async () => {
    const action = `${testPrefix}_legit`;
    const attackerIp = "198.51.100.66";
    const legitIp = "203.0.113.77";
    const account = "streamer_account";

    // Atacante comete 5 falhas e fica bloqueado no IP dele
    for (let i = 0; i < 5; i++) {
      await authRateLimit.reserveAuthAttempt(createReq(attackerIp, account), action, account);
    }
    const attackerNext = await authRateLimit.reserveAuthAttempt(createReq(attackerIp, account), action, account);
    assert.equal(attackerNext.allowed, false, "Atacante deve ser bloqueado");

    // Usuário legítimo de outro IP acessa normalmente
    const legitReq = createReq(legitIp, account);
    const legitCheck = await authRateLimit.reserveAuthAttempt(legitReq, action, account);
    assert.equal(legitCheck.allowed, true, "Dono legítimo em outro IP deve conseguir tentar");

    // Dono legítimo acerta a senha -> recordAuthSuccess limpa o par dele
    await authRateLimit.recordAuthSuccess(legitReq, action, account);

    // Nova tentativa do legítimo está com contador zerado
    const legitAfterSuccess = await authRateLimit.reserveAuthAttempt(legitReq, action, account);
    assert.equal(legitAfterSuccess.allowed, true);
  });

  await t.test("7. Falha de conexão durante reserva: fail-closed seguro com HTTP 503", async () => {
    const brokenPool = {
      query: async () => {
        const err = new Error("connection to server failed");
        err.code = "ECONNREFUSED";
        throw err;
      },
    };

    const isolatedAuth = loadTsModule("src/lib/auth-rate-limit.ts", {
      "@/lib/db": { getDb: () => brokenPool },
    });

    const res = await isolatedAuth.reserveAuthAttempt(createReq("198.51.100.1", "any"), "test", "any");
    assert.equal(res.allowed, false, "Não deve permitir tentativas ilimitadas se o banco falhar");
    assert.equal(res.isServiceUnavailable, true, "Deve sinalizar 503 Service Unavailable");
    assert.equal(res.reason, "DB_UNAVAILABLE");
  });

  await t.test("8. Limpeza garantida de rp_limits (cleanupExpiredLimits)", async () => {
    const action = `${testPrefix}_cleanup`;
    const expiredKey = `auth:${action}:expired:${Date.now()}`;

    // Insere registro com data de reset no passado
    await realPool.query(
      "INSERT INTO rp_limits (key, hits, resets_at) VALUES ($1, 10, now() - interval '2 hours') ON CONFLICT (key) DO UPDATE SET resets_at = EXCLUDED.resets_at",
      [expiredKey]
    );

    // Executa a limpeza garantida
    const deleted = await authRateLimit.cleanupExpiredLimits(realPool, 100);
    assert.ok(deleted >= 1, "Deve ter excluído ao menos 1 registro expirado");

    // Verifica que o registro expirado sumiu
    const check = await realPool.query("SELECT key FROM rp_limits WHERE key = $1", [expiredKey]);
    assert.equal(check.rows.length, 0, "Registro expirado deve ser removido com sucesso");
  });
});
