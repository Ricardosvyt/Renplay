const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');

function loadTsModule(file, dependencies = {}) {
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
    '@/lib/db': {
      getDb: () => ({
        query: async () => ({ rows: [] }),
        connect: async () => ({ query: async () => ({ rows: [] }), release() {} }),
      }),
    },
    '@/lib/auth': {
      hashToken: (t) => crypto.createHash('sha256').update(t).digest('hex'),
      hashPassword: async (pwd) => {
        const argon2 = require('argon2');
        return await argon2.hash(pwd, { type: argon2.argon2id });
      },
      verifyPasswordHash: async (pwd, hash) => {
        if (hash.startsWith('$argon2')) {
          const argon2 = require('argon2');
          return await argon2.verify(hash, pwd);
        }
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(pwd, hash);
      },
    },
    '@/lib/registration': {
      validateEmailFormat: (val) => {
        if (!val || typeof val !== 'string' || !val.includes('@')) {
          return { valid: false, error: 'Digite um endereço de e-mail válido.' };
        }
        return { valid: true, email: val.trim().toLowerCase() };
      },
      validatePasswordFormat: (pwd, options = {}) => {
        if (!pwd || typeof pwd !== 'string') return { valid: false, error: 'Crie uma senha para continuar.' };
        if (pwd.length < 12) return { valid: false, error: 'Sua senha deve ter pelo menos 12 caracteres.' };
        if (pwd.length > 128) return { valid: false, error: 'Sua senha pode ter no máximo 128 caracteres.' };
        if (options.checkConfirm && pwd !== options.confirmPassword) {
          return { valid: false, error: 'As senhas não coincidem.' };
        }
        return { valid: true };
      },
      checkPwnedPassword: async () => ({ pwned: false }),
    },
    resend: {
      Resend: class {
        constructor() {
          this.emails = {
            send: async (payload) => {
              sentEmails.push(payload);
              return { error: null };
            },
          };
        }
      },
    },
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
    setTimeout,
    clearTimeout,
    require: (name) => {
      if (name in defaultMocks) return defaultMocks[name];
      return require(name);
    },
  });
  return module.exports;
}

let sentEmails = [];

// Stateful in-memory database simulation for testing
function createMockDb() {
  const users = new Map();
  const resets = new Map();
  const limits = new Map();
  const sessions = new Map();

  // Seed default test user
  users.set('usr-1', {
    id: 'usr-1',
    email: 'membro@renplay.site',
    username: 'membro',
    password_hash: '$2b$10$oldpasswordhashhere',
    active: true,
    banned: false,
  });

  // Seed active session
  sessions.set('sess-1', {
    id: 'sess-1',
    user_id: 'usr-1',
    token_hash: 'session-hash-1',
    kind: 'web',
    revoked_at: null,
  });

  function runQuery(sql, params = []) {
    const s = sql.trim();

    // 1. Check rate limits
    if (s.includes('INSERT INTO rp_limits')) {
      const key = params[0];
      const current = limits.get(key) || 0;
      limits.set(key, current + 1);
      return { rows: [{ hits: current + 1 }] };
    }

    // 2. Select user by email
    if (s.includes('SELECT id, active, banned FROM rp_users WHERE email = $1')) {
      const email = params[0];
      for (const u of users.values()) {
        if (u.email === email) {
          return { rows: [u] };
        }
      }
      return { rows: [] };
    }

    if (s.includes('SELECT id FROM rp_users WHERE email = $1')) {
      const email = params[0];
      for (const u of users.values()) {
        if (u.email === email) {
          return { rows: [{ id: u.id }] };
        }
      }
      return { rows: [] };
    }

    // 3. Check recent request cooldown
    if (s.includes('SELECT created_at FROM rp_password_resets') && s.includes("interval '60 seconds'")) {
      const userId = params[0];
      const matching = [...resets.values()]
        .filter(r => r.user_id === userId && ['PENDING', 'VERIFIED'].includes(r.status) && (Date.now() - r.created_at.getTime() < 60_000))
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: matching.slice(0, 1) };
    }

    // 4. Invalidate previous requests
    if (s.includes('UPDATE rp_password_resets') && s.includes("SET status = 'REVOKED'")) {
      const userId = params[0];
      for (const r of resets.values()) {
        if (r.user_id === userId && ['PENDING', 'VERIFIED'].includes(r.status)) {
          r.status = 'REVOKED';
        }
      }
      return { rows: [] };
    }

    // 4.1 Expire request
    if (s.includes("SET status = 'EXPIRED'")) {
      const id = params[0];
      const r = resets.get(id);
      if (r) r.status = 'EXPIRED';
      return { rows: [] };
    }

    // 5. Insert new password reset request
    if (s.includes('INSERT INTO rp_password_resets')) {
      const id = 'req-' + Math.random().toString(36).slice(2, 9);
      const record = {
        id,
        user_id: params[0],
        code_hmac: params[1],
        expires_at: params[2],
        max_attempts: params[3] || 5,
        attempts_count: 0,
        status: 'PENDING',
        created_at: new Date(),
        reset_token_hash: null,
        reset_token_expires_at: null,
        consumed_at: null,
      };
      resets.set(id, record);
      return { rows: [{ id }] };
    }

    // 6. Select pending reset request FOR UPDATE
    if (s.includes('SELECT id, code_hmac, attempts_count, max_attempts, expires_at, status') && s.includes('rp_password_resets')) {
      const userId = params[0];
      const matching = [...resets.values()]
        .filter(r => r.user_id === userId && r.status === 'PENDING')
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: matching.slice(0, 1) };
    }

    // 7. Update attempts or revoke in verify
    if (s.includes('UPDATE rp_password_resets') && s.includes('attempts_count = $1')) {
      const newAttempts = params[0];
      const isRevoked = params[1];
      const id = params[2];
      const r = resets.get(id);
      if (r) {
        r.attempts_count = newAttempts;
        if (isRevoked) r.status = 'REVOKED';
      }
      return { rows: [] };
    }

    // 8. Update verified reset request
    if (s.includes('UPDATE rp_password_resets') && s.includes("SET status = 'VERIFIED'")) {
      const tokenHash = params[0];
      const tokenExpires = params[1];
      const id = params[2];
      const r = resets.get(id);
      if (r) {
        r.status = 'VERIFIED';
        r.reset_token_hash = tokenHash;
        r.reset_token_expires_at = tokenExpires;
      }
      return { rows: [] };
    }

    // 9. Select verified reset request by reset_token_hash
    if (s.includes('SELECT id, user_id, reset_token_expires_at, status') && s.includes('reset_token_hash = $1')) {
      const tokenHash = params[0];
      for (const r of resets.values()) {
        if (r.reset_token_hash === tokenHash && r.status === 'VERIFIED') {
          return { rows: [r] };
        }
      }
      return { rows: [] };
    }

    // 10. Update user password
    if (s.includes('UPDATE rp_users') && s.includes('SET password_hash = $1')) {
      const newHash = params[0];
      const userId = params[1];
      const u = users.get(userId);
      if (u) u.password_hash = newHash;
      return { rows: [] };
    }

    // 11. Consume reset token
    if (s.includes("SET status = 'CONSUMED'")) {
      const id = params[0];
      const r = resets.get(id);
      if (r) {
        r.status = 'CONSUMED';
        r.consumed_at = new Date();
        r.reset_token_hash = null;
      }
      return { rows: [] };
    }

    // 12. Revoke user sessions
    if (s.includes('UPDATE rp_sessions') && s.includes('SET revoked_at = now()')) {
      const userId = params[0];
      for (const s of sessions.values()) {
        if (s.user_id === userId) {
          s.revoked_at = new Date();
        }
      }
      return { rows: [] };
    }

    // Generic transaction commands
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(s)) {
      return { rows: [] };
    }

    return { rows: [] };
  }

  const dbClient = {
    query: async (sql, params = []) => runQuery(sql, params),
    connect: async () => ({
      query: async (sql, params = []) => runQuery(sql, params),
      release() {},
    }),
  };

  return {
    users,
    resets,
    limits,
    sessions,
    getDb: () => dbClient,
  };
}

test('Recuperação de Senha — Testes Automatizados Completos', async (t) => {
  const mockDb = createMockDb();
  let capturedCode = null;

  const recoveryLib = loadTsModule('src/lib/password-recovery.ts', {
    '@/lib/db': {
      getDb: () => mockDb.getDb(),
    },
  });

  // Injetar sender mock para interceptar o código gerado nos testes
  recoveryLib.setMockEmailSender(async ({ to, code }) => {
    capturedCode = code;
    return { success: true };
  });

  const dummyRequest = new Request('http://localhost:3000/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });

  await t.test('1. E-mail existente gera código de 6 dígitos, envia e-mail e retorna mensagem genérica', async () => {
    capturedCode = null;
    const res = await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    assert.equal(res.success, true);
    assert.equal(res.message, 'Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.');
    assert.ok(capturedCode, 'O código de 6 dígitos foi gerado e enviado');
    assert.match(capturedCode, /^\d{6}$/, 'O código tem exatamente 6 dígitos');
  });

  await t.test('2. Proteção contra enumeração: E-mail inexistente retorna resposta idêntica e não gera código', async () => {
    capturedCode = null;
    const res = await recoveryLib.requestPasswordReset(dummyRequest, 'desconhecido@exemplo.com');
    assert.equal(res.success, true);
    assert.equal(res.message, 'Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.');
    assert.equal(capturedCode, null, 'Nenhum código foi gerado para conta inexistente');
  });

  await t.test('3. Limite de reenvios: Reenvio antes de 60 segundos é bloqueado', async () => {
    const res = await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    assert.equal(res.success, false);
    assert.equal(res.message, 'Aguarde antes de solicitar um novo código.');
  });

  await t.test('4. Falha no Resend: Erro na API do Resend reverte a criação do código', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    recoveryLib.setMockEmailSender(async () => {
      return { success: false, error: 'API Error' };
    });

    const res = await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    assert.equal(res.success, false);
    assert.match(res.message, /Não foi possível enviar o e-mail/);

    // Restaurar mock
    recoveryLib.setMockEmailSender(async ({ to, code }) => {
      capturedCode = code;
      return { success: true };
    });
  });

  await t.test('5. Código incorreto é rejeitado e incrementa tentativas', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    const validCode = capturedCode;
    assert.ok(validCode);

    const failRes = await recoveryLib.verifyRecoveryCode('membro@renplay.site', '000000');
    assert.equal(failRes.success, false);
    assert.equal(failRes.message, 'Código inválido ou expirado.');
  });

  await t.test('6. Limite de tentativas: 5 códigos errados revogam a solicitação', async () => {
    // Errar mais 4 vezes (total 5)
    for (let i = 0; i < 3; i++) {
      const r = await recoveryLib.verifyRecoveryCode('membro@renplay.site', '111111');
      assert.equal(r.success, false);
    }
    const fifthAttempt = await recoveryLib.verifyRecoveryCode('membro@renplay.site', '222222');
    assert.equal(fifthAttempt.success, false);
    assert.equal(fifthAttempt.message, 'Você excedeu o número de tentativas. Solicite outro código.');

    // Tentativa com o código original agora é rejeitada porque foi revogada
    const afterRevoke = await recoveryLib.verifyRecoveryCode('membro@renplay.site', capturedCode);
    assert.equal(afterRevoke.success, false);
    assert.equal(afterRevoke.message, 'Código inválido ou expirado.');
  });

  await t.test('7. Código expirado é rejeitado', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    const freshCode = capturedCode;

    // Forçar data de expiração no passado
    for (const r of mockDb.resets.values()) {
      if (r.status === 'PENDING') {
        r.expires_at = new Date(Date.now() - 1000);
      }
    }

    const res = await recoveryLib.verifyRecoveryCode('membro@renplay.site', freshCode);
    assert.equal(res.success, false);
    assert.equal(res.message, 'Código inválido ou expirado.');
  });

  await t.test('8. Código correto valida com sucesso e emite resetToken de uso único', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    const reqRes = await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    assert.equal(reqRes.success, true);
    const correctCode = capturedCode;

    const res = await recoveryLib.verifyRecoveryCode('membro@renplay.site', correctCode);
    assert.equal(res.success, true);
    assert.ok(res.resetToken, 'Token de redefinição emitido');
    assert.ok(res.resetToken.length >= 32, 'Token possui tamanho criptográfico seguro');

    // Código não pode ser reutilizado
    const reuseRes = await recoveryLib.verifyRecoveryCode('membro@renplay.site', correctCode);
    assert.equal(reuseRes.success, false);
    assert.equal(reuseRes.message, 'Código inválido ou expirado.');
  });

  await t.test('9. Redefinição com senha inválida ou não coincidente é rejeitada', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    const { resetToken } = await recoveryLib.verifyRecoveryCode('membro@renplay.site', capturedCode);

    // Senha com menos de 12 caracteres
    const shortRes = await recoveryLib.executePasswordReset(resetToken, 'Curta1!', 'Curta1!');
    assert.equal(shortRes.success, false);
    assert.match(shortRes.message, /pelo menos 12 caracteres/);

    // Senhas não coincidem
    const mismatchRes = await recoveryLib.executePasswordReset(resetToken, 'SenhaNovaSegura123', 'OutraSenha456');
    assert.equal(mismatchRes.success, false);
    assert.match(mismatchRes.message, /não coincidem/);
  });

  await t.test('10. Redefinição com senha válida atualiza Argon2id, consome token e revoga sessões', async () => {
    mockDb.limits.clear();
    for (const r of mockDb.resets.values()) {
      r.created_at = new Date(Date.now() - 65_000);
    }
    await recoveryLib.requestPasswordReset(dummyRequest, 'membro@renplay.site');
    const { resetToken } = await recoveryLib.verifyRecoveryCode('membro@renplay.site', capturedCode);

    // Verificar que a sessão ativa existe antes da redefinição
    const activeSessionBefore = mockDb.sessions.get('sess-1');
    assert.equal(activeSessionBefore.revoked_at, null);

    // Executar redefinição com senha segura
    const successRes = await recoveryLib.executePasswordReset(resetToken, 'NovaSenhaForte2026!#', 'NovaSenhaForte2026!#');
    assert.equal(successRes.success, true);
    assert.match(successRes.message, /Senha redefinida com sucesso/);

    // 10.1 Nova senha foi gravada com Argon2id
    const user = mockDb.users.get('usr-1');
    assert.ok(user.password_hash.startsWith('$argon2'), 'Senha armazenada com hash Argon2id');

    // 10.2 Sessões antigas foram revogadas
    const activeSessionAfter = mockDb.sessions.get('sess-1');
    assert.ok(activeSessionAfter.revoked_at !== null, 'Sessão antiga foi revogada com revoked_at preenchido');

    // 10.3 Token de redefinição foi consumido definitivamente e não pode ser reutilizado
    const reuseTokenRes = await recoveryLib.executePasswordReset(resetToken, 'OutraSenhaValida999', 'OutraSenhaValida999');
    assert.equal(reuseTokenRes.success, false);
    assert.match(reuseTokenRes.message, /inválida ou expirada/);
  });
});
