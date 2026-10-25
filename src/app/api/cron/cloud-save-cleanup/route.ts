import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { executeCloudSaveCleanup } from "@/lib/cloud-cleanup";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") || "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

/** Daily UTC retention audit and physical R2 deletion with anti-accidental-deletion protection. */
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const db = getDb();
  const batch = Math.max(1, Math.min(25, Number(process.env.CLOUD_SAVE_CLEANUP_BATCH_SIZE || 25)));
  try {
    const rows = await db.query<{ user_id: string; current_period_end: Date; grace_expires_at: Date | null; subscription_status: string }>(
      `SELECT user_id, current_period_end, grace_expires_at, subscription_status
         FROM rp_subscriptions
        WHERE vip_level > 0 AND last_payment_confirmed_at IS NOT NULL
          AND current_period_end <= now() AND subscription_status IN ('ACTIVE','CANCELED_BUT_ACTIVE','GRACE_PERIOD','DELETION_PENDING')
        ORDER BY last_retention_audit_at NULLS FIRST, current_period_end LIMIT $1`, [batch]);
    let notices = 0;
    let scheduled = 0;
    for (const row of rows.rows) {
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const locked = await client.query<{ current_period_end: Date; last_payment_confirmed_at: Date | null; subscription_status: string }>(
          "SELECT current_period_end, last_payment_confirmed_at, subscription_status FROM rp_subscriptions WHERE user_id = $1 FOR UPDATE", [row.user_id]);
        const state = locked.rows[0];
        if (!state?.last_payment_confirmed_at || new Date(state.current_period_end).getTime() > Date.now() ||
          !['ACTIVE','CANCELED_BUT_ACTIVE','GRACE_PERIOD','DELETION_PENDING'].includes(state.subscription_status)) {
          await client.query("ROLLBACK"); continue;
        }
        const periodEnd = new Date(state.current_period_end);
        const graceEnd = new Date(periodEnd.getTime() + 30 * 86_400_000);
        const daysRemaining = Math.ceil((graceEnd.getTime() - Date.now()) / 86_400_000);
        const notice = daysRemaining <= 0 ? null : daysRemaining <= 1 ? 'GRACE_1' : daysRemaining <= 7 ? 'GRACE_7' : daysRemaining <= 15 ? 'GRACE_15' : 'EXPIRED';
        if (notice) {
          const inserted = await client.query(
            `INSERT INTO rp_subscription_notices(user_id, notice_type, period_end) VALUES ($1,$2,$3)
             ON CONFLICT DO NOTHING RETURNING user_id`, [row.user_id, notice, periodEnd]);
          if (inserted.rowCount) {
            const messages: Record<string, string> = {
              EXPIRED: 'Seu RenPlay VIP expirou. Seus saves ficarão disponíveis para recuperação por mais 30 dias.',
              GRACE_15: 'Faltam 15 dias para recuperar seus saves da nuvem.',
              GRACE_7: 'Faltam 7 dias para recuperar seus saves da nuvem.',
              GRACE_1: `Último dia para recuperar seus saves da nuvem. Prazo: ${graceEnd.toISOString()}.`
            };
            await client.query("INSERT INTO rp_notifications(user_id,title,body) VALUES ($1,$2,$3)",
              [row.user_id, 'RenPlay Cloud Save', messages[notice]]);
            notices++;
          }
        }
        if (Date.now() < graceEnd.getTime()) {
          await client.query("UPDATE rp_subscriptions SET subscription_status = 'GRACE_PERIOD', grace_started_at = $2, grace_expires_at = $3, last_retention_audit_at = now(), updated_at = now() WHERE user_id = $1", [row.user_id, periodEnd, graceEnd]);
        } else {
          await client.query("UPDATE rp_subscriptions SET subscription_status = 'DELETION_PENDING', grace_started_at = $2, grace_expires_at = $3, cloud_deletion_status = 'PENDING', last_retention_audit_at = now(), updated_at = now() WHERE user_id = $1", [row.user_id, periodEnd, graceEnd]);
          const job = await client.query("INSERT INTO rp_cloud_cleanup_jobs(user_id,scheduled_at) VALUES ($1,$2) ON CONFLICT (user_id) DO NOTHING RETURNING id", [row.user_id, graceEnd]);
          if (job.rowCount) scheduled++;
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        console.error("Falha na auditoria de retenção:", error);
      } finally { client.release(); }
    }

    // Process physical deletion for eligible accounts past grace period
    const cleanupResult = await executeCloudSaveCleanup({ batchSize: batch, db });

    return NextResponse.json({
      audited: rows.rowCount || 0,
      notices,
      scheduled,
      cleanup: cleanupResult,
      deletionEnabled: process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true" && !cleanupResult.paused,
      configuredForDeletion: process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true",
      reason: process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true"
        ? (cleanupResult.paused ? "Limpeza pausada pelo administrador." : "Limpeza ativa com exclusão física no R2.")
        : "Exclusão física em modo de simulação (dry-run)."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha no cron Cloud Save:", error);
    return NextResponse.json({ error: "Falha na auditoria de retenção." }, { status: 500 });
  }
}
