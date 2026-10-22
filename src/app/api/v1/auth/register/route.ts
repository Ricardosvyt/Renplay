import { NextResponse } from "next/server";
import { createDesktopSession, hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowLauncherAuth } from "@/lib/launcher-rate-limit";
import { readRegistrationBody, RegistrationInputError, validateRegistration, checkPwnedPassword } from "@/lib/registration";

export async function POST(request: Request) {
  try {
    const { username, email, password, displayName } = validateRegistration(await readRegistrationBody(request));
    if (!await allowLauncherAuth(request, "register", email, 3)) {
      return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Muitas tentativas de cadastro. Aguarde um pouco." } }, { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } });
    }

    if (process.env.SKIP_PWNED_CHECK !== "true") {
      const pwnedResult = await checkPwnedPassword(password);
      if (pwnedResult.pwned) {
        return NextResponse.json({
          error: {
            code: "PASSWORD_PWNED",
            message: "Esta senha foi encontrada em vazamentos de dados. Escolha outra."
          }
        }, { status: 400, headers: { "Cache-Control": "no-store" } });
      }
      if (pwnedResult.error && process.env.NODE_ENV !== "test") {
        return NextResponse.json({
          error: {
            code: "VERIFICATION_FAILED",
            message: "Não foi possível verificar a segurança da senha. Tente novamente."
          }
        }, { status: 503, headers: { "Cache-Control": "no-store" } });
      }
    }

    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch {
      return NextResponse.json({
        error: {
          code: "SERVER_ERROR",
          message: "Não foi possível proteger sua senha agora. Tente novamente."
        }
      }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const client = await getDb().connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<{ id: string; username: string; email: string; display_name: string }>("INSERT INTO rp_users (username, email, display_name, password_hash, active, email_verified, terms_at) VALUES ($1, $2, $3, $4, true, false, now()) RETURNING id, username, email, display_name", [username, email, displayName, passwordHash]);
      await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, 'USER')", [result.rows[0].id]);
      const session = await createDesktopSession(result.rows[0].id, client);
      await client.query("COMMIT");
      return NextResponse.json({ ...session, user: { id: result.rows[0].id, username: result.rows[0].username, email: result.rows[0].email, display_name: result.rows[0].display_name } }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if ((error as { code?: string; detail?: string }).code === "23505") {
        const detail = String((error as { detail?: string }).detail || "");
        if (detail.includes("email")) {
          return NextResponse.json({ error: { code: "EMAIL_EXISTS", message: "Não foi possível cadastrar este e-mail." } }, { status: 409 });
        }
        return NextResponse.json({ error: { code: "USERNAME_EXISTS", message: "Este nome de usuário já está em uso." } }, { status: 409 });
      }
      throw error;
    } finally { client.release(); }
  } catch (error) {
    if (error instanceof RegistrationInputError) return NextResponse.json({ error: { code: "INVALID_INPUT", message: error.message } }, { status: 400, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ error: { code: "REGISTER_UNAVAILABLE", message: "Não foi possível criar a conta agora." } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
