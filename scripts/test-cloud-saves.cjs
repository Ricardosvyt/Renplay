const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Pool } = require('pg');
const { createHash, randomUUID } = require('node:crypto');

// Load environment variables from .env if present
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function loadTs(relativePath, dependencies = {}) {
  const filePath = path.join(__dirname, '..', relativePath);
  const rawCode = fs.readFileSync(filePath, 'utf8');
  const code = ts.transpileModule(rawCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    }
  }).outputText;

  const mod = { exports: {} };
  vm.runInNewContext(code, {
    module: mod,
    exports: mod.exports,
    Buffer,
    Request,
    Response,
    URL,
    process,
    console,
    setTimeout,
    clearTimeout,
    require: (name) => {
      if (name in dependencies) return dependencies[name];
      if (name === '@/lib/db') return { getDb: () => pool };
      if (name === '@/lib/auth') {
        return {
          getSessionUser: async () => null
        };
      }
      return require(name);
    }
  });

  return mod.exports;
}

const cloudStorage = loadTs('src/lib/cloud-storage.ts');
const cloudSaves = loadTs('src/lib/cloud-saves.ts', {
  '@/lib/cloud-storage': cloudStorage
});

cloudStorage.enableMockStorage(true);

const testGameId = 'test-cloud-game-' + Date.now();
let freeUser;
let vipUser;
let otherUser;

describe('RENPLAY CLOUD SAVE PREMIUM INTEGRATION SUITE', () => {
  before(async () => {
    // Ensure test game exists in rp_games
    await pool.query(
      `INSERT INTO rp_games (id, name, status)
       VALUES ($1, 'Cloud Save Test Game', 'PUBLISHED')
       ON CONFLICT (id) DO NOTHING`,
      [testGameId]
    );

    // Create test free user
    const freeRes = await pool.query(
      `INSERT INTO rp_users (username, email, display_name, password_hash, active)
       VALUES ($1, $2, 'Free Player', 'fake_hash', true)
       RETURNING id, username, email, display_name AS "displayName", active`,
      [`free_${Date.now()}`, `free_${Date.now()}@test.invalid`]
    );
    freeUser = { ...freeRes.rows[0], roles: ['USER'] };
    await pool.query('INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2)', [freeUser.id, 'USER']);

    // Create test VIP user
    const vipRes = await pool.query(
      `INSERT INTO rp_users (username, email, display_name, password_hash, active)
       VALUES ($1, $2, 'VIP Player', 'fake_hash', true)
       RETURNING id, username, email, display_name AS "displayName", active`,
      [`vip_${Date.now()}`, `vip_${Date.now()}@test.invalid`]
    );
    vipUser = { ...vipRes.rows[0], roles: ['USER', 'VIP'] };
    await pool.query('INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2), ($1, $3)', [vipUser.id, 'USER', 'VIP']);

    // Create other VIP user
    const otherRes = await pool.query(
      `INSERT INTO rp_users (username, email, display_name, password_hash, active)
       VALUES ($1, $2, 'Other VIP', 'fake_hash', true)
       RETURNING id, username, email, display_name AS "displayName", active`,
      [`other_${Date.now()}`, `other_${Date.now()}@test.invalid`]
    );
    otherUser = { ...otherRes.rows[0], roles: ['USER', 'VIP'] };
    await pool.query('INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2), ($1, $3)', [otherUser.id, 'USER', 'VIP']);
  });

  after(async () => {
    if (vipUser) {
      await pool.query('DELETE FROM rp_cloud_saves WHERE user_id = $1', [vipUser.id]);
      await pool.query('DELETE FROM rp_cloud_upload_sessions WHERE user_id = $1', [vipUser.id]);
      await pool.query('DELETE FROM rp_cloud_storage_usage WHERE user_id = $1', [vipUser.id]);
      await pool.query('DELETE FROM rp_users WHERE id = $1', [vipUser.id]);
    }
    if (freeUser) {
      await pool.query('DELETE FROM rp_users WHERE id = $1', [freeUser.id]);
    }
    if (otherUser) {
      await pool.query('DELETE FROM rp_cloud_saves WHERE user_id = $1', [otherUser.id]);
      await pool.query('DELETE FROM rp_cloud_upload_sessions WHERE user_id = $1', [otherUser.id]);
      await pool.query('DELETE FROM rp_cloud_storage_usage WHERE user_id = $1', [otherUser.id]);
      await pool.query('DELETE FROM rp_users WHERE id = $1', [otherUser.id]);
    }
    await pool.query('DELETE FROM rp_games WHERE id = $1', [testGameId]);
    await pool.end();
  });

  test('1. Free user attempting upload is rejected with Premium requirement', async () => {
    assert.equal(cloudSaves.isUserPremium(freeUser), false);

    await assert.rejects(
      async () => {
        await cloudSaves.initCloudSaveUpload({
          user: freeUser,
          gameId: testGameId,
          slotNumber: 1,
          filename: '1-1.save',
          fileSizeBytes: 1024,
          sha256: 'a'.repeat(64)
        });
      },
      /RenPlay Premium/i
    );
  });

  test('2. VIP user is identified as Premium and can initialize upload session', async () => {
    assert.equal(cloudSaves.isUserPremium(vipUser), true);

    const fakeSaveBuffer = Buffer.from('RenPy Savegame Test Content 123');
    const fakeHash = createHash('sha256').update(fakeSaveBuffer).digest('hex');

    const session = await cloudSaves.initCloudSaveUpload({
      user: vipUser,
      gameId: testGameId,
      slotNumber: 1,
      filename: '1-1.save',
      fileSizeBytes: fakeSaveBuffer.length,
      sha256: fakeHash
    });

    assert.ok(session.uploadId, 'Deve retornar uploadId');
    assert.ok(session.uploadUrl, 'Deve retornar presigned uploadUrl');
    assert.ok(session.temporaryKey, 'Deve conter temporaryKey');
    assert.equal(session.maxBytesAllowed, fakeSaveBuffer.length);
  });

  test('3. Rejects invalid slot numbers (e.g. slot 4 or 0)', () => {
    assert.throws(() => cloudSaves.validateSlotNumber(4, 3), /Slot inválido/);
    assert.throws(() => cloudSaves.validateSlotNumber(0, 3), /Slot inválido/);
    assert.throws(() => cloudSaves.validateSlotNumber(-1, 3), /Slot inválido/);
    assert.equal(cloudSaves.validateSlotNumber(1, 3), 1);
    assert.equal(cloudSaves.validateSlotNumber(2, 3), 2);
    assert.equal(cloudSaves.validateSlotNumber(3, 3), 3);
  });

  test('4. Rejects invalid filenames or non-.save extensions', () => {
    assert.throws(() => cloudSaves.validateSaveFilename('../../malicious.exe'), /save Ren'Py válido/);
    assert.throws(() => cloudSaves.validateSaveFilename('script.rpy'), /save Ren'Py válido/);
    assert.throws(() => cloudSaves.validateSaveFilename(''), /Nome de arquivo/);
    assert.equal(cloudSaves.validateSaveFilename('1-1.save'), '1-1.save');
    assert.equal(cloudSaves.validateSaveFilename('auto-1.save'), 'auto-1.save');
  });

  test('5. Rejects file size exceeding maximum permitted', async () => {
    await assert.rejects(
      async () => {
        await cloudSaves.initCloudSaveUpload({
          user: vipUser,
          gameId: testGameId,
          slotNumber: 1,
          filename: '1-1.save',
          fileSizeBytes: 30 * 1024 * 1024,
          sha256: 'a'.repeat(64)
        });
      },
      /limite máximo permitido/
    );
  });

  test('6. Rejects confirmation when R2 object is missing or corrupted', async () => {
    const fakeHash = 'b'.repeat(64);
    const session = await cloudSaves.initCloudSaveUpload({
      user: vipUser,
      gameId: testGameId,
      slotNumber: 2,
      filename: '1-2.save',
      fileSizeBytes: 500,
      sha256: fakeHash
    });

    cloudStorage.mockUploadFile(session.temporaryKey, Buffer.from('mismatched content'));

    await assert.rejects(
      async () => {
        await cloudSaves.confirmCloudSaveUpload({
          user: vipUser,
          uploadId: session.uploadId
        });
      },
      /difere do esperado/
    );
  });

  test('7. Successful upload confirmation promotes save to permanent slot and updates storage accounting', async () => {
    const saveContent = Buffer.from('Valid RenPy Save Game Content Slot 1');
    const saveHash = createHash('sha256').update(saveContent).digest('hex');

    const session = await cloudSaves.initCloudSaveUpload({
      user: vipUser,
      gameId: testGameId,
      slotNumber: 1,
      filename: '1-1.save',
      fileSizeBytes: saveContent.length,
      sha256: saveHash,
      gameVersion: '1.0.0',
      metadata: { playtime: 3600, title: 'Capítulo 1' }
    });

    cloudStorage.mockUploadFile(session.temporaryKey, saveContent);

    const confirmed = await cloudSaves.confirmCloudSaveUpload({
      user: vipUser,
      uploadId: session.uploadId,
      gameVersion: '1.0.0',
      metadata: { playtime: 3600, title: 'Capítulo 1' }
    });

    assert.equal(confirmed.slotNumber, 1);
    assert.equal(confirmed.sha256, saveHash);
    assert.equal(confirmed.sizeBytes, saveContent.length);
    assert.equal(confirmed.version, 1);

    const listing = await cloudSaves.listGameCloudSaves(vipUser, testGameId);
    assert.equal(listing.saves.length, 1);
    assert.equal(listing.saves[0].slotNumber, 1);
    assert.equal(listing.quota.confirmedBytes, saveContent.length);
  });

  test('8. Isolation: Another user cannot see or download saves from VIP user', async () => {
    const otherListing = await cloudSaves.listGameCloudSaves(otherUser, testGameId);
    assert.equal(otherListing.saves.length, 0);

    await assert.rejects(
      async () => {
        await cloudSaves.initCloudSaveDownload(otherUser, testGameId, 1);
      },
      /não encontrado/
    );
  });

  test('9. VIP user can obtain presigned download URL for own confirmed save', async () => {
    const downloadInfo = await cloudSaves.initCloudSaveDownload(vipUser, testGameId, 1);
    assert.ok(downloadInfo.downloadUrl, 'Deve gerar URL de download');
    assert.ok(downloadInfo.sha256, 'Deve conter hash do save');
    assert.equal(downloadInfo.version, 1);
  });

  test('10. Deleting a cloud save slot removes record and decrements storage', async () => {
    const delRes = await cloudSaves.deleteCloudSaveSlot(vipUser, testGameId, 1);
    assert.equal(delRes.deleted, true);

    const listing = await cloudSaves.listGameCloudSaves(vipUser, testGameId);
    assert.equal(listing.saves.length, 0);
    assert.equal(listing.quota.confirmedBytes, 0);
  });
});
