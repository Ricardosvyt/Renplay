const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { createHash, webcrypto } = require('node:crypto');

test('ZIP de recuperação contém o save íntegro no ID numérico do jogo', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/browser-save-zip.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const payload = Buffer.from('RENPLAY_SAVE_TEST');
  const chunks = [];
  let closed = false;
  const writer = { write: async value => chunks.push(Buffer.from(value)), close: async () => { closed = true; }, abort: async () => {} };
  const context = { module: mod, exports: mod.exports, TextEncoder, Uint8Array, DataView, Buffer,
    crypto: webcrypto, window: { showSaveFilePicker: async () => ({ createWritable: async () => writer }) },
    fetch: async url => String(url).startsWith('/api/') ? { ok: true, json: async () => ({
      downloadUrl: 'https://example.test/save', sizeBytes: payload.length,
      sha256: createHash('sha256').update(payload).digest('hex')
    }) } : { ok: true, arrayBuffer: async () => payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) } };
  vm.runInNewContext(code, context);
  await mod.exports.exportCloudSavesZip([{ gameId: '100001', slotNumber: 1, filename: '1-1.save', sizeBytes: payload.length }], () => {});
  assert.equal(closed, true);
  const zip = Buffer.concat(chunks);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  const nameSize = zip.readUInt16LE(26);
  assert.equal(zip.subarray(30, 30 + nameSize).toString(), '100001/slot-1-1-1.save');
  assert.equal(zip.subarray(30 + nameSize, 30 + nameSize + payload.length).toString(), payload.toString());
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.equal(zip.readUInt16LE(zip.length - 12), 1);
});
