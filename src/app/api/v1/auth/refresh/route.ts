import { NextResponse } from "next/server";
import { createDesktopSession, hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { refreshToken?: string };
    if (!body.refreshToken) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Refresh token ausente." } }, { status: 401 });
    const result = await getDb().query<{ user_id: string }>("SELECT user_id FROM rp_sessions WHERE refresh_hash = $1 AND kind = 'desktop' AND revoked_at IS NULL AND refresh_expires_at > now() LIMIT 1", [hashToken(body.refreshToken)]);
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sessão expirada." } }, { status: 401 });
    await getDb().query("UPDATE rp_sessions SET revoked_at = now() WHERE refresh_hash = $1", [hashToken(body.refreshToken)]);
    return NextResponse.json(await createDesktopSession(user.user_id), { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } }, { status: 503 }); }
}
