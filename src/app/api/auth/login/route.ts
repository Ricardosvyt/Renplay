import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  createWebSession,
  normalizeIdentifier,
  verifyPasswordHash,
  hashPassword,
  isBcryptHash,
  readAuthJsonBody,
  AuthInputError,
  DUMMY_ARGON2_HASH,
} from "@/lib/auth";
import {
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
} from "@/lib/auth-rate-limit";

function invalidCredentials() {
  return NextResponse.json(
    { error: "E-mail/usuário ou senha inválidos." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function rateLimitedResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter > 0 ? retryAfter : 900),
        "Cache-Control": "no-store",
      },
    }
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

  // Pre-crypto rate limit check: rejects brute force in <5ms without CPU exhaustion
  const rateLimit = await checkAuthRateLimit(request, "login", identifier);
  if (!rateLimit.allowed) {
    if (rateLimit.reason === "UNVERIFIED_ORIGIN") {
      return NextResponse.json(
        { error: "Não foi possível validar a origem da rede. Verifique sua conexão e tente novamente." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (rateLimit.isServiceUnavailable) {
      return NextResponse.json(
        { error: "Não foi possível consultar o serviço de autenticação agora. Tente novamente em instantes." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    return rateLimitedResponse(rateLimit.retryAfter);
  }

  // Under heavy distributed abuse, apply progressive server-side micro-tarpit
  if (rateLimit.shouldTarpit && rateLimit.tarpitMs > 0) {
    await new Promise((r) => setTimeout(r, rateLimit.tarpitMs));
  }

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
    const now = Date.now();

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

    // Authentication failure: if user does not exist or password is wrong, return identical 401 error
    if (!user || !validPassword) {
      await recordAuthFailure(request, "login", identifier);
      return invalidCredentials();
    }

    // Check account banned status ONLY after password is confirmed correct
    // This prevents attackers from discovering that an account exists and is banned via wrong-password attempts
    if (user.banned && (!user.banned_until || new Date(user.banned_until).getTime() > now)) {
      return NextResponse.json(
        { error: user.banned_until ? "Sua conta está temporariamente banida." : "Sua conta está banida permanentemente." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Check if account is active
    if (!user.active) {
      await recordAuthFailure(request, "login", identifier);
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
      return NextResponse.json(
        { error: "Esta área é exclusiva para administradores, moderadores, tradutores e desenvolvedores." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Transparent upgrade of legacy bcrypt hashes to Argon2id
    if (isBcryptHash(user.password_hash)) {
      try {
        const upgradedHash = await hashPassword(password);
        await client.query("UPDATE rp_users SET password_hash = $1 WHERE id = $2", [upgradedHash, user.id]);
      } catch (rehashErr) {
        console.error("Erro na migração transparente de hash:", rehashErr instanceof Error ? rehashErr.message : "");
      }
    }

    // Authentication succeeded: clear rate limits so legitimate user is never locked out
    await recordAuthSuccess(request, "login", identifier);

    // Update last login timestamp
    await client.query(
      "UPDATE rp_users SET last_login_at = now(), updated_at = now() WHERE id = $1",
      [user.id]
    );

    // Create secure web session
    await createWebSession(user.id, body.rememberMe === true);

    return NextResponse.json(
      { success: true, user: { username: user.username, email: user.email } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
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
