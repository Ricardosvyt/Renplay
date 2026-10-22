import { NextResponse } from "next/server";
import {
  createDesktopAuthorizationCode,
  normalizeIdentifier,
  verifyPasswordHash,
  hashPassword,
  isBcryptHash,
  readAuthJsonBody,
  AuthInputError,
  DUMMY_ARGON2_HASH,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
} from "@/lib/auth-rate-limit";

export async function POST(request: Request) {
  let body: {
    identifier?: unknown;
    password?: unknown;
    challenge?: unknown;
    state?: unknown;
    redirectUri?: unknown;
  };

  try {
    body = await readAuthJsonBody<{
      identifier?: unknown;
      password?: unknown;
      challenge?: unknown;
      state?: unknown;
      redirectUri?: unknown;
    }>(request, 8192);
  } catch (err) {
    if (err instanceof AuthInputError) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: err.message } },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Solicitação de autorização inválida." } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rawIdentifier = typeof body.identifier === "string" ? body.identifier : "";
  const identifier = normalizeIdentifier(rawIdentifier);
  const password = typeof body.password === "string" ? body.password : "";
  const challenge = typeof body.challenge === "string" ? body.challenge : "";
  const state = typeof body.state === "string" ? body.state : "";
  const redirectUri = typeof body.redirectUri === "string" ? body.redirectUri : "";

  if (
    !identifier ||
    identifier.length > 254 ||
    !password ||
    password.length > 128 ||
    !challenge ||
    challenge.length > 256 ||
    !state ||
    state.length > 256 ||
    !redirectUri ||
    redirectUri.length > 256 ||
    !/^http:\/\/127\.0\.0\.1:\d+\/callback$/.test(redirectUri)
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Solicitação de autorização inválida." } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Pre-crypto rate limit check: rejects brute force before invoking Argon2id
  const rateLimit = await checkAuthRateLimit(request, "desktop-authorize", identifier);
  if (!rateLimit.allowed) {
    if (rateLimit.reason === "UNVERIFIED_ORIGIN") {
      return NextResponse.json(
        { error: { code: "UNVERIFIED_ORIGIN", message: "Não foi possível validar a origem da rede." } },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (rateLimit.isServiceUnavailable) {
      return NextResponse.json(
        { error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autorização indisponível." } },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde 15 minutos." } },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter > 0 ? rateLimit.retryAfter : 900),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (rateLimit.shouldTarpit && rateLimit.tarpitMs > 0) {
    await new Promise((r) => setTimeout(r, rateLimit.tarpitMs));
  }

  try {
    const db = getDb();
    const result = await db.query<{
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

    // Timing-safe password verification calculation eliminates enumeration oracle
    const validPassword = await verifyPasswordHash(
      password,
      user?.password_hash ?? DUMMY_ARGON2_HASH
    );

    // Authentication failure: if user does not exist or password is wrong, record failure and return 401
    if (!user || !validPassword) {
      await recordAuthFailure(request, "desktop-authorize", identifier);
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Check account banned status ONLY after password is confirmed correct
    const now = Date.now();
    if (user.banned && (!user.banned_until || new Date(user.banned_until).getTime() > now)) {
      return NextResponse.json(
        {
          error: {
            code: "ACCOUNT_BANNED",
            message: user.banned_until ? "Sua conta está temporariamente banida." : "Sua conta está banida permanentemente.",
          },
        },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!user.active) {
      await recordAuthFailure(request, "desktop-authorize", identifier);
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Transparent upgrade of legacy bcrypt hashes to Argon2id
    if (isBcryptHash(user.password_hash)) {
      try {
        const upgradedHash = await hashPassword(password);
        await db.query("UPDATE rp_users SET password_hash = $1 WHERE id = $2", [upgradedHash, user.id]);
      } catch (rehashErr) {
        console.error("Erro na migração de hash desktop PKCE:", rehashErr instanceof Error ? rehashErr.message : "");
      }
    }

    // Clear rate limits on successful authentication
    await recordAuthSuccess(request, "desktop-authorize", identifier);

    // Update last login timestamp
    await db.query(
      "UPDATE rp_users SET last_login_at = now(), updated_at = now() WHERE id = $1",
      [user.id]
    ).catch(() => undefined);

    const code = createDesktopAuthorizationCode(user.id, challenge, redirectUri);
    const redirect = new URL(redirectUri);
    redirect.searchParams.set("code", code);
    redirect.searchParams.set("state", state);

    return NextResponse.json(
      { redirectUrl: redirect.toString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    console.error("Falha na autorização desktop PKCE:", errorMsg);
    return NextResponse.json(
      { error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autorização indisponível." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
