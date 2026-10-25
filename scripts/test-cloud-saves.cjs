const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function service(subscription) {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/cloud-saves.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const db = { query: async sql => {
    if (sql.includes('confirmed_bytes FROM rp_cloud_storage_usage')) return { rows: [{ confirmed_bytes: '1024' }] };
    if (sql.includes('count(*)::text AS total FROM rp_cloud_saves')) return { rows: [{ total: '1' }] };
    if (sql.includes('FROM rp_cloud_saves')) return { rows: [{ id: 'save', user_id: 'user', game_id: 'old-key', slot_number: 1,
      original_filename: '1-1.save', file_size: '1024', sha256: 'a'.repeat(64), version: 1,
      game_version: '1', metadata: {}, updated_at: '2026-10-24T00:00:00Z' }] };
    throw new Error('Consulta inesperada: ' + sql);
  } };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, Date, console, process,
    require: name => ({
      '@/lib/db': { getDb: () => db },
      '@/lib/subscriptions': { getSubscription: async () => subscription },
      '@/lib/game-ids': { resolveGameId: async () => 'old-key', publicGameId: async () => '100001' },
      '@/lib/cloud-storage': { isR2Configured: () => true, isMockStorageEnabled: () => false }
    })[name] || require(name) });
  return mod.exports;
}

const user = { id: 'user', active: true, roles: ['USER', 'VIP', 'ADMIN'] };

test('slots 1 a 400 aceitos; slot 401 rejeitado', () => {
  const api = service({ canUpload: false });
  assert.equal(api.validateSlotNumber(400, 400), 400);
  assert.throws(() => api.validateSlotNumber(401, 400));
});

test('cargo VIP/ADMIN sem assinatura paga não autoriza upload', async () => {
  const api = service({ canUpload: false });
  await assert.rejects(api.initCloudSaveUpload({ user, gameId: '100001', slotNumber: 1,
    filename: '1-1.save', fileSizeBytes: 1024, sha256: 'a'.repeat(64) }), /Premium/);
});

test('carência lista save pelo ID público e cota global', async () => {
  const api = service({ canDownload: true, maxBytes: 150_000_000, maxSaves: 50 });
  const result = await api.listGameCloudSaves(user, '100001');
  assert.equal(result.saves[0].gameId, '100001');
  assert.equal(result.quota.usedSaves, 1);
  assert.equal(result.quota.maxSlots, 50);
});

test('após a carência não expõe saves no endpoint normal', async () => {
  const api = service({ canDownload: false, maxBytes: 0, maxSaves: 0 });
  const result = await api.listGameCloudSaves(user, '100001');
  assert.equal(result.saves.length, 0);
});
