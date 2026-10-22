import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createDesktopSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowLauncherAuth } from "@/lib/launcher-rate-limit";
import { readRegistrationBody, RegistrationInputError, validateRegistration } from "@/lib/registration";

export async function POST(request: Request) {
  try {
    const { username, email, password, displayName } = validateRegistration(await readRegistrationBody(request));
    if (!await allowLauncherAuth(request, "register", email, 3)) return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde 15 minutos." } }, { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } });
    const passwordHash = await bcrypt.hash(password, 12);
    const client = await getDb().connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<{ id: string; username: string; email: string; display_name: string }>("INSERT INTO rp_users (username, email, display_name, password_hash, active, email_verified) VALUES ($1, $2, $3, $4, true, false) RETURNING id, username, email, display_name", [username, email, displayName, passwordHash]);
      await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, 'USER')", [result.rows[0].id]);
      const session = await createDesktopSession(result.rows[0].id, client);
      await client.query("COMMIT");
      return NextResponse.json({ ...session, user: { id: result.rows[0].id, username: result.rows[0].username, email: result.rows[0].email, display_name: result.rows[0].display_name } }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if ((error as { code?: string }).code === "23505") return NextResponse.json({ error: { code: "ACCOUNT_EXISTS", message: "Usuário ou e-mail já está cadastrado." } }, { status: 409 });
      throw error;
    } finally { client.release(); }
  } catch (error) {
    if (error instanceof RegistrationInputError) return NextResponse.json({ error: { code: "INVALID_INPUT", message: error.message } }, { status: 400, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ error: { code: "REGISTER_UNAVAILABLE", message: "Não foi possível criar a conta agora." } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
