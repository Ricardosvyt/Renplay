import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { getDb } from "@/lib/db";
import { getCloudSavePolicy, CloudSavePolicy } from "@/lib/cloud-saves";
import { isR2Configured, getR2BucketName } from "@/lib/cloud-storage";

async function requireAdminUser(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Autenticação necessária." }, { status: 401 }) };
  }
  if (!canManageSettings(user)) {
    return { error: NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: Request) {
  const check = await requireAdminUser(request);
  if (check.error) return check.error;

  const db = getDb();
  try {
    const policy = await getCloudSavePolicy(db);

    const statsRes = await db.query<{
      confirmed_bytes: string;
      reserved_bytes: string;
      active_users: string;
      total_saves: string;
    }>(`
      SELECT
        COALESCE(SUM(confirmed_bytes), 0) AS confirmed_bytes,
        COALESCE(SUM(reserved_bytes), 0) AS reserved_bytes,
        COUNT(DISTINCT user_id) AS active_users,
        (SELECT COUNT(*) FROM rp_cloud_saves WHERE status = 'ACTIVE') AS total_saves
      FROM rp_cloud_storage_usage
    `);

    const pendingRes = await db.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM rp_cloud_upload_sessions WHERE status = 'PENDING' AND expires_at > now()"
    );

    const stats = statsRes.rows[0];
    const confirmedBytes = Number(stats?.confirmed_bytes || 0);
    const reservedBytes = Number(stats?.reserved_bytes || 0);
    const totalBytes = confirmedBytes + reservedBytes;

    return NextResponse.json({
      storage: {
        bucket: getR2BucketName(),
        r2Configured: isR2Configured(),
        confirmedBytes,
        reservedBytes,
        totalBytes,
        globalLimitBytes: policy.globalLimitBytes,
        warningBytes: policy.warningBytes,
        activeUsers: Number(stats?.active_users || 0),
        totalSaves: Number(stats?.total_saves || 0),
        pendingUploads: Number(pendingRes.rows[0]?.count || 0),
        isPaused: !policy.enabled,
        capacityPercent: Number(((totalBytes / policy.globalLimitBytes) * 100).toFixed(2))
      },
      policy
    });
  } catch (error: any) {
    console.error("[Admin Cloud Storage] Erro ao carregar métricas:", error.message);
    return NextResponse.json({ error: "Não foi possível carregar as métricas de armazenamento." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const check = await requireAdminUser(request);
  if (check.error) return check.error;

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CloudSavePolicy>;
    const db = getDb();
    const current = await getCloudSavePolicy(db);

    const updated: CloudSavePolicy = {
      ...current,
      ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
      ...(typeof body.maxSlotsPerGame === "number" && body.maxSlotsPerGame >= 1 && body.maxSlotsPerGame <= 10
        ? { maxSlotsPerGame: body.maxSlotsPerGame }
        : {}),
      ...(typeof body.maxFileBytes === "number" && body.maxFileBytes > 0
        ? { maxFileBytes: body.maxFileBytes }
        : {}),
      ...(typeof body.maxUserBytes === "number" && body.maxUserBytes > 0
        ? { maxUserBytes: body.maxUserBytes }
        : {}),
      ...(typeof body.globalLimitBytes === "number" && body.globalLimitBytes > 0
        ? { globalLimitBytes: body.globalLimitBytes }
        : {})
    };

    await db.query(
      `INSERT INTO rp_settings (key, value)
       VALUES ('cloud_save', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(updated)]
    );

    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    console.error("[Admin Cloud Storage] Erro ao atualizar configurações:", error.message);
    return NextResponse.json({ error: error.message || "Erro ao salvar alterações." }, { status: 400 });
  }
}
