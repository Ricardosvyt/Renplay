const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, Buffer, Request, Response, process, require: name => { if (name in dependencies) return dependencies[name]; return require(name); } });
  return module.exports;
}
const validation = load('src/lib/registration.ts');
const valid = { username: 'Player123', email: 'Player@Example.com', password: 'Uma frase longa segura 987', displayName: 'Player' };
test('normalizes username/email; rejects punctuation, invalid types, privilege fields and bcrypt truncation', () => {
  assert.equal(validation.validateRegistration(valid).email, 'player@example.com');
  assert.equal(validation.validateRegistration(valid).username, 'player123');
  for (const username of ['a', 'user_name', 'user.name', 'user-name', 'ábc', 'user name', 'x'.repeat(25), 'admin', 'renplay', 'support', {}, null]) assert.throws(() => validation.validateRegistration({ ...valid, username }));
  assert.throws(() => validation.validateRegistration({ ...valid, username: '' }), /Informe um nome de usuário\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'ab' }), /O nome deve ter pelo menos 3 caracteres\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'a'.repeat(25) }), /O nome pode ter no máximo 24 caracteres\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'user name' }), /O nome de usuário não pode conter espaços\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'usuário' }), /Não utilize letras com acentos\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'user_name' }), /Use apenas letras e números\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'admin' }), /Este nome de usuário não está disponível\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'renplay' }), /Este nome de usuário não está disponível\./);
  assert.throws(() => validation.validateRegistration({ ...valid, username: 'support' }), /Este nome de usuário não está disponível\./);
  for (const email of ['x@y', '.x@example.com', 'x..y@example.com', 'x@-example.com', {}, 'x'.repeat(255), 'user@mailinator.com', 'user@10minutemail.com']) assert.throws(() => validation.validateRegistration({ ...valid, email }));
  assert.throws(() => validation.validateRegistration({ ...valid, email: '' }), /Informe seu endereço de e-mail\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'user @example.com' }), /O e-mail não pode conter espaços\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'a'.repeat(255) }), /O endereço de e-mail é muito longo\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'userexample.com' }), /O e-mail deve conter @\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'user@' }), /Informe um domínio de e-mail válido\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'user..name@example.com' }), /Digite um endereço de e-mail válido\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'user@mailinator.com' }), /E-mails temporários ou descartáveis não são permitidos\./);
  assert.throws(() => validation.validateRegistration({ ...valid, email: 'user@10minutemail.com' }), /E-mails temporários ou descartáveis não são permitidos\./);
  for (const password of ['short', 'a'.repeat(129), 123]) assert.throws(() => validation.validateRegistration({ ...valid, password }));
  assert.throws(() => validation.validateRegistration({ ...valid, password: '' }), /Crie uma senha para continuar\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'short' }), /Sua senha deve ter pelo menos 12 caracteres\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'a'.repeat(129) }), /Sua senha pode ter no máximo 128 caracteres\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'player123' }), /Escolha uma senha diferente do seu nome de usuário\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'password12345' }), /Esta senha é muito comum\. Escolha uma mais segura\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'Uma frase longa segura 987', confirmPassword: '' }), /Confirme sua senha para continuar\./);
  assert.throws(() => validation.validateRegistration({ ...valid, password: 'Uma frase longa segura 987', confirmPassword: 'outra senha diferente' }), /As senhas não coincidem\./);
  for (const extra of [{ role: 'ADMIN' }, { roles: ['ADMIN'] }, { email_verified: true }]) assert.throws(() => validation.validateRegistration({ ...valid, ...extra }));
  for (const body of [null, [], 'test', {}]) assert.throws(() => validation.validateRegistration(body));
});
test('body parser rejects malformed and oversized JSON without trusting Content-Length', async () => {
  for (const body of ['{', JSON.stringify({ text: 'x'.repeat(4097) })]) await assert.rejects(validation.readRegistrationBody(new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })));
});
function routeHarness({ duplicate = false, sessionFail = false, allowed = true, skipPwned = true } = {}) {
  const queries = [];
  const client = { async query(sql, values) { queries.push({ sql, values }); if (sql.startsWith('INSERT INTO rp_users')) { if (duplicate) throw Object.assign(new Error('duplicate'), { code: '23505' }); return { rows: [{ id: 'test-user', username: 'player123', email: 'player@example.com' }] }; } return { rows: [] }; }, release() {} };
  if (skipPwned) process.env.SKIP_PWNED_CHECK = 'true';
  else delete process.env.SKIP_PWNED_CHECK;
  const route = load('src/app/api/v1/auth/register/route.ts', {
    'next/server': { NextResponse: Response }, '@/lib/registration': validation,
    '@/lib/db': { getDb: () => ({ connect: async () => client }) },
    '@/lib/launcher-rate-limit': { allowLauncherAuth: async () => allowed },
    '@/lib/auth': {
      hashPassword: async () => '$argon2id$v=19$m=65536,t=3,p=4$dummy',
      createDesktopSession: async (_id, transaction) => { assert.equal(transaction, client); if (sessionFail) throw Error('session failure'); return { accessToken: 'test-token', refreshToken: 'test-refresh' }; }
    }
  });
  return { queries, post: body => route.POST(new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })) };
}
test('registration assigns only USER and commits after session creation', async () => {
  const harness = routeHarness(); const response = await harness.post(valid);
  assert.equal(response.status, 201);
  assert.ok(harness.queries.some(q => q.sql.includes("VALUES ($1, 'USER')")));
  assert.equal(harness.queries.at(-1).sql, 'COMMIT');
});
test('validatePasswordFormat enforces OWASP/NIST password rules and returns exact messages', () => {
  assert.equal(validation.validatePasswordFormat('Uma frase longa segura 987').valid, true);
  assert.equal(validation.validatePasswordFormat('').error, 'Crie uma senha para continuar.');
  assert.equal(validation.validatePasswordFormat('curta').error, 'Sua senha deve ter pelo menos 12 caracteres.');
  assert.equal(validation.validatePasswordFormat('a'.repeat(129)).error, 'Sua senha pode ter no máximo 128 caracteres.');
  assert.equal(validation.validatePasswordFormat('player123', { username: 'Player123' }).error, 'Escolha uma senha diferente do seu nome de usuário.');
  assert.equal(validation.validatePasswordFormat('123456789012').error, 'Esta senha é muito comum. Escolha uma mais segura.');
  assert.equal(validation.validatePasswordFormat('password12345').error, 'Esta senha é muito comum. Escolha uma mais segura.');
  assert.equal(validation.validatePasswordFormat('Uma frase longa segura 987', { checkConfirm: true, confirmPassword: '' }).error, 'Confirme sua senha para continuar.');
  assert.equal(validation.validatePasswordFormat('Uma frase longa segura 987', { checkConfirm: true, confirmPassword: 'outra senha' }).error, 'As senhas não coincidem.');
});
test('duplicate and session failures rollback; rate limits prevent database writes', async () => {
  for (const options of [{ duplicate: true }, { sessionFail: true }]) {
    const harness = routeHarness(options); const response = await harness.post(valid);
    assert.equal(response.status, options.duplicate ? 409 : 503);
    assert.equal(harness.queries.at(-1).sql, 'ROLLBACK');
  }
  const harness = routeHarness({ allowed: false });
  assert.equal((await harness.post(valid)).status, 429); assert.equal(harness.queries.length, 0);
  const invalid = routeHarness(); assert.equal((await invalid.post({ ...valid, role: 'ADMIN' })).status, 400); assert.equal(invalid.queries.length, 0);
});
