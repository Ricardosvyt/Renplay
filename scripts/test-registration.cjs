const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, Buffer, Request, Response, require: name => { if (name in dependencies) return dependencies[name]; throw Error('Unexpected import: ' + name); } });
  return module.exports;
}
const validation = load('src/lib/registration.ts');
const valid = { username: 'Player123', email: 'Player@Example.com', password: 'Uma frase longa segura 987', displayName: 'Player' };
test('normalizes username/email; rejects punctuation, invalid types, privilege fields and bcrypt truncation', () => {
  assert.equal(validation.validateRegistration(valid).email, 'player@example.com');
  assert.equal(validation.validateRegistration(valid).username, 'player123');
  for (const username of ['a', 'user_name', 'user.name', 'user-name', 'ábc', 'user name', 'x'.repeat(33), {}, null]) assert.throws(() => validation.validateRegistration({ ...valid, username }));
  for (const email of ['x@y', '.x@example.com', 'x..y@example.com', 'x@-example.com', {}, 'x'.repeat(255)]) assert.throws(() => validation.validateRegistration({ ...valid, email }));
  for (const password of ['short', 'a'.repeat(73), '😀'.repeat(19), 123]) assert.throws(() => validation.validateRegistration({ ...valid, password }));
  for (const extra of [{ role: 'ADMIN' }, { roles: ['ADMIN'] }, { email_verified: true }]) assert.throws(() => validation.validateRegistration({ ...valid, ...extra }));
  for (const body of [null, [], 'test', {}]) assert.throws(() => validation.validateRegistration(body));
});
test('body parser rejects malformed and oversized JSON without trusting Content-Length', async () => {
  for (const body of ['{', JSON.stringify({ text: 'x'.repeat(4097) })]) await assert.rejects(validation.readRegistrationBody(new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })));
});
function routeHarness({ duplicate = false, sessionFail = false, allowed = true } = {}) {
  const queries = [];
  const client = { async query(sql, values) { queries.push({ sql, values }); if (sql.startsWith('INSERT INTO rp_users')) { if (duplicate) throw Object.assign(new Error('duplicate'), { code: '23505' }); return { rows: [{ id: 'test-user', username: 'player123', email: 'player@example.com' }] }; } return { rows: [] }; }, release() {} };
  const route = load('src/app/api/v1/auth/register/route.ts', {
    'next/server': { NextResponse: Response }, bcryptjs: { hash: async () => 'test-hash' }, '@/lib/registration': validation,
    '@/lib/db': { getDb: () => ({ connect: async () => client }) },
    '@/lib/launcher-rate-limit': { allowLauncherAuth: async () => allowed },
    '@/lib/auth': { createDesktopSession: async (_id, transaction) => { assert.equal(transaction, client); if (sessionFail) throw Error('session failure'); return { accessToken: 'test-token', refreshToken: 'test-refresh' }; } }
  });
  return { queries, post: body => route.POST(new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })) };
}
test('registration assigns only USER and commits after session creation', async () => {
  const harness = routeHarness(); const response = await harness.post(valid);
  assert.equal(response.status, 201);
  assert.ok(harness.queries.some(q => q.sql.includes("VALUES ($1, 'USER')")));
  assert.equal(harness.queries.at(-1).sql, 'COMMIT');
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
