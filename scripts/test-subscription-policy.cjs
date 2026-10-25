const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/subscriptions.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleRef = { exports: {} };
vm.runInNewContext(compiled, { module: moduleRef, exports: moduleRef.exports,
  require: name => name === '@/lib/db' ? { getDb: () => { throw new Error('Banco não deve ser chamado neste teste.'); } } : require(name), Date });
const { effectiveSubscription } = moduleRef.exports;
const now = new Date('2026-12-15T12:00:00Z');
const paid = (level, end, extras = {}) => ({ vip_level: level, subscription_status: 'ACTIVE',
  current_period_end: new Date(end), cancel_at_period_end: false,
  grace_expires_at: null, last_payment_confirmed_at: new Date('2026-12-01T00:00:00Z'), ...extras });

test('três planos têm limites globais distintos', () => {
  for (const [level, saves, bytes] of [[1, 50, 150_000_000], [2, 150, 500_000_000], [3, 400, 1_500_000_000]]) {
    const state = effectiveSubscription(paid(level, '2027-01-01T00:00:00Z'), now);
    assert.equal(state.canUpload, true);
    assert.equal(state.maxSaves, saves);
    assert.equal(state.maxBytes, bytes);
  }
});

test('cancelamento conserva upload até o fim do período pago', () => {
  const state = effectiveSubscription(paid(2, '2027-01-01T00:00:00Z', { cancel_at_period_end: true,
    subscription_status: 'CANCELED_BUT_ACTIVE' }), now);
  assert.equal(state.status, 'CANCELED_BUT_ACTIVE');
  assert.equal(state.canUpload, true);
});

test('carência começa no vencimento, dura 30 dias e permite download', () => {
  const row = paid(1, '2026-12-01T12:00:00Z');
  const state = effectiveSubscription(row, now);
  assert.equal(state.status, 'GRACE_PERIOD');
  assert.equal(state.canUpload, false);
  assert.equal(state.canDownload, true);
  assert.equal(state.graceExpiresAt, '2026-12-31T12:00:00.000Z');
  const expired = effectiveSubscription(row, new Date('2026-12-31T12:00:00Z'));
  assert.equal(expired.status, 'DELETION_PENDING');
  assert.equal(expired.canDownload, false);
});

test('sem pagamento confirmado nenhum cargo ou nível libera upload', () => {
  const row = paid(3, '2027-01-01T00:00:00Z', { last_payment_confirmed_at: null });
  assert.equal(effectiveSubscription(row, now).canUpload, false);
  assert.equal(effectiveSubscription(null, now).canUpload, false);
});

test('VIP antigo em revisão recupera saves, sem poder enviar outros', () => {
  const state = effectiveSubscription({ vip_level: 0, subscription_status: 'LEGACY_REVIEW',
    current_period_end: null, cancel_at_period_end: false, grace_expires_at: null,
    last_payment_confirmed_at: null }, now);
  assert.equal(state.canDownload, true);
  assert.equal(state.canUpload, false);
});
