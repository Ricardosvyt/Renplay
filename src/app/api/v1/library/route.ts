import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre no launcher para acessar sua biblioteca." } }, { status: 401 });
  const result = await getDb().query<{ id: string; name: string; status: string; metadata: Record<string, unknown> }>("SELECT g.id, g.name, g.status, g.metadata FROM rp_library l JOIN rp_games g ON g.id = l.game_id WHERE l.user_id = $1 ORDER BY l.added_at DESC", [user.id]);
  return NextResponse.json({ games: result.rows.map((game) => ({ id: game.id, name: game.name, ...game.metadata })) });
}

export async function POST(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre no launcher para adicionar jogos." } }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { gameId?: string };
  const gameId = body.gameId || new URL(request.url).pathname.split("/").pop();
  if (!gameId) return NextResponse.json({ error: { code: "INVALID_GAME", message: "Jogo inválido." } }, { status: 400 });
  await getDb().query("INSERT INTO rp_library (user_id, game_id) SELECT $1, id FROM rp_games WHERE id = $2 AND status = 'PUBLISHED' ON CONFLICT DO NOTHING", [user.id, gameId]);
  return NextResponse.json({ success: true });
}
