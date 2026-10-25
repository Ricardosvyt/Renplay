import { getDb } from "@/lib/db";
import { deleteObject } from "@/lib/cloud-storage";
import type { Pool, PoolClient } from "pg";

export interface CleanupResult {
  auditedUsers: number;
  deletedAccounts: number;
  deletedSaves: number;
  bytesReclaimed: number;
  errors: Array<{ userId: string; error: string }>;
  dryRun: boolean;
  paused: boolean;
}

/**
 * Safely cleans up cloud saves of users whose 30-day grace period has expired.
 * Includes strict concurrency locks, renewal verification, idempotency, and dry-run safety.
 */
export async function executeCloudSaveCleanup(options: {
  dryRun?: boolean;
  batchSize?: number;
  db?: Pool | PoolClient;
} = {}): Promise<CleanupResult> {
  const db = options.db ?? getDb();
  const batchSize = Math.max(1, Math.min(25, options.batchSize || Number(process.env.CLOUD_SAVE_CLEANUP_BATCH_SIZE || 25)));
  const isEnabled = process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true";
  const isDryRun = options.dryRun ?? !isEnabled;

  // Check if cleanup is paused via rp_settings
  const settingRes = await db.query<{ value: { cleanupPaused?: boolean } }>(
    "SELECT value FROM rp_settings WHERE key = 'cloud_save' LIMIT 1"
  );
  if (settingRes.rows[0]?.value?.cleanupPaused) {
    return {
      auditedUsers: 0,
      deletedAccounts: 0,
      deletedSaves: 0,
      bytesReclaimed: 0,
      errors: [],
      dryRun: isDryRun,
      paused: true
    };
  }

  // Find users in DELETION_PENDING whose grace expired
  const eligibleUsers = await db.query<{
    user_id: string;
    current_period_end: Date;
    grace_expires_at: Date;
    last_payment_confirmed_at: Date | null;
    subscription_status: string;
  }>(
    `SELECT user_id, current_period_end, grace_expires_at, last_payment_confirmed_at, subscription_status
       FROM rp_subscriptions
      WHERE subscription_status = 'DELETION_PENDING'
        AND grace_expires_at <= now()
      ORDER BY grace_expires_at ASC
      LIMIT $1`,
    [batchSize]
  );

  const result: CleanupResult = {
    auditedUsers: eligibleUsers.rows.length,
    deletedAccounts: 0,
    deletedSaves: 0,
    bytesReclaimed: 0,
    errors: [],
    dryRun: isDryRun,
    paused: false
  };

  for (const userRow of eligibleUsers.rows) {
    const isPool = "connect" in db && typeof db.connect === "function";
    const client = isPool ? await (db as Pool).connect() : (db as PoolClient);
    try {
      await client.query("BEGIN");

      // Lock row to prevent concurrency with webhooks / renewals
      const lockedSub = await client.query<{
        user_id: string;
        current_period_end: Date;
        grace_expires_at: Date;
        last_payment_confirmed_at: Date | null;
        subscription_status: string;
      }>(
        `SELECT user_id, current_period_end, grace_expires_at, last_payment_confirmed_at, subscription_status
           FROM rp_subscriptions
          WHERE user_id = $1
          FOR UPDATE`,
        [userRow.user_id]
      );

      const sub = lockedSub.rows[0];
      if (!sub) {
        await client.query("ROLLBACK");
        continue;
      }

      // ACCIDENTAL DELETION SAFEGUARD:
      // If payment was confirmed after grace or period was renewed, ABORT deletion!
      const periodEnd = new Date(sub.current_period_end).getTime();
      const graceEnd = new Date(sub.grace_expires_at).getTime();
      const lastPayment = sub.last_payment_confirmed_at ? new Date(sub.last_payment_confirmed_at).getTime() : 0;

      if (periodEnd > Date.now() || lastPayment > graceEnd || sub.subscription_status === "ACTIVE") {
        // User renewed! Restore ACTIVE, cancel cleanup job
        await client.query(
          `UPDATE rp_subscriptions
              SET subscription_status = 'ACTIVE',
                  grace_started_at = NULL,
                  grace_expires_at = NULL,
                  cloud_deletion_status = 'NONE',
                  updated_at = now()
            WHERE user_id = $1`,
          [sub.user_id]
        );
        await client.query(
          "UPDATE rp_cloud_cleanup_jobs SET status = 'DONE', updated_at = now() WHERE user_id = $1 AND status = 'PENDING'",
          [sub.user_id]
        );
        await client.query("COMMIT");
        continue;
      }

      // Fetch user's active cloud saves
      const savesRes = await client.query<{
        id: string;
        object_key: string;
        file_size: string;
      }>(
        "SELECT id, object_key, file_size FROM rp_cloud_saves WHERE user_id = $1 AND status = 'ACTIVE'",
        [sub.user_id]
      );

      let userBytes = 0;
      for (const s of savesRes.rows) {
        userBytes += Number(s.file_size || 0);
      }

      if (isDryRun) {
        // In dry-run mode: record what would be deleted without calling R2
        result.deletedAccounts++;
        result.deletedSaves += savesRes.rows.length;
        result.bytesReclaimed += userBytes;
        await client.query("ROLLBACK");
        continue;
      }

      // Physical deletion from Cloudflare R2
      let userDeletedCount = 0;
      for (const save of savesRes.rows) {
        try {
          await deleteObject(save.object_key);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          // Idempotency: if object was already removed, proceed
          if (!errMsg.includes("NoSuchKey") && !errMsg.includes("not found")) {
            console.warn(`[CloudCleanup] Aviso ao deletar objeto ${save.object_key}:`, errMsg);
          }
        }
        await client.query(
          "UPDATE rp_cloud_saves SET status = 'DELETED', updated_at = now() WHERE id = $1",
          [save.id]
        );
        userDeletedCount++;
      }

      // Zero out user storage usage
      await client.query(
        "UPDATE rp_cloud_storage_usage SET confirmed_bytes = 0, reserved_bytes = 0, updated_at = now() WHERE user_id = $1",
        [sub.user_id]
      );

      // Update subscription record
      await client.query(
        `UPDATE rp_subscriptions
            SET subscription_status = 'DELETED',
                cloud_deletion_status = 'DELETED',
                cloud_deleted_at = now(),
                updated_at = now()
          WHERE user_id = $1`,
        [sub.user_id]
      );

      // Complete cleanup job
      await client.query(
        `UPDATE rp_cloud_cleanup_jobs
            SET status = 'DONE',
                completed_at = now(),
                bytes_reclaimed = $2,
                updated_at = now()
          WHERE user_id = $1`,
        [sub.user_id, userBytes]
      );

      // Final notification: Inform user that retention ended and cloud saves were removed
      await client.query(
        `INSERT INTO rp_notifications (user_id, title, body)
         VALUES ($1, 'RenPlay Cloud Save', 'Seu período de carência de 30 dias terminou e os arquivos da nuvem foram removidos. Seus saves locais permanecem intactos.')`,
        [sub.user_id]
      );

      await client.query("COMMIT");
      result.deletedAccounts++;
      result.deletedSaves += userDeletedCount;
      result.bytesReclaimed += userBytes;
    } catch (err: unknown) {
      await client.query("ROLLBACK").catch(() => undefined);
      const errMsg = err instanceof Error ? err.message : String(err);
      result.errors.push({ userId: userRow.user_id, error: errMsg });
      await db.query(
        `UPDATE rp_cloud_cleanup_jobs
            SET status = 'ERROR',
                attempts = attempts + 1,
                last_error_code = $2,
                updated_at = now()
          WHERE user_id = $1`,
        [userRow.user_id, errMsg.slice(0, 100)]
      ).catch(() => undefined);
    } finally {
      if (isPool && "release" in client) client.release();
    }
  }

  return result;
}
