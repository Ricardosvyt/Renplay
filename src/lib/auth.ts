import { cookies } from "next/headers";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { extractClientIp } from "@/lib/client-ip";
import { runWithArgonConcurrencyLimit } from "@/lib/auth-rate-limit";
import type { PoolClient } from "pg";

export const SESSION_COOKIE = "renplay_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SHORT_SESSION_TTL_SECONDS = 60 * 60 * 24;
const DESKTOP_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const DESKTOP_CODE_TTL_SECONDS = 180;

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
  const { normalizedIp } = extractClientIp(request);
  const ipComponent = normalizedIp ?? "unverified";
  return hashToken(`${ipComponent}:${normalizeIdentifier(identifier)}`);
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

export async function createDesktopSession(userId: string, client?: PoolClient) {
  const accessToken = randomBytes(32).toString("base64url");
  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + DESKTOP_SESSION_TTL_SECONDS * 1000);
  await (client ?? getDb()).query(
    `INSERT INTO rp_sessions (user_id, token_hash, refresh_hash, kind, device, expires_at, refresh_expires_at)
     VALUES ($1, $2, $3, 'desktop', 'launcher', $4, $5)`,
    [userId, hashToken(accessToken), hashToken(refreshToken), expiresAt, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
  );
  return { accessToken, refreshToken, expiresIn: DESKTOP_SESSION_TTL_SECONDS };
}

export function createDesktopAuthorizationCode(userId: string, challenge: string, redirectUri: string) {
  const payload = Buffer.from(JSON.stringify({ userId, challenge, redirectUri, expiresAt: Date.now() + DESKTOP_CODE_TTL_SECONDS * 1000 })).toString("base64url");
  const secret = process.env.AUTH_ENCRYPTION_KEY || "development-only-change-me";
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function consumeDesktopAuthorizationCode(code: string, verifier: string, redirectUri: string) {
  const [payload, signature] = code.split(".");
  if (!payload || !signature) return null;
  const secret = process.env.AUTH_ENCRYPTION_KEY || "development-only-change-me";
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; challenge: string; redirectUri: string; expiresAt: number };
    const actualChallenge = createHash("sha256").update(verifier).digest("base64url");
    if (data.expiresAt < Date.now() || data.redirectUri !== redirectUri || data.challenge !== actualChallenge) return null;
    return data;
  } catch { return null; }
}

export async function getBearerUser(request: Request): Promise<AuthUser | null> {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const result = await getDb().query<AuthUser>(
    `SELECT u.id, u.username, u.email, u.display_name AS "displayName", u.active,
            COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') AS roles
       FROM rp_sessions s JOIN rp_users u ON u.id = s.user_id
       LEFT JOIN rp_user_roles ur ON ur.user_id = u.id
      WHERE s.token_hash = $1 AND s.kind = 'desktop' AND s.revoked_at IS NULL
        AND s.expires_at > now() AND u.active = true AND u.banned = false
        AND (u.banned_until IS NULL OR u.banned_until <= now())
      GROUP BY u.id LIMIT 1`,
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
}

export { hashToken };

export async function getUserBySessionToken(rawToken: string): Promise<AuthUser | null> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 16) return null;
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
    [hashToken(rawToken)]
  );

  return result.rows[0] ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
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

export async function hashPassword(password: string): Promise<string> {
  const argon2 = await import("argon2");
  return await argon2.hash(password, { type: argon2.argon2id });
}

export const DUMMY_ARGON2_HASH = "$argon2id$v=19$m=65536,p=4,t=3$nKs7B3y1Mndc5cYf5LEZjQ$f6vDBJrQ4YdqWnb72K8Sx7tD1v1vCIQGLJBAfqsM8zE";

export class AuthInputError extends Error {}

export async function readAuthJsonBody<T>(request: Request, maxBytes = 8192): Promise<T> {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim()?.toLowerCase();
  if (contentType && contentType !== "application/json") {
    throw new AuthInputError("Envie os dados no formato JSON.");
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new AuthInputError("Corpo da requisição excede o limite permitido.");
  }
  const reader = request.body?.getReader();
  if (!reader) {
    throw new AuthInputError("Corpo da requisição ausente.");
  }
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new AuthInputError("Corpo da requisição excede o limite permitido.");
      }
      chunks.push(value);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
    } catch {
      throw new AuthInputError("JSON malformado ou inválido.");
    }
  } finally {
    reader.releaseLock();
  }
}

export function isBcryptHash(hash: string): boolean {
  return Boolean(
    hash &&
    (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$") || hash.startsWith("$2$"))
  );
}

export async function verifyPasswordHash(password: string, hash: string): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;
  const isArgon = Boolean(hash && hash.startsWith("$argon2"));
  const isBcrypt = isBcryptHash(hash);

  // If user does not exist or has invalid hash, perform dummy Argon2 verification to prevent timing attack enumeration
  if (!isArgon && !isBcrypt) {
    try {
      const argon2 = await import("argon2");
      await runWithArgonConcurrencyLimit(() => argon2.verify(DUMMY_ARGON2_HASH, password));
    } catch {
      // ignore
    }
    return false;
  }

  if (isArgon) {
    try {
      const argon2 = await import("argon2");
      return await runWithArgonConcurrencyLimit(() => argon2.verify(hash, password));
    } catch {
      return false;
    }
  }

  try {
    const bcrypt = await import("bcryptjs");
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
