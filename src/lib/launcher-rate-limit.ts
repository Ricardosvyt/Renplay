import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";

// Atomic counters persist across serverless instances; no client-shared secret.
export async function allowLauncherAuth(request: Request, action: string, identifier: string, maximum: number) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  for (const [scope, value, limit] of [["ip", ip, maximum * 3], ["identity", identifier, maximum]] as const) {
    const key = `desktop:${action}:${scope}:${createHash("sha256").update(value).digest("hex")}`;
    const result = await getDb().query<{ hits: number }>(
      `INSERT INTO rp_limits (key, hits, resets_at) VALUES ($1, 1, now() + interval '15 minutes')
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN rp_limits.resets_at <= now() THEN 1 ELSE rp_limits.hits + 1 END,
         resets_at = CASE WHEN rp_limits.resets_at <= now() THEN now() + interval '15 minutes' ELSE rp_limits.resets_at END
       RETURNING hits`, [key]
    );
    if (result.rows[0].hits > limit) return false;
  }
  return true;
}

export async function clearLauncherAuthRateLimit(request: Request, action: string, identifier: string) {
  try {
    const key = `desktop:${action}:identity:${createHash("sha256").update(identifier).digest("hex")}`;
    await getDb().query("DELETE FROM rp_limits WHERE key = $1", [key]);
  } catch {
    // ignore
  }
}
