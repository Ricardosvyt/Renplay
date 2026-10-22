import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createDesktopSession, normalizeIdentifier } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const configuredKey = process.env.LAUNCHER_API_KEY?.trim();
    if (configuredKey && request.headers.get("x-renplay-api-key") !== configuredKey) return NextResponse.json({ error: { code: "INVALID_API_KEY", message: "Chave do launcher inválida." } }, { status: 401 });
    const body = await request.json() as { identifier?: string; password?: string };
    const identifier = normalizeIdentifier(body.identifier || "");
    if (!identifier || !body.password) return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "Informe usuário e senha." } }, { status: 400 });
    const result = await getDb().query<{ id: string; username: string; email: string; display_name: string; password_hash: string; active: boolean; banned: boolean; banned_until: Date | null }>("SELECT id, username, email, display_name, password_hash, active, banned, banned_until FROM rp_users WHERE username = $1 OR email = $1 LIMIT 1", [identifier]);
    const user = result.rows[0];
    if (!user || !user.active || user.banned || (user.banned_until && new Date(user.banned_until).getTime() > Date.now()) || !(await bcrypt.compare(body.password, user?.password_hash || ""))) {
      return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } }, { status: 401 });
    }
    return NextResponse.json({ ...(await createDesktopSession(user.id)), user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } }, { status: 503 }); }
}
