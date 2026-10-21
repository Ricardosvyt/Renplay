import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ gameId: string }> }) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre no launcher para adicionar jogos." } }, { status: 401 });
  const { gameId } = await context.params;
  await getDb().query("INSERT INTO rp_library (user_id, game_id) SELECT $1, id FROM rp_games WHERE id = $2 AND status = 'PUBLISHED' ON CONFLICT DO NOTHING", [user.id, gameId]);
  return NextResponse.json({ success: true });
}
