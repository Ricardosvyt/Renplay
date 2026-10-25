/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function route(file, mocks) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, {
    module: loaded, exports: loaded.exports, Request, Response, URL, console,
    require: (name) => name in mocks ? mocks[name] : require(name)
  });
  return loaded.exports;
}

test('admin can inspect Premium saves grouped by site game ID without storage keys', async () => {
  const calls = [];
  const api = route('src/app/api/admin/cloud-saves/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => ({ roles: ['ADMIN'] }) },
    '@/lib/permissions': { canManageUsers: () => true },
    '@/lib/db': { getDb: () => ({ query: async (sql, params) => {
      calls.push({ sql, params });
      if (sql.includes('GROUP BY g.id')) return { rows: [{ id: 'site-game', name: 'Jogo', status: 'PUBLISHED', save_count: '2', user_count: '1', total_bytes: '2048' }] };
      if (sql.includes('COUNT(*)::text AS total')) return { rows: [{ total: '2' }] };
      return { rows: [{ id: 'save-1', user_id: 'user-1', username: 'player', email: 'player@example.test', slot_number: 1, original_filename: '1-1.save', file_size: '1024', version: 1, game_version: '1.0', updated_at: '2026-10-24T10:00:00Z', object_key: 'secret' }] };
    } }) }
  });
  const response = await api.GET({ nextUrl: new URL('https://example.test/api/admin/cloud-saves?gameId=site-game&page=2') });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.games[0].id, 'site-game');
  assert.equal(data.saves[0].username, 'player');
  assert.equal(data.saves[0].object_key, undefined);
  assert.equal(calls[2].params[1], 25);
});

test('non-admin cannot inspect another user’s saves', async () => {
  const api = route('src/app/api/admin/cloud-saves/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => ({ roles: ['USER'] }) },
    '@/lib/permissions': { canManageUsers: () => false },
    '@/lib/db': { getDb: () => { throw Error('DB must not be called'); } }
  });
  const response = await api.GET({ nextUrl: new URL('https://example.test/api/admin/cloud-saves') });
  assert.equal(response.status, 403);
});

test('saves page is restricted to administrators', () => {
  const permissions = route('src/lib/permissions.ts', {});
  assert.equal(permissions.evaluateRouteAccess({ active: true, roles: ['MODERATOR'] }, '/dashboard/saves').allowed, false);
  assert.equal(permissions.evaluateRouteAccess({ active: true, roles: ['ADMIN'] }, '/dashboard/saves').allowed, true);
});

test('editing game metadata keeps the canonical ID and ignores a submitted ID', async () => {
  let sql = '';
  let values;
  const api = route('src/app/api/admin/games/[id]/route.ts', {
    '@/lib/auth': { getCurrentUser: async () => ({ roles: ['ADMIN'] }) },
    '@/lib/permissions': { canManageGames: () => true },
    '@/lib/db': { getDb: () => ({ query: async (query, params) => {
      sql = query; values = params;
      return { rows: [{ id: 'site-game', name: 'Novo nome', status: 'PUBLISHED', metadata: {} }] };
    } }) }
  });
  const response = await api.PATCH(new Request('https://example.test/api/admin/games/site-game', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'other-game', name: 'Novo nome', developer: 'Studio', shortDescription: 'Descrição', status: 'PUBLISHED', version: '2.0' })
  }), { params: Promise.resolve({ id: 'site-game' }) });
  assert.equal(response.status, 200);
  assert.equal(values[0], 'site-game');
  assert.equal(values[1], 'Novo nome');
  assert.equal(JSON.parse(values[3]).id, undefined);
  assert.equal(JSON.parse(values[3]).version, '2.0');
  assert.match(sql, /metadata = metadata \|\|/);
});
