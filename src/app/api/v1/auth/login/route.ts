import { NextResponse } from "next/server";
import { createDesktopSession, normalizeIdentifier, verifyPasswordHash } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowLauncherAuth } from "@/lib/launcher-rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identifier?: string; password?: string };
    const identifier = normalizeIdentifier(body.identifier || "");
    if (!identifier || identifier.length > 254 || typeof body.password !== "string" || !body.password || body.password.length > 128) return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "Informe usuário e senha válidos." } }, { status: 400 });
    if (!await allowLauncherAuth(request, "login", identifier, 10)) return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde 15 minutos." } }, { status: 429 });
    const result = await getDb().query<{ id: string; username: string; email: string; display_name: string; password_hash: string; active: boolean; banned: boolean; banned_until: Date | null }>("SELECT id, username, email, display_name, password_hash, active, banned, banned_until FROM rp_users WHERE username = $1 OR email = $1 LIMIT 1", [identifier]);
    const user = result.rows[0];
    if (!user || !user.active || user.banned || (user.banned_until && new Date(user.banned_until).getTime() > Date.now()) || !(await verifyPasswordHash(body.password, user?.password_hash || ""))) {
      return NextResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "E-mail/usuário ou senha inválidos." } }, { status: 401 });
    }
    return NextResponse.json({ ...(await createDesktopSession(user.id)), user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } }, { status: 503 }); }
}
