import { NextResponse } from "next/server";
import {
  createDesktopSession,
  normalizeIdentifier,
  verifyPasswordHash,
  readAuthJsonBody,
  AuthInputError,
  DUMMY_ARGON2_HASH,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowLauncherAuth, clearLauncherAuthRateLimit } from "@/lib/launcher-rate-limit";

export async function POST(request: Request) {
  let body: { identifier?: unknown; password?: unknown };

  try {
    body = await readAuthJsonBody<{ identifier?: unknown; password?: unknown }>(request, 8192);
  } catch (err) {
    if (err instanceof AuthInputError) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: err.message } },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rawIdentifier = typeof body.identifier === "string" ? body.identifier : "";
  const identifier = normalizeIdentifier(rawIdentifier);
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || identifier.length > 254 || !password || password.length < 1 || password.length > 128) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!(await allowLauncherAuth(request, "login", identifier, 10))) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde 15 minutos." } },
      { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const result = await db.query<{
      id: string;
      username: string;
      email: string;
      display_name: string;
      password_hash: string;
      active: boolean;
      banned: boolean;
      banned_until: Date | null;
    }>(
      `SELECT id, username, email, display_name, password_hash, active, banned, banned_until
         FROM rp_users
        WHERE LOWER(username) = $1 OR LOWER(email) = $1
        LIMIT 1`,
      [identifier]
    );

    const user = result.rows[0];

    // Always perform password verification calculation to eliminate timing-based user enumeration
    const validPassword = await verifyPasswordHash(
      password,
      user?.password_hash ?? DUMMY_ARGON2_HASH
    );

    const now = Date.now();
    if (user?.banned && (!user.banned_until || new Date(user.banned_until).getTime() > now)) {
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

    if (!user || !user.active || !validPassword) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Clear rate limits for this identity on successful login
    if (typeof clearLauncherAuthRateLimit === "function") {
      await clearLauncherAuthRateLimit(request, "login", identifier).catch(() => undefined);
    }

    // Update last login timestamp
    await db.query(
      "UPDATE rp_users SET last_login_at = now(), updated_at = now() WHERE id = $1",
      [user.id]
    ).catch(() => undefined);

    const session = await createDesktopSession(user.id);

    return NextResponse.json(
      {
        ...session,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    console.error("Falha no login desktop:", errorMsg);
    return NextResponse.json(
      { error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
