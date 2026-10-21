import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";

export const SESSION_COOKIE = "renplay_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SHORT_SESSION_TTL_SECONDS = 60 * 60 * 24;

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  active: boolean;
  roles: string[];
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase().slice(0, 254);
}

export function getClientKey(request: Request, identifier: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return hashToken(`${ip}:${normalizeIdentifier(identifier)}`);
}

export async function createWebSession(userId: string, rememberMe: boolean) {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const ttl = rememberMe ? SESSION_TTL_SECONDS : SHORT_SESSION_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const db = getDb();

  await db.query(
    `INSERT INTO rp_sessions (user_id, token_hash, kind, device, expires_at)
     VALUES ($1, $2, 'web', 'browser', $3)`,
    [userId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: rawToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: ttl } : {}),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const result = await db.query<AuthUser>(
    `SELECT u.id,
            u.username,
            u.email,
            u.display_name AS "displayName",
            u.active,
            COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') AS roles
       FROM rp_sessions s
       JOIN rp_users u ON u.id = s.user_id
       LEFT JOIN rp_user_roles ur ON ur.user_id = u.id
      WHERE s.token_hash = $1
        AND s.kind = 'web'
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
        AND u.active = true
        AND u.banned = false
        AND (u.banned_until IS NULL OR u.banned_until <= now())
      GROUP BY u.id
      LIMIT 1`,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().query(
      `UPDATE rp_sessions SET revoked_at = now()
        WHERE token_hash = $1 AND revoked_at IS NULL`,
      [hashToken(token)]
    ).catch(() => undefined);
  }
  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
