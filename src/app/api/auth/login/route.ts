import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";
import {
  createWebSession,
  getClientKey,
  normalizeIdentifier,
  verifyPasswordHash,
  readAuthJsonBody,
  AuthInputError,
  DUMMY_ARGON2_HASH,
} from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_PAIR = 5;
const MAX_ATTEMPTS_PER_IP = 25;

function invalidCredentials() {
  return NextResponse.json(
    { error: "E-mail/usuário ou senha inválidos." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function rateLimitedResponse() {
  return NextResponse.json(
    { error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente." },
    { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  let body: {
    identifier?: unknown;
    password?: unknown;
    rememberMe?: unknown;
    client?: unknown;
  };

  try {
    body = await readAuthJsonBody<{
      identifier?: unknown;
      password?: unknown;
      rememberMe?: unknown;
      client?: unknown;
    }>(request, 8192);
  } catch (err) {
    if (err instanceof AuthInputError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    return invalidCredentials();
  }

  const rawIdentifier = typeof body.identifier === "string" ? body.identifier : "";
  const identifier = normalizeIdentifier(rawIdentifier);
  const password = typeof body.password === "string" ? body.password : "";

  // Strict input length validation
  if (!identifier || identifier.length > 254 || !password || password.length < 1 || password.length > 128) {
    return invalidCredentials();
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const ipLimitKey = `login:ip:${ipHash}`;
  const pairLimitKey = `login:pair:${getClientKey(request, identifier)}`;

  const db = getDb();
  let client;
  try {
    client = await db.connect();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "";
    console.error("Falha ao conectar no banco para login:", errorMsg);
    return NextResponse.json(
      { error: "Não foi possível consultar o serviço de autenticação agora. Tente novamente em instantes." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await client.query("BEGIN");
    const now = Date.now();

    // Check rate limits atomically for both IP and identity:IP pair
    const limits = await client.query<{ key: string; hits: number; resets_at: Date }>(
      "SELECT key, hits, resets_at FROM rp_limits WHERE key IN ($1, $2) FOR UPDATE",
      [pairLimitKey, ipLimitKey]
    );

    const pairLimit = limits.rows.find((r) => r.key === pairLimitKey);
    const ipLimit = limits.rows.find((r) => r.key === ipLimitKey);

    const isPairBlocked = Boolean(
      pairLimit &&
      new Date(pairLimit.resets_at).getTime() > now &&
      pairLimit.hits >= MAX_ATTEMPTS_PER_PAIR
    );
    const isIpBlocked = Boolean(
      ipLimit &&
      new Date(ipLimit.resets_at).getTime() > now &&
      ipLimit.hits >= MAX_ATTEMPTS_PER_IP
    );

    if (isPairBlocked || isIpBlocked) {
      await client.query("ROLLBACK");
      return rateLimitedResponse();
    }

    // Lookup user using parameterized lowercase query to support both legacy and normalized entries
    const result = await client.query<{
      id: string;
      username: string;
      email: string;
      password_hash: string;
      active: boolean;
      banned: boolean;
      banned_until: Date | null;
    }>(
      `SELECT id, username, email, password_hash, active, banned, banned_until
         FROM rp_users
        WHERE LOWER(username) = $1 OR LOWER(email) = $1
        LIMIT 1`,
      [identifier]
    );
    const user = result.rows[0];

    // Timing-safe verification: always executes password verification calculation even if user is null
    const validPassword = await verifyPasswordHash(
      password,
      user?.password_hash ?? DUMMY_ARGON2_HASH
    );

    // Check account banned status
    if (user?.banned && (!user.banned_until || new Date(user.banned_until).getTime() > now)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: user.banned_until ? "Sua conta está temporariamente banida." : "Sua conta está banida permanentemente." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Authentication failure
    if (!user || !user.active || !validPassword) {
      const resetAt = new Date(now + WINDOW_MS);

      // Increment pair limit
      const pairHits = pairLimit && new Date(pairLimit.resets_at).getTime() > now ? pairLimit.hits + 1 : 1;
      const pairReset = pairLimit && new Date(pairLimit.resets_at).getTime() > now ? pairLimit.resets_at : resetAt;
      await client.query(
        `INSERT INTO rp_limits (key, hits, resets_at) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET hits = EXCLUDED.hits, resets_at = EXCLUDED.resets_at`,
        [pairLimitKey, pairHits, pairReset]
      );

      // Increment IP limit
      const ipHits = ipLimit && new Date(ipLimit.resets_at).getTime() > now ? ipLimit.hits + 1 : 1;
      const ipReset = ipLimit && new Date(ipLimit.resets_at).getTime() > now ? ipLimit.resets_at : resetAt;
      await client.query(
        `INSERT INTO rp_limits (key, hits, resets_at) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET hits = EXCLUDED.hits, resets_at = EXCLUDED.resets_at`,
        [ipLimitKey, ipHits, ipReset]
      );

      await client.query("COMMIT");
      return invalidCredentials();
    }

    // Role check for administrative/development area on the web
    const siteRoles = await client.query<{ role: string }>(
      "SELECT role FROM rp_user_roles WHERE user_id = $1",
      [user.id]
    );
    const canAccessSite = siteRoles.rows.some(({ role }) =>
      ["ADMIN", "MODERATOR", "TRANSLATOR", "DEVELOPER"].includes(role)
    );
    if (body.client !== "launcher" && !canAccessSite) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Esta área é exclusiva para administradores, moderadores, tradutores e desenvolvedores." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Authentication succeeded: clear rate limits for this pair so legitimate user is never locked out
    await client.query("DELETE FROM rp_limits WHERE key = $1", [pairLimitKey]);

    // Update last login timestamp
    await client.query(
      "UPDATE rp_users SET last_login_at = now(), updated_at = now() WHERE id = $1",
      [user.id]
    );
    await client.query("COMMIT");

    // Create secure web session
    await createWebSession(user.id, body.rememberMe === true);

    return NextResponse.json(
      { success: true, user: { username: user.username, email: user.email } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    const errorMsg = error instanceof Error ? error.message : "";
    console.error("Falha no login:", errorMsg);
    return NextResponse.json(
      { error: "Não foi possível consultar o serviço de autenticação agora. Tente novamente em instantes." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    client.release();
  }
}
