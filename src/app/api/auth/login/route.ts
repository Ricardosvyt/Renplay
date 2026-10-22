import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createWebSession, getClientKey, normalizeIdentifier, verifyPasswordHash } from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function invalidCredentials() {
  return NextResponse.json(
    { error: "E-mail/usuário ou senha inválidos." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function databaseErrorMessage(error: unknown) {
  const err = error as { code?: string; message?: string };
  if (err.message?.includes("DATABASE_URL")) {
    return "Banco de dados não configurado no servidor.";
  }
  if (err.code === "42P01") {
    return "As tabelas de autenticação ainda não foram criadas. Execute as migrações do banco.";
  }
  if (["ECONNREFUSED", "ETIMEDOUT", "ENETUNREACH", "EHOSTUNREACH"].includes(err.code || "")) {
    return "Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL e a rede do servidor.";
  }
  return "Não foi possível consultar o serviço de autenticação agora. Tente novamente em instantes.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: unknown;
      password?: unknown;
      rememberMe?: unknown;
      client?: unknown;
    };
    const identifier = typeof body.identifier === "string" ? normalizeIdentifier(body.identifier) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || password.length < 1 || identifier.length > 254 || password.length > 256) {
      return invalidCredentials();
    }

    const db = getDb();
    const limitKey = `login:${getClientKey(request, identifier)}`;
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      const limit = await client.query<{ hits: number; resets_at: Date }>(
        "SELECT hits, resets_at FROM rp_limits WHERE key = $1 FOR UPDATE",
        [limitKey]
      );
      const now = Date.now();
      const current = limit.rows[0];
      if (current && new Date(current.resets_at).getTime() > now && current.hits >= MAX_ATTEMPTS) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
          { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } }
        );
      }

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
          WHERE username = $1 OR email = $1
          LIMIT 1`,
        [identifier]
      );
      const user = result.rows[0];
      const validPassword = await verifyPasswordHash(password, user?.password_hash ?? DUMMY_HASH);

      if (user?.banned && (!user.banned_until || new Date(user.banned_until).getTime() > now)) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: user.banned_until ? "Sua conta está temporariamente banida." : "Sua conta está banida permanentemente." },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (!user || !user.active || !validPassword) {
        const resetAt = current && new Date(current.resets_at).getTime() > now
          ? current.resets_at
          : new Date(now + WINDOW_MS);
        const hits = current && new Date(current.resets_at).getTime() > now ? current.hits + 1 : 1;
        await client.query(
          `INSERT INTO rp_limits (key, hits, resets_at) VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET hits = EXCLUDED.hits, resets_at = EXCLUDED.resets_at`,
          [limitKey, hits, resetAt]
        );
        await client.query("COMMIT");
        return invalidCredentials();
      }

      const siteRoles = await client.query<{ role: string }>(
        "SELECT role FROM rp_user_roles WHERE user_id = $1",
        [user.id]
      );
      const canAccessSite = siteRoles.rows.some(({ role }) => ["ADMIN", "MODERATOR", "TRANSLATOR", "DEVELOPER"].includes(role));
      if (body.client !== "launcher" && !canAccessSite) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Esta área é exclusiva para administradores, moderadores, tradutores e desenvolvedores." }, { status: 403 });
      }

      await client.query("DELETE FROM rp_limits WHERE key = $1", [limitKey]);
      await client.query(
        "UPDATE rp_users SET last_login_at = now(), updated_at = now() WHERE id = $1",
        [user.id]
      );
      await client.query("COMMIT");

      await createWebSession(user.id, body.rememberMe === true);
      return NextResponse.json(
        { success: true, user: { username: user.username, email: user.email } },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Falha no login:", error);
    return NextResponse.json(
      { error: databaseErrorMessage(error) },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
