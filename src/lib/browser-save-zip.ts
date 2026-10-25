type Save = { gameId: string; slotNumber: number; filename: string; sizeBytes: number };
type Entry = { name: Uint8Array; crc: number; size: number; offset: number };
type Writable = { write(data: Uint8Array): Promise<void>; close(): Promise<void>; abort(): Promise<void> };

const encoder = new TextEncoder();

function record(size: number) {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function verifiedSave(save: Save) {
  const response = await fetch('/api/v1/cloud-saves/download', { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId: save.gameId, slotNumber: save.slotNumber }) });
  const info = await response.json();
  if (!response.ok || !info.downloadUrl) throw new Error(info.error?.message || 'Download indisponível.');
  const binary = await fetch(info.downloadUrl);
  if (!binary.ok) throw new Error(`Falha ao baixar ${save.filename}.`);
  const buffer = await binary.arrayBuffer();
  if (buffer.byteLength !== Number(info.sizeBytes) || buffer.byteLength !== save.sizeBytes) throw new Error(`Tamanho inválido: ${save.filename}.`);
  const sha = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)), byte => byte.toString(16).padStart(2, '0')).join('');
  if (sha !== info.sha256) throw new Error(`Integridade inválida: ${save.filename}.`);
  return new Uint8Array(buffer);
}

export async function exportCloudSavesZip(saves: Save[], onProgress: (completed: number, total: number) => void) {
  if (!saves.length) throw new Error('Nenhum save disponível para exportar.');
  const picker = (window as Window & { showSaveFilePicker?: (options: object) => Promise<{ createWritable: () => Promise<Writable> }> }).showSaveFilePicker;
  const totalBytes = saves.reduce((total, save) => total + save.sizeBytes, 0);
  if (!picker && totalBytes > 100_000_000) throw new Error('Para exportar mais de 100 MB, use Chrome ou Edge atualizado.');
  const chunks: Uint8Array[] = [];
  const file = picker ? await picker.call(window, { suggestedName: 'RenPlay-saves.zip', types: [{ description: 'Arquivo ZIP', accept: { 'application/zip': ['.zip'] } }] }) : null;
  const writer = file ? await file.createWritable() : null;
  const append = async (chunk: Uint8Array) => { if (writer) await writer.write(chunk); else chunks.push(chunk); };
  let offset = 0;
  const entries: Entry[] = [];
  try {
    for (const [index, save] of saves.entries()) {
      if (!/^\d+$/.test(save.gameId) || !/^[^\\/:*?"<>|]+\.save$/i.test(save.filename)) throw new Error('Nome de arquivo inválido na exportação.');
      const name = encoder.encode(`${save.gameId}/slot-${save.slotNumber}-${save.filename}`);
      const data = await verifiedSave(save);
      const crc = crc32(data);
      const local = record(30);
      local.view.setUint32(0, 0x04034b50, true);
      local.view.setUint16(4, 20, true);
      local.view.setUint16(6, 0x0800, true); // UTF-8 names
      local.view.setUint32(14, crc, true);
      local.view.setUint32(18, data.length, true);
      local.view.setUint32(22, data.length, true);
      local.view.setUint16(26, name.length, true);
      await append(local.bytes); await append(name); await append(data);
      entries.push({ name, crc, size: data.length, offset });
      offset += local.bytes.length + name.length + data.length;
      onProgress(index + 1, saves.length);
    }
    const centralStart = offset;
    for (const entry of entries) {
      const central = record(46);
      central.view.setUint32(0, 0x02014b50, true);
      central.view.setUint16(4, 20, true);
      central.view.setUint16(6, 20, true);
      central.view.setUint16(8, 0x0800, true);
      central.view.setUint32(16, entry.crc, true);
      central.view.setUint32(20, entry.size, true);
      central.view.setUint32(24, entry.size, true);
      central.view.setUint16(28, entry.name.length, true);
      central.view.setUint32(42, entry.offset, true);
      await append(central.bytes); await append(entry.name);
      offset += central.bytes.length + entry.name.length;
    }
    const end = record(22);
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(8, entries.length, true);
    end.view.setUint16(10, entries.length, true);
    end.view.setUint32(12, offset - centralStart, true);
    end.view.setUint32(16, centralStart, true);
    await append(end.bytes);
    if (writer) await writer.close();
    else {
      const blob = new Blob(chunks as BlobPart[], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'RenPlay-saves.zip'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  } catch (error) { if (writer) await writer.abort().catch(() => undefined); throw error; }
}
