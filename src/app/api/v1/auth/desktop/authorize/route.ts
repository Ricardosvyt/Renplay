import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createDesktopAuthorizationCode, normalizeIdentifier } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identifier?: string; password?: string; challenge?: string; state?: string; redirectUri?: string };
    const identifier = normalizeIdentifier(body.identifier || "");
    if (!identifier || !body.password || !body.challenge || !body.state || !body.redirectUri || !/^http:\/\/127\.0\.0\.1:\d+\/callback$/.test(body.redirectUri)) {
      return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Solicitação de autorização inválida." } }, { status: 400 });
    }
    const result = await getDb().query<{ id: string; username: string; email: string; password_hash: string; active: boolean }>(
      "SELECT id, username, email, password_hash, active FROM rp_users WHERE username = $1 OR email = $1 LIMIT 1", [identifier]
    );
    const user = result.rows[0];
    if (!user || !user.active || !(await bcrypt.compare(body.password, user.password_hash))) {
      return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } }, { status: 401 });
    }
    const code = createDesktopAuthorizationCode(user.id, body.challenge, body.redirectUri);
    const redirect = new URL(body.redirectUri);
    redirect.searchParams.set("code", code);
    redirect.searchParams.set("state", body.state);
    return NextResponse.json({ redirectUrl: redirect.toString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } }, { status: 503 });
  }
}
