const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');

function loadModule(file, dependencies = {}) {
  const module = { exports: {} };
  const raw = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(raw, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;

  const defaultMocks = {
    '@/lib/db': { getDb: () => ({ query: async () => ({ rows: [] }), connect: async () => ({ query: async () => ({ rows: [] }), release() {} }) }) },
    'next/headers': { cookies: async () => ({ get: () => undefined, set() {} }) },
    ...dependencies,
  };

  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    Buffer,
    Request,
    Response,
    URL,
    process,
    console,
    require: name => {
      if (name in defaultMocks) return defaultMocks[name];
      if (name.startsWith('@/')) {
        const path = require('node:path');
        const resolved = path.resolve(__dirname, '..', name.replace('@/', 'src/') + '.ts');
        if (fs.existsSync(resolved)) return loadModule(resolved, defaultMocks);
      }
      return require(name);
    },
  });
  return module.exports;
}

const auth = loadModule('src/lib/auth.ts');
const permissions = loadModule('src/lib/permissions.ts');

test('1. Cookie falso ou arbitrário não concede acesso a páginas ou dados protegidos', async () => {
  // 1.1 Avaliação de acesso a rotas sem sessão válida
  const resDashboard = permissions.evaluateRouteAccess(null, '/dashboard');
  assert.equal(resDashboard.allowed, false);
  assert.equal(resDashboard.redirectUrl, '/login?next=%2Fdashboard');

  const resUsuarios = permissions.evaluateRouteAccess(null, '/dashboard/usuarios');
  assert.equal(resUsuarios.allowed, false);
  assert.equal(resUsuarios.redirectUrl, '/login?next=%2Fdashboard%2Fusuarios');

  const resDev = permissions.evaluateRouteAccess(null, '/dev');
  assert.equal(resDev.allowed, false);
  assert.equal(resDev.redirectUrl, '/login?next=%2Fdev');

  // 1.2 Formato inválido é rejeitado imediatamente
  assert.equal(await auth.getUserBySessionToken(''), null);
  assert.equal(await auth.getUserBySessionToken('curto'), null);
  assert.equal(await auth.getUserBySessionToken(null), null);
});

test('2. Sessão revogada ou expirada não concede acesso', async () => {
  // Harness simulando banco onde a sessão foi revogada
  const clientMock = {
    async query(sql, values) {
      // Como a query do getUserBySessionToken filtra revoked_at IS NULL e expires_at > now(),
      // uma sessão revogada retorna 0 linhas.
      return { rows: [] };
    },
  };

  const authWithMockDb = loadModule('src/lib/auth.ts', {
    '@/lib/db': { getDb: () => clientMock },
  });

  const validTokenFormat = 'a'.repeat(43);
  const user = await authWithMockDb.getUserBySessionToken(validTokenFormat);
  assert.equal(user, null);

  const routeCheck = permissions.evaluateRouteAccess(user, '/dashboard');
  assert.equal(routeCheck.allowed, false);
  assert.equal(routeCheck.reason, 'UNAUTHENTICATED');
});

test('3. Usuário comum ou VIP não acessa recursos administrativos; Desenvolvedor acessa apenas áreas autorizadas', () => {
  const regularUser = { id: 'u1', username: 'player', email: 'p@test.com', active: true, roles: ['USER'] };
  const vipUser = { id: 'u2', username: 'vip', email: 'v@test.com', active: true, roles: ['USER', 'VIP'] };
  const developer = { id: 'u3', username: 'dev', email: 'd@test.com', active: true, roles: ['DEVELOPER', 'USER'] };

  // Usuário comum barrado do dashboard geral e redirecionado para seu portal
  const regDash = permissions.evaluateRouteAccess(regularUser, '/dashboard');
  assert.equal(regDash.allowed, false);
  assert.equal(regDash.redirectUrl, '/portal');

  const regUsers = permissions.evaluateRouteAccess(regularUser, '/dashboard/usuarios');
  assert.equal(regUsers.allowed, false);

  const regDev = permissions.evaluateRouteAccess(regularUser, '/dev');
  assert.equal(regDev.allowed, false);

  // VIP barrado do dashboard geral
  const vipDash = permissions.evaluateRouteAccess(vipUser, '/dashboard');
  assert.equal(vipDash.allowed, false);
  assert.equal(vipDash.redirectUrl, '/portal');

  // Desenvolvedor acessa dashboard, jogos e portal dev
  assert.equal(permissions.evaluateRouteAccess(developer, '/dashboard').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(developer, '/dashboard/jogos/publish').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(developer, '/dev').allowed, true);

  // Desenvolvedor NÃO acessa gestão de usuários nem configurações globais
  const devUsers = permissions.evaluateRouteAccess(developer, '/dashboard/usuarios');
  assert.equal(devUsers.allowed, false);
  assert.equal(devUsers.redirectUrl, '/dashboard');

  const devConfig = permissions.evaluateRouteAccess(developer, '/dashboard/configuracoes');
  assert.equal(devConfig.allowed, false);
  assert.equal(devConfig.redirectUrl, '/dashboard');
});

test('4. Administrador válido acessa todos os recursos autorizados', () => {
  const admin = { id: 'adm-1', username: 'admin', email: 'admin@renplay.com', active: true, roles: ['ADMIN', 'USER'] };

  assert.equal(permissions.evaluateRouteAccess(admin, '/dashboard').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(admin, '/dashboard/usuarios').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(admin, '/dashboard/configuracoes').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(admin, '/dashboard/jogos/publish').allowed, true);
  assert.equal(permissions.evaluateRouteAccess(admin, '/dev').allowed, true);
});

test('5. Login com Argon2id funciona no verificador central e rotas de login/autorização', async () => {
  const password = 'MinhaSenhaSeguraArgon2id!2026';
  const argonHash = await auth.hashPassword(password);
  assert.ok(argonHash.startsWith('$argon2id$'));

  // Verificação direta com verifyPasswordHash
  const isValid = await auth.verifyPasswordHash(password, argonHash);
  assert.equal(isValid, true);

  // Verificação na rota de autorização PKCE do launcher
  const clientMock = {
    async query(sql, values) {
      if (sql.includes('SELECT id, username, email, password_hash')) {
        return {
          rows: [{
            id: 'user-argon',
            username: 'argonplayer',
            email: 'argon@test.com',
            password_hash: argonHash,
            active: true,
            banned: false,
            banned_until: null,
          }],
        };
      }
      return { rows: [] };
    },
  };

  const desktopAuth = loadModule('src/app/api/v1/auth/desktop/authorize/route.ts', {
    '@/lib/db': { getDb: () => clientMock },
    '@/lib/auth': auth,
    '@/lib/launcher-rate-limit': { allowLauncherAuth: async () => true },
    'next/server': { NextResponse: Response },
  });

  const response = await desktopAuth.POST(new Request('https://test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'argonplayer',
      password: password,
      challenge: 'test-challenge',
      state: 'test-state',
      redirectUri: 'http://127.0.0.1:4000/callback',
    }),
  }));

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.redirectUrl.includes('code='));
  assert.ok(data.redirectUrl.includes('state=test-state'));
});

test('6. Login legado com bcrypt continua funcionando normalmente', async () => {
  const password = 'SenhaAntigaBcrypt123!';
  const bcryptHash = await bcrypt.hash(password, 10);
  assert.ok(bcryptHash.startsWith('$2'));

  // Verificação direta com verifyPasswordHash
  const isValid = await auth.verifyPasswordHash(password, bcryptHash);
  assert.equal(isValid, true);

  // Verificação na rota de autorização PKCE com hash bcrypt legado
  const clientMock = {
    async query(sql) {
      if (sql.includes('SELECT id, username, email, password_hash')) {
        return {
          rows: [{
            id: 'user-bcrypt',
            username: 'legacyuser',
            email: 'legacy@test.com',
            password_hash: bcryptHash,
            active: true,
            banned: false,
            banned_until: null,
          }],
        };
      }
      return { rows: [] };
    },
  };

  const desktopAuth = loadModule('src/app/api/v1/auth/desktop/authorize/route.ts', {
    '@/lib/db': { getDb: () => clientMock },
    '@/lib/auth': auth,
    '@/lib/launcher-rate-limit': { allowLauncherAuth: async () => true },
    'next/server': { NextResponse: Response },
  });

  const response = await desktopAuth.POST(new Request('https://test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'legacyuser',
      password: password,
      challenge: 'test-challenge',
      state: 'test-state',
      redirectUri: 'http://127.0.0.1:4000/callback',
    }),
  }));

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.redirectUrl.includes('code='));
});

test('7. Login com senha incorreta é rejeitado para Argon2id e bcrypt', async () => {
  const argonHash = await auth.hashPassword('SenhaCorreta123!');
  const bcryptHash = await bcrypt.hash('SenhaCorreta123!', 10);

  // Verificador central rejeita senha errada
  assert.equal(await auth.verifyPasswordHash('SenhaErrada!', argonHash), false);
  assert.equal(await auth.verifyPasswordHash('SenhaErrada!', bcryptHash), false);

  // Rota PKCE rejeita senha incorreta
  const clientMock = {
    async query(sql) {
      if (sql.includes('SELECT id, username, email, password_hash')) {
        return {
          rows: [{
            id: 'user-test',
            username: 'testuser',
            email: 'test@test.com',
            password_hash: argonHash,
            active: true,
            banned: false,
            banned_until: null,
          }],
        };
      }
      return { rows: [] };
    },
  };

  const desktopAuth = loadModule('src/app/api/v1/auth/desktop/authorize/route.ts', {
    '@/lib/db': { getDb: () => clientMock },
    '@/lib/auth': auth,
    '@/lib/launcher-rate-limit': { allowLauncherAuth: async () => true },
    'next/server': { NextResponse: Response },
  });

  const response = await desktopAuth.POST(new Request('https://test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'testuser',
      password: 'SenhaErrada!',
      challenge: 'test-challenge',
      state: 'test-state',
      redirectUri: 'http://127.0.0.1:4000/callback',
    }),
  }));

  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.error.code, 'INVALID_CREDENTIALS');
  assert.equal(data.error.message, 'E-mail/usuário ou senha inválidos.');
});
