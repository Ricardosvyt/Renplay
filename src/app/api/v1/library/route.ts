import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para acessar sua biblioteca de jogos." } },
      { status: 401 }
    );
  }

  try {
    const result = await getDb().query<{
      id: string;
      name: string;
      status: string;
      metadata: Record<string, unknown>;
      favorite: boolean;
      added_at: string;
    }>(
      `SELECT g.id, g.name, g.status, g.metadata, l.favorite, l.added_at
         FROM rp_library l
         JOIN rp_games g ON g.id = l.game_id
        WHERE l.user_id = $1
        ORDER BY l.added_at DESC`,
      [user.id]
    );

    const games = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      favorite: row.favorite,
      addedAt: row.added_at,
      ...row.metadata
    }));

    return NextResponse.json({ games, count: games.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[Library API] Erro ao carregar biblioteca:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Não foi possível carregar sua biblioteca agora." } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para adicionar jogos à sua biblioteca." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { gameId?: string };
    const searchParams = new URL(request.url).searchParams;
    const gameId = (body.gameId || searchParams.get("gameId") || "").trim();

    if (!gameId) {
      return NextResponse.json(
        { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
        { status: 400 }
      );
    }

    // Verifica se o jogo existe e está publicado
    const gameCheck = await getDb().query<{ id: string; name: string }>(
      "SELECT id, name FROM rp_games WHERE id = $1 AND status = 'PUBLISHED' LIMIT 1",
      [gameId]
    );

    if (gameCheck.rowCount === 0) {
      return NextResponse.json(
        { error: { code: "GAME_NOT_FOUND", message: "Este jogo não está disponível no catálogo." } },
        { status: 404 }
      );
    }

    // Insere com idempotência (ON CONFLICT DO NOTHING)
    await getDb().query(
      `INSERT INTO rp_library (user_id, game_id, added_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id, game_id) DO NOTHING`,
      [user.id, gameId]
    );

    return NextResponse.json({ success: true, added: true, gameId });
  } catch (error) {
    console.error("[Library API] Erro ao adicionar jogo:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Erro ao adicionar o jogo à biblioteca." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para remover jogos da sua biblioteca." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { gameId?: string };
    const searchParams = new URL(request.url).searchParams;
    const gameId = (body.gameId || searchParams.get("gameId") || "").trim();

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
  } catch (error) {
    console.error("[Library API] Erro ao remover jogo:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Erro ao remover o jogo da biblioteca." } },
      { status: 500 }
    );
  }
}
