import { Pool, PoolClient } from "pg";
import { getDb } from "@/lib/db";
import { AuthUser } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import {
  createPresignedUploadUrl,
  createPresignedDownloadUrl,
  verifyAndPromoteObject,
  deleteObject,
  isR2Configured,
  isMockStorageEnabled
} from "@/lib/cloud-storage";

export interface CloudSavePolicy {
  enabled: boolean;
  maxSlotsPerGame: number;
  maxFileBytes: number;
  maxUserBytes: number;
  globalLimitBytes: number;
  warningBytes: number;
  presignedUrlTtlSeconds: number;
}

const DEFAULT_POLICY: CloudSavePolicy = {
  enabled: true,
  maxSlotsPerGame: 3,
  maxFileBytes: 26_214_400, // 25 MB
  maxUserBytes: 100_000_000, // 100 MB per user
  globalLimitBytes: 8_000_000_000, // 8 GB global safety limit
  warningBytes: 7_000_000_000, // 7 GB warning threshold
  presignedUrlTtlSeconds: 120
};

export function isUserPremium(user: AuthUser | null | undefined): boolean {
  if (!user || !user.active) return false;
  return user.roles.some((r) => r === "VIP" || r === "ADMIN");
}

export async function getCloudSavePolicy(client?: PoolClient | Pool): Promise<CloudSavePolicy> {
  const db = client ?? getDb();
  try {
    const res = await db.query<{ value: Partial<CloudSavePolicy> }>(
      "SELECT value FROM rp_settings WHERE key = 'cloud_save' LIMIT 1"
    );
    if (res.rows[0]?.value) {
      return { ...DEFAULT_POLICY, ...res.rows[0].value };
    }
  } catch {}
  return DEFAULT_POLICY;
}

export function validateSaveFilename(filename: string): string {
  const clean = String(filename || "").trim();
  if (!clean || clean.length > 120) {
    throw new Error("Nome de arquivo de save inválido.");
  }
  if (!/^[^\\/:*?"<>|]+\.save$/i.test(clean) || clean.includes("..")) {
    throw new Error("O arquivo deve ser um save Ren'Py válido (.save).");
  }
  return clean;
}

export function validateSha256(sha256: string): string {
  const clean = String(sha256 || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(clean)) {
    throw new Error("Hash SHA-256 inválido.");
  }
  return clean;
}

export function validateSlotNumber(slotNumber: number, maxSlots: number): number {
  const slot = Number(slotNumber);
  if (!Number.isInteger(slot) || slot < 1 || slot > maxSlots) {
    throw new Error(`Slot inválido. Escolha entre o slot 1 e ${maxSlots}.`);
  }
  return slot;
}

/**
 * Clean up expired pending upload sessions for a user or globally,
 * releasing any reserved bytes.
 */
export async function releaseExpiredUploadSessions(client: PoolClient, userId?: string): Promise<number> {
  const params: unknown[] = [];
  let userFilter = "";
  if (userId) {
    params.push(userId);
    userFilter = "AND user_id = $1";
  }

  const expiredRes = await client.query<{ id: string; user_id: string; reserved_bytes: string }>(
    `UPDATE rp_cloud_upload_sessions
        SET status = 'EXPIRED'
      WHERE status = 'PENDING'
        AND expires_at < now()
        ${userFilter}
      RETURNING id, user_id, reserved_bytes`,
    params
  );

  for (const session of expiredRes.rows) {
    const bytes = Number(session.reserved_bytes || 0);
    if (bytes > 0) {
      await client.query(
        `UPDATE rp_cloud_storage_usage
            SET reserved_bytes = GREATEST(0, reserved_bytes - $1),
                updated_at = now()
          WHERE user_id = $2`,
        [bytes, session.user_id]
      );
    }
  }

  return expiredRes.rowCount ?? 0;
}

export interface InitUploadOptions {
  user: AuthUser;
  gameId: string;
  slotNumber: number;
  filename: string;
  fileSizeBytes: number;
  sha256: string;
  gameVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface InitUploadResult {
  uploadId: string;
  uploadUrl: string;
  temporaryKey: string;
  expiresInSeconds: number;
  maxBytesAllowed: number;
}

/**
 * Initializes a direct-to-R2 upload session with atomic storage reservation.
 */
export async function initCloudSaveUpload(
  options: InitUploadOptions
): Promise<InitUploadResult> {
  const { user, gameId, filename, fileSizeBytes, sha256 } = options;

  if (!isUserPremium(user)) {
    throw new Error("Recurso exclusivo RenPlay Premium. Faça upgrade para proteger seus saves na nuvem.");
  }

  if (!isR2Configured() && !isMockStorageEnabled()) {
    throw new Error("Armazenamento na nuvem temporariamente indisponível no servidor.");
  }

  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const policy = await getCloudSavePolicy(client);
    if (!policy.enabled) {
      throw new Error("O serviço Cloud Save está em manutenção no momento.");
    }

    const slot = validateSlotNumber(options.slotNumber, policy.maxSlotsPerGame);
    const validFilename = validateSaveFilename(filename);
    const validHash = validateSha256(sha256);
    const size = Number(fileSizeBytes);

    if (!Number.isInteger(size) || size <= 0 || size > policy.maxFileBytes) {
      throw new Error(`O arquivo excede o limite máximo permitido de ${Math.round(policy.maxFileBytes / (1024 * 1024))} MB.`);
    }

    // Verify game exists or register custom game for this user
    let gameRes = await client.query<{ id: string; name: string }>(
      "SELECT id, name FROM rp_games WHERE id = $1 LIMIT 1",
      [gameId]
    );
    if (!gameRes.rows[0]) {
      const customTitle = String(
        options.metadata?.gameName || options.metadata?.title || options.metadata?.name || gameId
      ).slice(0, 150);
      await client.query(
        `INSERT INTO rp_games (id, name, status, created_by)
         VALUES ($1, $2, 'DRAFT', $3)
         ON CONFLICT (id) DO NOTHING`,
        [gameId, customTitle, user.id]
      );
    }

    // Release any expired pending sessions for this user
    await releaseExpiredUploadSessions(client, user.id);

    // Check global storage usage
    const globalUsageRes = await client.query<{ total: string }>(
      "SELECT COALESCE(SUM(confirmed_bytes + reserved_bytes), 0) AS total FROM rp_cloud_storage_usage"
    );
    const currentGlobal = Number(globalUsageRes.rows[0]?.total || 0);
    if (currentGlobal + size > policy.globalLimitBytes) {
      throw new Error("Capacidade global do Cloud Save temporariamente atingida. Tente novamente mais tarde.");
    }

    // Check user's current storage quota
    // If replacing an existing active save in this slot, subtract its confirmed size
    const existingSlotRes = await client.query<{ file_size: string }>(
      `SELECT file_size FROM rp_cloud_saves
        WHERE user_id = $1 AND game_id = $2 AND slot_number = $3 AND status = 'ACTIVE'
        LIMIT 1`,
      [user.id, gameId, slot]
    );
    const existingSlotBytes = Number(existingSlotRes.rows[0]?.file_size || 0);

    // Get or initialize user's usage record with row-level lock
    await client.query(
      `INSERT INTO rp_cloud_storage_usage (user_id, confirmed_bytes, reserved_bytes)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    const userUsageRes = await client.query<{ confirmed_bytes: string; reserved_bytes: string }>(
      "SELECT confirmed_bytes, reserved_bytes FROM rp_cloud_storage_usage WHERE user_id = $1 FOR UPDATE",
      [user.id]
    );

    const confirmed = Number(userUsageRes.rows[0]?.confirmed_bytes || 0);
    const reserved = Number(userUsageRes.rows[0]?.reserved_bytes || 0);

    const netNewBytes = Math.max(0, size - existingSlotBytes);
    const effectiveTotalAfterUpload = (confirmed - existingSlotBytes) + reserved + size;

    if (effectiveTotalAfterUpload > policy.maxUserBytes) {
      throw new Error(`Limite de armazenamento da conta atingido (máximo de ${Math.round(policy.maxUserBytes / (1024 * 1024))} MB).`);
    }

    // Atomic space reservation
    await client.query(
      `UPDATE rp_cloud_storage_usage
          SET reserved_bytes = reserved_bytes + $1,
              updated_at = now()
        WHERE user_id = $2`,
      [size, user.id]
    );

    const uploadSessionId = randomUUID();
    const temporaryObjectKey = `temporary-uploads/${uploadSessionId}/payload.save`;
    const expiresAt = new Date(Date.now() + policy.presignedUrlTtlSeconds * 1000);

    await client.query(
      `INSERT INTO rp_cloud_upload_sessions (
         id, user_id, game_id, slot_number, temporary_object_key,
         expected_size, expected_hash, reserved_bytes, status, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)`,
      [
        uploadSessionId,
        user.id,
        gameId,
        slot,
        temporaryObjectKey,
        size,
        validHash,
        size,
        expiresAt
      ]
    );

    const presignedUploadUrl = await createPresignedUploadUrl(
      temporaryObjectKey,
      size,
      policy.presignedUrlTtlSeconds
    );

    await client.query("COMMIT");

    return {
      uploadId: uploadSessionId,
      uploadUrl: presignedUploadUrl,
      temporaryKey: temporaryObjectKey,
      expiresInSeconds: policy.presignedUrlTtlSeconds,
      maxBytesAllowed: size
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export interface ConfirmUploadOptions {
  user: AuthUser;
  uploadId: string;
  gameVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface CloudSaveRecord {
  id: string;
  userId: string;
  gameId: string;
  slotNumber: number;
  filename: string;
  sizeBytes: number;
  sha256: string;
  version: number;
  gameVersion: string;
  metadata: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Confirms a direct upload, verifies the object in R2, and promotes it to permanent key.
 */
export async function confirmCloudSaveUpload(
  options: ConfirmUploadOptions
): Promise<CloudSaveRecord> {
  const { user, uploadId, gameVersion = "", metadata = {} } = options;

  if (!isUserPremium(user)) {
    throw new Error("Recurso exclusivo RenPlay Premium.");
  }

  const db = getDb();
  const client = await db.connect();

  let oldObjectKeyToDelete: string | null = null;

  try {
    await client.query("BEGIN");

    // Fetch session with row-level lock
    const sessionRes = await client.query<{
      id: string;
      user_id: string;
      game_id: string;
      slot_number: number;
      temporary_object_key: string;
      expected_size: string;
      expected_hash: string;
      reserved_bytes: string;
      status: string;
      expires_at: Date;
    }>(
      `SELECT id, user_id, game_id, slot_number, temporary_object_key,
              expected_size, expected_hash, reserved_bytes, status, expires_at
         FROM rp_cloud_upload_sessions
        WHERE id = $1 AND user_id = $2
          FOR UPDATE`,
      [uploadId, user.id]
    );

    const session = sessionRes.rows[0];
    if (!session) {
      throw new Error("Sessão de upload não encontrada.");
    }

    if (session.status !== "PENDING") {
      throw new Error(`Sessão de upload inválida (status: ${session.status}).`);
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await client.query(
        "UPDATE rp_cloud_upload_sessions SET status = 'EXPIRED' WHERE id = $1",
        [uploadId]
      );
      await client.query(
        `UPDATE rp_cloud_storage_usage
            SET reserved_bytes = GREATEST(0, reserved_bytes - $1),
                updated_at = now()
          WHERE user_id = $2`,
        [Number(session.reserved_bytes || 0), user.id]
      );
      throw new Error("A autorização de upload expirou. Inicie uma nova sincronização.");
    }

    const expectedSize = Number(session.expected_size);
    const expectedHash = session.expected_hash;

    // Check previous save in slot to calculate version increment & clean old object
    const previousSaveRes = await client.query<{
      id: string;
      object_key: string;
      file_size: string;
      version: number;
      original_filename: string;
    }>(
      `SELECT id, object_key, file_size, version, original_filename
         FROM rp_cloud_saves
        WHERE user_id = $1 AND game_id = $2 AND slot_number = $3
          FOR UPDATE`,
      [user.id, session.game_id, session.slot_number]
    );

    const previousSave = previousSaveRes.rows[0];
    const nextVersion = (previousSave?.version || 0) + 1;
    const finalObjectKey = `users/${user.id}/games/${session.game_id}/slot_${session.slot_number}_v${nextVersion}.save`;

    // Verify object in R2 (checks Head, streams SHA-256, copies to permanent key, removes temporary key)
    const { verifiedSize, verifiedSha256 } = await verifyAndPromoteObject(
      session.temporary_object_key,
      finalObjectKey,
      expectedSize,
      expectedHash
    );

    const previousSize = Number(previousSave?.file_size || 0);
    if (previousSave?.object_key) {
      oldObjectKeyToDelete = previousSave.object_key;
    }

    // Insert or update slot record
    const saveRes = await client.query<{
      id: string;
      user_id: string;
      game_id: string;
      slot_number: number;
      original_filename: string;
      object_key: string;
      file_size: string;
      sha256: string;
      version: number;
      game_version: string;
      metadata: Record<string, unknown>;
      updated_at: string;
    }>(
      `INSERT INTO rp_cloud_saves (
         user_id, game_id, slot_number, original_filename, object_key,
         file_size, sha256, game_version, version, status, metadata, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', $10, now())
       ON CONFLICT (user_id, game_id, slot_number) DO UPDATE
         SET original_filename = EXCLUDED.original_filename,
             object_key = EXCLUDED.object_key,
             file_size = EXCLUDED.file_size,
             sha256 = EXCLUDED.sha256,
             game_version = EXCLUDED.game_version,
             version = EXCLUDED.version,
             status = 'ACTIVE',
             metadata = EXCLUDED.metadata,
             updated_at = now()
       RETURNING id, user_id, game_id, slot_number, original_filename,
                 object_key, file_size, sha256, version, game_version,
                 metadata, updated_at`,
      [
        user.id,
        session.game_id,
        session.slot_number,
        `slot_${session.slot_number}.save`,
        finalObjectKey,
        verifiedSize,
        verifiedSha256,
        gameVersion,
        nextVersion,
        JSON.stringify(metadata)
      ]
    );

    // Update storage usage accounting
    await client.query(
      `UPDATE rp_cloud_storage_usage
          SET reserved_bytes = GREATEST(0, reserved_bytes - $1),
              confirmed_bytes = GREATEST(0, confirmed_bytes - $2 + $3),
              updated_at = now()
        WHERE user_id = $4`,
      [expectedSize, previousSize, verifiedSize, user.id]
    );

    // Mark session confirmed
    await client.query(
      "UPDATE rp_cloud_upload_sessions SET status = 'CONFIRMED' WHERE id = $1",
      [uploadId]
    );

    await client.query("COMMIT");

    // Clean up old replaced R2 object asynchronously
    if (oldObjectKeyToDelete && oldObjectKeyToDelete !== finalObjectKey) {
      deleteObject(oldObjectKeyToDelete).catch(() => undefined);
    }

    const row = saveRes.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      gameId: row.game_id,
      slotNumber: row.slot_number,
      filename: row.original_filename,
      sizeBytes: Number(row.file_size),
      sha256: row.sha256,
      version: row.version,
      gameVersion: row.game_version,
      metadata: row.metadata,
      updatedAt: row.updated_at
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Lists all active cloud save slots for a user and game.
 */
export async function listGameCloudSaves(
  user: AuthUser,
  gameId: string
): Promise<{ saves: CloudSaveRecord[]; quota: { confirmedBytes: number; maxBytes: number; maxSlots: number } }> {
  const db = getDb();
  const policy = await getCloudSavePolicy(db);

  const usageRes = await db.query<{ confirmed_bytes: string }>(
    "SELECT confirmed_bytes FROM rp_cloud_storage_usage WHERE user_id = $1 LIMIT 1",
    [user.id]
  );
  const confirmedBytes = Number(usageRes.rows[0]?.confirmed_bytes || 0);

  const savesRes = await db.query<{
    id: string;
    user_id: string;
    game_id: string;
    slot_number: number;
    original_filename: string;
    object_key: string;
    file_size: string;
    sha256: string;
    version: number;
    game_version: string;
    metadata: Record<string, unknown>;
    updated_at: string;
  }>(
    `SELECT id, user_id, game_id, slot_number, original_filename,
            object_key, file_size, sha256, version, game_version,
            metadata, updated_at
       FROM rp_cloud_saves
      WHERE user_id = $1 AND game_id = $2 AND status = 'ACTIVE'
      ORDER BY slot_number ASC`,
    [user.id, gameId]
  );

  const saves = savesRes.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    gameId: row.game_id,
    slotNumber: row.slot_number,
    filename: row.original_filename,
    saveName: row.original_filename,
    sizeBytes: Number(row.file_size),
    sha256: row.sha256,
    version: row.version,
    gameVersion: row.game_version,
    metadata: row.metadata,
    updatedAt: row.updated_at
  }));

  return {
    saves,
    quota: {
      confirmedBytes,
      maxBytes: policy.maxUserBytes,
      maxSlots: policy.maxSlotsPerGame
    }
  };
}

/**
 * Initiates download of a specific cloud save slot via presigned GET URL.
 */
export async function initCloudSaveDownload(
  user: AuthUser,
  gameId: string,
  slotNumber: number
): Promise<{
  downloadUrl: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
  version: number;
  gameVersion: string;
}> {
  if (!isUserPremium(user)) {
    throw new Error("Recurso exclusivo RenPlay Premium.");
  }

  const db = getDb();
  const policy = await getCloudSavePolicy(db);
  const slot = validateSlotNumber(slotNumber, policy.maxSlotsPerGame);

  const res = await db.query<{
    object_key: string;
    original_filename: string;
    file_size: string;
    sha256: string;
    version: number;
    game_version: string;
  }>(
    `SELECT object_key, original_filename, file_size, sha256, version, game_version
       FROM rp_cloud_saves
      WHERE user_id = $1 AND game_id = $2 AND slot_number = $3 AND status = 'ACTIVE'
      LIMIT 1`,
    [user.id, gameId, slot]
  );

  const save = res.rows[0];
  if (!save) {
    throw new Error("Save na nuvem não encontrado neste slot.");
  }

  const downloadUrl = await createPresignedDownloadUrl(
    save.object_key,
    policy.presignedUrlTtlSeconds
  );

  return {
    downloadUrl,
    filename: save.original_filename,
    sizeBytes: Number(save.file_size),
    sha256: save.sha256,
    version: save.version,
    gameVersion: save.game_version
  };
}

/**
 * Safely deletes a cloud save slot and frees user storage.
 */
export async function deleteCloudSaveSlot(
  user: AuthUser,
  gameId: string,
  slotNumber: number
): Promise<{ deleted: boolean }> {
  if (!isUserPremium(user)) {
    throw new Error("Recurso exclusivo RenPlay Premium.");
  }

  const db = getDb();
  const client = await db.connect();

  let objectKeyToDelete: string | null = null;

  try {
    await client.query("BEGIN");
    const policy = await getCloudSavePolicy(client);
    const slot = validateSlotNumber(slotNumber, policy.maxSlotsPerGame);

    const res = await client.query<{ object_key: string; file_size: string }>(
      `DELETE FROM rp_cloud_saves
        WHERE user_id = $1 AND game_id = $2 AND slot_number = $3 AND status = 'ACTIVE'
        RETURNING object_key, file_size`,
      [user.id, gameId, slot]
    );

    const deletedRow = res.rows[0];
    if (deletedRow) {
      objectKeyToDelete = deletedRow.object_key;
      const size = Number(deletedRow.file_size || 0);

      await client.query(
        `UPDATE rp_cloud_storage_usage
            SET confirmed_bytes = GREATEST(0, confirmed_bytes - $1),
                updated_at = now()
          WHERE user_id = $2`,
        [size, user.id]
      );
    }

    await client.query("COMMIT");

    if (objectKeyToDelete) {
      deleteObject(objectKeyToDelete).catch(() => undefined);
    }

    return { deleted: Boolean(deletedRow) };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
