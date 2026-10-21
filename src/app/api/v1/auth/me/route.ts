import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sessão do launcher inválida." } }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email, display_name: user.displayName, roles: user.roles } }, { headers: { "Cache-Control": "no-store" } });
}
