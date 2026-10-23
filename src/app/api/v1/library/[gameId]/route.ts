import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ gameId: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para adicionar jogos à sua biblioteca." } },
      { status: 401 }
    );
  }

  const { gameId } = await context.params;
  if (!gameId) {
    return NextResponse.json(
      { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
      { status: 400 }
    );
  }

  const gameCheck = await getDb().query<{ id: string; name: string }>(
    "SELECT id, name FROM rp_games WHERE id = $1 AND status = 'PUBLISHED' LIMIT 1",
    [gameId]
  );

  if (gameCheck.rowCount === 0) {
    return NextResponse.json(
      { error: { code: "GAME_NOT_FOUND", message: "Jogo não disponível no catálogo público." } },
      { status: 404 }
    );
  }

  await getDb().query(
    `INSERT INTO rp_library (user_id, game_id, added_at)
     VALUES ($1, $2, now())
     ON CONFLICT (user_id, game_id) DO NOTHING`,
    [user.id, gameId]
  );

  return NextResponse.json({ success: true, added: true, gameId });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ gameId: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para remover jogos da biblioteca." } },
      { status: 401 }
    );
  }

  const { gameId } = await context.params;
  if (!gameId) {
    return NextResponse.json(
      { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
      { status: 400 }
    );
  }

  const deleteRes = await getDb().query(
    "DELETE FROM rp_library WHERE user_id = $1 AND game_id = $2 RETURNING game_id",
    [user.id, gameId]
  );

  return NextResponse.json({
    success: true,
    removed: deleteRes.rowCount !== null && deleteRes.rowCount > 0,
    gameId
  });
}
