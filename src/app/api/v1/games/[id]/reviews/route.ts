import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    // Busca avaliações ativas do jogo
    const reviewsResult = await db.query<{
      id: string;
      rating: number;
      text: string;
      created_at: string;
      user_id: string;
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    }>(
      `SELECT
        r.id,
        r.rating,
        r.text,
        r.created_at,
        r.user_id,
        u.username,
        u.display_name,
        u.avatar_url
      FROM rp_reviews r
      LEFT JOIN rp_users u ON u.id = r.user_id
      WHERE r.game_id = $1 AND r.hidden = false
      ORDER BY r.created_at DESC
      LIMIT 100`,
      [id]
    );

    const statsResult = await db.query<{
      count: string;
      avg: string | null;
    }>(
      `SELECT
        COUNT(*)::text AS count,
        ROUND(AVG(rating)::numeric, 1)::text AS avg
      FROM rp_reviews
      WHERE game_id = $1 AND hidden = false`,
      [id]
    );

    const reviewCount = Number(statsResult.rows[0]?.count ?? 0);
    const ratingAverage = statsResult.rows[0]?.avg ? Number(statsResult.rows[0].avg) : null;

    const reviews = reviewsResult.rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      text: row.text,
      createdAt: row.created_at,
      username: row.username || "Membro",
      displayName: row.display_name || row.username || "Membro RenPlay",
      avatarUrl: row.avatar_url || "",
    }));

    return NextResponse.json({
      reviews,
      reviewCount,
      ratingAverage,
    });
  } catch (error) {
    console.error("[Reviews GET API] Erro ao buscar comentários:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Erro ao carregar comentários do jogo." } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login na sua conta para avaliar ou comentar neste jogo." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: { code: "INVALID_CONTENT", message: "O comentário não pode ficar em branco." } },
        { status: 400 }
      );
    }
    if (text.length > 2000) {
      return NextResponse.json(
        { error: { code: "INVALID_CONTENT", message: "O comentário excede o limite de 2000 caracteres." } },
        { status: 400 }
      );
    }

    const rawRating = Number(body?.rating);
    const rating = Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : 5;

    const db = getDb();

    // Upsert na tabela rp_reviews
    const upsertResult = await db.query<{
      id: string;
      rating: number;
      text: string;
      created_at: string;
    }>(
      `INSERT INTO rp_reviews (user_id, game_id, rating, text, hidden, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       ON CONFLICT (user_id, game_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         text = EXCLUDED.text,
         hidden = false,
         created_at = NOW()
       RETURNING id, rating, text, created_at`,
      [user.id, id, rating, text]
    );

    const saved = upsertResult.rows[0];

    // Recalcula média e total
    const statsResult = await db.query<{
      count: string;
      avg: string | null;
    }>(
      `SELECT
        COUNT(*)::text AS count,
        ROUND(AVG(rating)::numeric, 1)::text AS avg
      FROM rp_reviews
      WHERE game_id = $1 AND hidden = false`,
      [id]
    );

    const reviewCount = Number(statsResult.rows[0]?.count ?? 0);
    const ratingAverage = statsResult.rows[0]?.avg ? Number(statsResult.rows[0].avg) : rating;

    return NextResponse.json({
      success: true,
      review: {
        id: saved.id,
        rating: saved.rating,
        text: saved.text,
        createdAt: saved.created_at,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: "",
      },
      reviewCount,
      ratingAverage,
    });
  } catch (error) {
    console.error("[Reviews POST API] Erro ao cadastrar comentário:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Erro ao salvar avaliação. Tente novamente." } },
      { status: 500 }
    );
  }
}
