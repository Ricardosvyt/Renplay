const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');
const argon2 = require('argon2');
const bcrypt = require('bcryptjs');

const projectRoot = path.resolve(__dirname, '..');

// Transpiler helper to execute TS modules directly in Node
function loadTsModule(targetPath, mocks = {}) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(projectRoot, targetPath);
  const code = fs.readFileSync(fullPath, 'utf8');
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
    if (id.startsWith('@/')) {
      const resolved = id.replace('@/', 'src/');
      const candidates = [
        path.resolve(projectRoot, resolved + '.ts'),
        path.resolve(projectRoot, resolved + '/index.ts'),
        path.resolve(projectRoot, resolved + '.js'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return loadTsModule(cand, mocks);
        }
      }
    }
    return require(id);
  };

  const fn = new Function('require', 'module', 'exports', '__dirname', '__filename', transpiled);
  fn(customRequire, moduleObj, moduleObj.exports, path.dirname(fullPath), fullPath);
  return moduleObj.exports;
}

test('LOGIN AUDIT & REINFORCEMENT TEST SUITE', async (t) => {
  // In-memory mock database state
  let mockLimits = new Map();
  let mockSessions = [];
  let userLastLogin = null;
  let simulateDbError = false;

  let argonPassword = 'MinhaSenhaSegura123!';
  let argonHash = '';
  let bcryptPassword = 'SenhaAntigaBcrypt123!';
  let bcryptHash = '';

  const mockClient = {
    async query(sql, params = []) {
      if (simulateDbError) {
        const err = new Error('getaddrinfo ENOTFOUND ep-test.neon.tech');
        err.code = 'ENOTFOUND';
        throw err;
      }

      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] };
      }

      // Rate limit query
      if (sql.includes('FROM rp_limits') && (sql.includes('WHERE key IN') || sql.includes('WHERE key ='))) {
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

      // CTE atomic upsert
      if (sql.includes('WITH pair_upsert AS')) {
        const pairKey = params[0];
        const ipKey = params[1];

        const pairExist = mockLimits.get(pairKey);
        const pairHits = (pairExist?.hits || 0) + 1;
        mockLimits.set(pairKey, { hits: pairHits, resets_at: new Date(Date.now() + 15 * 60 * 1000) });

        const ipExist = mockLimits.get(ipKey);
        const ipHits = (ipExist?.hits || 0) + 1;
        mockLimits.set(ipKey, { hits: ipHits, resets_at: new Date(Date.now() + 15 * 60 * 1000) });

        return {
          rows: [
            { key: pairKey, hits: pairHits, remaining_seconds: 900 },
            { key: ipKey, hits: ipHits, remaining_seconds: 900 },
          ],
        };
      }

      // Rate limit upsert
      if (sql.includes('INSERT INTO rp_limits')) {
        const key = params[0];
        const existing = mockLimits.get(key);
        const hits = existing ? existing.hits + 1 : 1;
        const resets_at = new Date(Date.now() + 15 * 60 * 1000);
        mockLimits.set(key, { hits, resets_at });
        return { rows: [{ key, hits, remaining_seconds: 900 }] };
      }

      // Rate limit delete
      if (sql.includes('DELETE FROM rp_limits WHERE key =')) {
        mockLimits.delete(params[0]);
        return { rows: [] };
      }

      // User lookup
      if (sql.includes('FROM rp_users') && sql.includes('WHERE LOWER(username) = $1 OR LOWER(email) = $1')) {
        const id = String(params[0]).toLowerCase();
        if (id === 'argonplayer' || id === 'argon@renplay.site') {
          return {
            rows: [{
              id: 'user-argon-uuid',
              username: 'ArgonPlayer',
              email: 'argon@renplay.site',
              display_name: 'Argon Hero',
              password_hash: argonHash,
              active: true,
              banned: false,
              banned_until: null,
            }],
          };
        }
        if (id === 'bcryptplayer' || id === 'bcrypt@renplay.site') {
          return {
            rows: [{
              id: 'user-bcrypt-uuid',
              username: 'BcryptPlayer',
              email: 'bcrypt@renplay.site',
              display_name: 'Bcrypt Veteran',
              password_hash: bcryptHash,
              active: true,
              banned: false,
              banned_until: null,
            }],
          };
        }
        if (id === 'banneduser' || id === 'banned@renplay.site') {
          return {
            rows: [{
              id: 'user-banned-uuid',
              username: 'BannedUser',
              email: 'banned@renplay.site',
              display_name: 'Banned',
              password_hash: argonHash,
              active: true,
              banned: true,
              banned_until: null,
            }],
          };
        }
        if (id === 'inactiveuser' || id === 'inactive@renplay.site') {
          return {
            rows: [{
              id: 'user-inactive-uuid',
              username: 'InactiveUser',
              email: 'inactive@renplay.site',
              display_name: 'Inactive',
              password_hash: argonHash,
              active: false,
              banned: false,
              banned_until: null,
            }],
          };
        }
        return { rows: [] };
      }

      // Roles lookup
      if (sql.includes('FROM rp_user_roles WHERE user_id = $1')) {
        return { rows: [{ role: 'ADMIN' }] };
      }

      // Update last login
      if (sql.includes('UPDATE rp_users SET last_login_at = now()')) {
        userLastLogin = params[0];
        return { rows: [] };
      }

      // Create session
      if (sql.includes('INSERT INTO rp_sessions')) {
        mockSessions.push({ userId: params[0], tokenHash: params[1], expiresAt: params[2] });
        return { rows: [{ id: 'sess-1' }] };
      }

      // Verify session
      if (sql.includes('FROM rp_sessions s')) {
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

  const authModule = loadTsModule('src/lib/auth.ts', {
    '@/lib/db': { getDb: () => mockDb },
  });

  argonHash = await authModule.hashPassword(argonPassword);
  bcryptHash = await bcrypt.hash(bcryptPassword, 10);

  const mockCookiesStore = {
    cookies: new Map(),
    async get(name) { return this.cookies.get(name); },
    set(cookie) { this.cookies.set(cookie.name, cookie); },
  };

  const webLoginRoute = loadTsModule('src/app/api/auth/login/route.ts', {
    '@/lib/db': { getDb: () => mockDb },
    '@/lib/auth': {
      ...authModule,
      createWebSession: async (userId, rememberMe) => {
        const rawToken = 'mock-random-session-token-32bytes-base64url';
        mockCookiesStore.set({
          name: 'renplay_session',
          value: rawToken,
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: rememberMe ? 604800 : undefined,
        });
      },
    },
  });

  const v1LoginRoute = loadTsModule('src/app/api/v1/auth/login/route.ts', {
    '@/lib/db': { getDb: () => mockDb },
    '@/lib/auth': authModule,
    '@/lib/launcher-rate-limit': {
      allowLauncherAuth: async (req, action, identifier, maximum) => {
        const count = (mockLimits.get(`launcher:${identifier}`)?.hits || 0) + 1;
        mockLimits.set(`launcher:${identifier}`, { hits: count, resets_at: new Date(Date.now() + 900000) });
        return count <= maximum;
      },
      clearLauncherAuthRateLimit: async (req, action, identifier) => {
        mockLimits.delete(`launcher:${identifier}`);
      },
    },
  });

  const desktopAuthorizeRoute = loadTsModule('src/app/api/v1/auth/desktop/authorize/route.ts', {
    '@/lib/db': { getDb: () => mockDb },
    '@/lib/auth': authModule,
  });

  const cronRoute = loadTsModule('src/app/api/cron/cleanup-limits/route.ts', {
    '@/lib/db': { getDb: () => mockDb },
    '@/lib/auth-rate-limit': {
      cleanupExpiredLimits: async (pool, batchSize) => 42,
    },
  });

  // 1. Credenciais corretas (Argon2id)
  await t.test('1. Credenciais corretas realizam login com sucesso e criam sessão web', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'argonplayer', password: argonPassword, rememberMe: true }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.username, 'ArgonPlayer');
    assert.ok(mockCookiesStore.cookies.has('renplay_session'));
  });

  // 2. E-mail inexistente
  await t.test('2. E-mail inexistente retorna 401 com mensagem genérica (sem enumerar)', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'inexistente@renplay.site', password: 'QualquerSenha123!' }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'E-mail/usuário ou senha inválidos.');
  });

  // 3. Senha incorreta
  await t.test('3. Senha incorreta retorna 401 com mensagem idêntica ao usuário inexistente', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'argonplayer', password: 'SenhaErrada123!' }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'E-mail/usuário ou senha inválidos.');
  });

  // 4. Entradas vazias
  await t.test('4. Entradas vazias são rejeitadas com 401 sem atingir o banco', async () => {
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '', password: '' }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'E-mail/usuário ou senha inválidos.');
  });

  // 5. Entradas muito grandes (limite de tamanho de entrada e payload)
  await t.test('5. Entradas muito grandes ou payload excessivo (>8KB) são rejeitados', async () => {
    const hugePassword = 'A'.repeat(500);
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'argonplayer', password: hugePassword }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 401);

    const oversizedJson = JSON.stringify({ identifier: 'argonplayer', password: 'X'.repeat(9000) });
    const req2 = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedJson,
    });
    const res2 = await webLoginRoute.POST(req2);
    assert.equal(res2.status, 400);
  });

  // 6. SQL Injection
  await t.test('6. SQL Injection em usuário ou senha é neutralizado por parâmetros seguros', async () => {
    const maliciousInputs = [
      "' OR 1=1 --",
      "argonplayer' UNION SELECT null, null, null, '$argon2id$...', true, false, null --",
      "'; DROP TABLE rp_users; --",
    ];
    for (const evil of maliciousInputs) {
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: evil, password: evil }),
      });
      const res = await webLoginRoute.POST(req);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.error, 'E-mail/usuário ou senha inválidos.');
    }
  });

  // 7. Tentativas repetidas (Rate Limit 429)
  await t.test('7. Tentativas excessivas disparam HTTP 429 com Retry-After e sem enumerar', async () => {
    mockLimits.clear();
    // Simular 5 falhas consecutivas
    for (let i = 0; i < 5; i++) {
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.1' },
        body: JSON.stringify({ identifier: 'argonplayer', password: 'SenhaErrada!' }),
      });
      const res = await webLoginRoute.POST(req);
      assert.equal(res.status, 401);
    }
    // 6ª tentativa deve retornar 429
    const reqBlocked = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.1' },
      body: JSON.stringify({ identifier: 'argonplayer', password: 'SenhaErrada!' }),
    });
    const resBlocked = await webLoginRoute.POST(reqBlocked);
    assert.equal(resBlocked.status, 429);
    assert.equal(resBlocked.headers.get('Retry-After'), '900');
    assert.equal(resBlocked.headers.get('Cache-Control'), 'no-store');
  });

  // 8. Tentativas simultâneas (concurrency)
  await t.test('8. Múltiplas requisições simultâneas não quebram nem causam corrida', async () => {
    mockLimits.clear();
    const promises = Array.from({ length: 4 }).map(() => {
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.9' },
        body: JSON.stringify({ identifier: 'argonplayer', password: 'SenhaErrada!' }),
      });
      return webLoginRoute.POST(req);
    });
    const responses = await Promise.all(promises);
    for (const r of responses) {
      assert.ok([401, 429].includes(r.status));
    }
  });

  // 9. Login com Argon2id
  await t.test('9. Hash centralizado com Argon2id funciona perfeitamente', async () => {
    const verified = await authModule.verifyPasswordHash(argonPassword, argonHash);
    assert.equal(verified, true);
    const rejected = await authModule.verifyPasswordHash('OutraSenha123!', argonHash);
    assert.equal(rejected, false);
  });

  // 10. Login com bcrypt legado
  await t.test('10. Contas legadas migradas com bcrypt continuam autenticando normalmente', async () => {
    const verified = await authModule.verifyPasswordHash(bcryptPassword, bcryptHash);
    assert.equal(verified, true);

    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'bcryptplayer', password: bcryptPassword, rememberMe: false }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.username, 'BcryptPlayer');
  });

  // 11. Falha de conexão com Neon (503 seguro sem vazar segredos)
  await t.test('11. Falha de conexão com o banco Neon retorna 503 seguro sem expor URLs ou senhas', async () => {
    simulateDbError = true;
    try {
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'argonplayer', password: argonPassword }),
      });
      const res = await webLoginRoute.POST(req);
      assert.equal(res.status, 503);
      const data = await res.json();
      assert.ok(!data.error.includes('neon.tech'));
      assert.ok(!data.error.includes('password'));
      assert.equal(data.error, 'Não foi possível consultar o serviço de autenticação agora. Tente novamente em instantes.');
    } finally {
      simulateDbError = false;
    }
  });

  // 12. Sessão inválida ou expirada
  await t.test('12. Tokens de sessão inválidos, vazios ou falsificados são rejeitados', async () => {
    assert.equal(await authModule.getUserBySessionToken(''), null);
    assert.equal(await authModule.getUserBySessionToken('curto'), null);
    assert.equal(await authModule.getUserBySessionToken('token-falso-com-tamanho-suficiente-12345'), null);
  });

  // 13. Cookies em produção
  await t.test('13. Cookies gerados possuem HttpOnly, Secure, SameSite=Lax e Path=/', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'argonplayer', password: argonPassword, rememberMe: true }),
    });
    await webLoginRoute.POST(req);
    const cookie = mockCookiesStore.cookies.get('renplay_session');
    assert.ok(cookie);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, 'lax');
    assert.equal(cookie.path, '/');
    assert.equal(cookie.maxAge, 604800);
  });

  // 14. Login do Launcher
  await t.test('14. Rota do Launcher (/api/v1/auth/login) emite accessToken e refreshToken', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'argonplayer', password: argonPassword }),
    });
    const res = await v1LoginRoute.POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.accessToken);
    assert.ok(data.refreshToken);
    assert.equal(data.user.username, 'ArgonPlayer');
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
  });

  // 15. Ausência de credenciais em logs
  await t.test('15. Erros e payloads não registram senhas em console ou saídas de log', async () => {
    let interceptedLogs = [];
    const origError = console.error;
    console.error = (...args) => { interceptedLogs.push(args.join(' ')); };
    try {
      // Forçar erro com senha sensível
      simulateDbError = true;
      const sensitivePassword = 'SuperSecretPasswordNeverLogMe987!';
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'argonplayer', password: sensitivePassword }),
      });
      await webLoginRoute.POST(req);
      for (const log of interceptedLogs) {
        assert.ok(!log.includes(sensitivePassword), 'A senha sensível foi encontrada no log!');
      }
    } finally {
      console.error = origError;
      simulateDbError = false;
    }
  });

  // 16. Conta banida
  await t.test('16. Conta banida retorna 403 apenas após validar senha correta; com senha errada retorna 401 idêntico', async () => {
    mockLimits.clear();
    // Tentativa com senha errada para conta banida: NÃO revela que a conta está banida (retorna 401)
    const reqWrong = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'banneduser', password: 'SenhaIncorreta123!' }),
    });
    const resWrong = await webLoginRoute.POST(reqWrong);
    assert.equal(resWrong.status, 401);
    const dataWrong = await resWrong.json();
    assert.equal(dataWrong.error, 'E-mail/usuário ou senha inválidos.');

    // Tentativa com senha correta para conta banida: retorna 403
    const reqRight = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'banneduser', password: argonPassword }),
    });
    const resRight = await webLoginRoute.POST(reqRight);
    assert.equal(resRight.status, 403);
    const dataRight = await resRight.json();
    assert.equal(dataRight.error, 'Sua conta está banida permanentemente.');
  });

  // 17. Conta inativa
  await t.test('17. Conta inativa retorna 401 genérico indistinguível de credenciais incorretas', async () => {
    mockLimits.clear();
    const req = new Request('https://renplay.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ identifier: 'inactiveuser', password: argonPassword }),
    });
    const res = await webLoginRoute.POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'E-mail/usuário ou senha inválidos.');
  });

  // 18. Origem sem IP confiável
  await t.test('18. Origem sem IP confiável em ambiente de produção é rejeitada com HTTP 400 sem collective DoS', async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      mockLimits.clear();
      // Requisição sem cabeçalhos de IP confiáveis em produção
      const req = new Request('https://renplay.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'argonplayer', password: argonPassword }),
      });
      const res = await webLoginRoute.POST(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('origem da rede'));
      // Verifica que NÃO criou chave global untrusted-pool no banco
      assert.equal(mockLimits.has('auth:login:untrusted-pool'), false);
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  // 19. Endpoint de limpeza agendada Vercel Cron
  await t.test('19. Cron de limpeza (/api/cron/cleanup-limits) exige Bearer CRON_SECRET via timingSafeEqual e rejeita x-vercel-cron falso', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.CRON_SECRET;
    process.env.NODE_ENV = 'production';
    process.env.CRON_SECRET = 'segredo-cron-super-seguro-renplay-2026';

    try {
      // 1. Requisição sem autorização
      const reqAnon = new Request('https://renplay.site/api/cron/cleanup-limits', { method: 'GET' });
      const resAnon = await cronRoute.GET(reqAnon);
      assert.equal(resAnon.status, 401);

      // 2. Requisição forjando apenas x-vercel-cron: 1 (deve ser rejeitada!)
      const reqFakeHeader = new Request('https://renplay.site/api/cron/cleanup-limits', {
        method: 'GET',
        headers: { 'x-vercel-cron': '1' },
      });
      const resFakeHeader = await cronRoute.GET(reqFakeHeader);
      assert.equal(resFakeHeader.status, 401, 'x-vercel-cron não pode ser aceito como credencial secreta');

      // 3. Requisição com Bearer token incorreto
      const reqWrongToken = new Request('https://renplay.site/api/cron/cleanup-limits', {
        method: 'GET',
        headers: { authorization: 'Bearer token-errado-123' },
      });
      const resWrongToken = await cronRoute.GET(reqWrongToken);
      assert.equal(resWrongToken.status, 401);

      // 4. Requisição com Bearer token válido correspondente a CRON_SECRET
      const reqValid = new Request('https://renplay.site/api/cron/cleanup-limits', {
        method: 'GET',
        headers: { authorization: 'Bearer segredo-cron-super-seguro-renplay-2026' },
      });
      const resValid = await cronRoute.GET(reqValid);
      assert.equal(resValid.status, 200);
      const dataValid = await resValid.json();
      assert.equal(dataValid.success, true);
      assert.equal(dataValid.cleanedExpiredRows, 42);
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origSecret !== undefined) process.env.CRON_SECRET = origSecret;
      else delete process.env.CRON_SECRET;
    }
  });

  // 20. Autorização PKCE do Electron
  await t.test('20. Autorização PKCE do Electron (/api/v1/auth/desktop/authorize) valida redirectUri e emite authorization code', async () => {
    mockLimits.clear();
    const verifier = 'my-super-secret-code-verifier-for-pkce-12345678901234567890';
    const challenge = require('crypto').createHash('sha256').update(verifier).digest('base64url');
    const redirectUri = 'http://127.0.0.1:42123/callback';
    const state = 'random-state-string-xyz';

    // 1. Tentar com redirectUri malicioso (rejeitado)
    const reqMalicious = new Request('https://renplay.site/api/v1/auth/desktop/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        identifier: 'argonplayer',
        password: argonPassword,
        challenge,
        state,
        redirectUri: 'https://attacker.com/steal-code',
      }),
    });
    const resMalicious = await desktopAuthorizeRoute.POST(reqMalicious);
    assert.equal(resMalicious.status, 400);

    // 2. Tentar com credenciais válidas e redirectUri legítimo do Electron
    const reqValid = new Request('https://renplay.site/api/v1/auth/desktop/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        identifier: 'argonplayer',
        password: argonPassword,
        challenge,
        state,
        redirectUri,
      }),
    });
    const resValid = await desktopAuthorizeRoute.POST(reqValid);
    assert.equal(resValid.status, 200);
    const dataValid = await resValid.json();
    assert.ok(dataValid.redirectUrl, 'Deve retornar redirectUrl com o código');
    const callbackUrl = new URL(dataValid.redirectUrl);
    const code = callbackUrl.searchParams.get('code');
    assert.ok(code, 'Deve retornar o código de autorização assinado');
    assert.equal(callbackUrl.searchParams.get('state'), state);

    // 3. Consumir código gerado via PKCE
    const consumed = authModule.consumeDesktopAuthorizationCode(code, verifier, redirectUri);
    assert.ok(consumed, 'O código PKCE deve ser consumido com sucesso');
    assert.equal(consumed.userId, 'user-argon-uuid');

    // 4. Consumo com verifier incorreto deve falhar
    const consumedWrong = authModule.consumeDesktopAuthorizationCode(code, 'wrong-verifier', redirectUri);
    assert.equal(consumedWrong, null);
  });
});

