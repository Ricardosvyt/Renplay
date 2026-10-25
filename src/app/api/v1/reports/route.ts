import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre no launcher para enviar um relato." } }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { gameId?: string; kind?: string; details?: string };
  if (!body.gameId || !["bug", "broken-link", "game"].includes(body.kind || "") || !body.details?.trim()) return NextResponse.json({ error: { code: "INVALID_REPORT", message: "Relato inválido." } }, { status: 400 });
  await getDb().query("INSERT INTO rp_reports (user_id, game_id, kind, details) SELECT $1, id, $3, $4 FROM rp_games WHERE id = $2 OR public_id::text = $2", [user.id, body.gameId, body.kind, body.details.trim().slice(0, 1200)]);
  return NextResponse.json({ success: true }, { status: 201 });
}
