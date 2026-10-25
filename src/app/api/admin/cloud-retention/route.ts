import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { getDb } from "@/lib/db";
import { executeCloudSaveCleanup } from "@/lib/cloud-cleanup";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!canManageSettings(user)) return NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 });
  const db = getDb();
  const [states, jobs, eligible, setting] = await Promise.all([
    db.query<{ status: string; total: string }>(
      `SELECT subscription_status AS status, count(*)::text AS total FROM rp_subscriptions GROUP BY subscription_status`),
    db.query<{ status: string; total: string; bytes_reclaimed: string }>(
      `SELECT status, count(*)::text AS total, coalesce(sum(bytes_reclaimed),0)::text AS bytes_reclaimed FROM rp_cloud_cleanup_jobs GROUP BY status`),
    db.query<{ user_id: string; username: string; save_count: string; bytes: string; grace_expires_at: Date }>(
      `SELECT s.user_id, u.username, count(c.id)::text AS save_count,
              coalesce(sum(c.file_size),0)::text AS bytes, s.grace_expires_at
         FROM rp_subscriptions s JOIN rp_users u ON u.id = s.user_id
         LEFT JOIN rp_cloud_saves c ON c.user_id = s.user_id AND c.status = 'ACTIVE'
        WHERE s.subscription_status = 'DELETION_PENDING' AND s.grace_expires_at <= now()
        GROUP BY s.user_id, u.username, s.grace_expires_at
        ORDER BY s.grace_expires_at LIMIT 25`),
    db.query<{ value: { cleanupPaused?: boolean } }>(
      "SELECT value FROM rp_settings WHERE key = 'cloud_save' LIMIT 1")
  ]);

  const cleanupPaused = Boolean(setting.rows[0]?.value?.cleanupPaused);
  const deletionEnabled = process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true" && !cleanupPaused;

  return NextResponse.json({
    deletionEnabled,
    cleanupPaused,
    configuredForDeletion: process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true",
    reason: cleanupPaused
      ? "Limpeza automática pausada por um administrador."
      : process.env.CLOUD_SAVE_CLEANUP_ENABLED === "true"
      ? "Limpeza física ativa no Cloudflare R2 com checagem anti-exclusão."
      : "A exclusão física real está desativada no ambiente (modo de simulação seguro / dry-run).",
    subscriptionStates: Object.fromEntries(states.rows.map(row => [row.status, Number(row.total)])),
    jobs: Object.fromEntries(jobs.rows.map(row => [row.status, { count: Number(row.total), bytesReclaimed: Number(row.bytes_reclaimed) }])),
    dryRun: eligible.rows.map(row => ({ userId: row.user_id, username: row.username,
      saveCount: Number(row.save_count), bytes: Number(row.bytes), graceExpiresAt: row.grace_expires_at }))
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!canManageSettings(user)) return NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const db = getDb();

  if (body.action === "pause") {
    await db.query(
      `INSERT INTO rp_settings (key, value)
       VALUES ('cloud_save', '{"cleanupPaused": true}'::jsonb)
       ON CONFLICT (key) DO UPDATE
         SET value = jsonb_set(coalesce(rp_settings.value, '{}'::jsonb), '{cleanupPaused}', 'true'::jsonb)`
    );
    return NextResponse.json({ success: true, cleanupPaused: true });
  }

  if (body.action === "resume") {
    await db.query(
      `UPDATE rp_settings
          SET value = jsonb_set(coalesce(value, '{}'::jsonb), '{cleanupPaused}', 'false'::jsonb)
        WHERE key = 'cloud_save'`
    );
    return NextResponse.json({ success: true, cleanupPaused: false });
  }

  if (body.action === "retry_errors") {
    const res = await db.query(
      "UPDATE rp_cloud_cleanup_jobs SET status = 'PENDING', attempts = 0 WHERE status = 'ERROR'"
    );
    return NextResponse.json({ success: true, retriedCount: res.rowCount ?? 0 });
  }

  if (body.action === "dry_run") {
    const cleanupResult = await executeCloudSaveCleanup({ dryRun: true, db });
    return NextResponse.json({ success: true, dryRunResult: cleanupResult });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
