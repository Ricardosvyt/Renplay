import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

let pool: Pool | null = null;
function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const genre = (searchParams.get("genre") || "all").toLowerCase().trim();

  try {
    const p = getPool();
    if (p) {
      try {
        const currentUser = searchParams.get("includeAll") === "true" ? await getCurrentUser().catch(() => null) : null;
        const canManage = currentUser?.roles.some((role) => ["ADMIN", "DEVELOPER", "MODERATOR"].includes(role));
        const query = `
          SELECT g.id, g.name, g.status, g.metadata, g.created_at, g.updated_at
          FROM rp_games g
          ${canManage ? "" : "WHERE g.status = 'PUBLISHED'"}
          ORDER BY g.updated_at DESC
        `;
        const res = await p.query(query);
        {
          let list = res.rows.map((row) => ({
            id: row.id,
            name: row.name,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            ...(row.metadata || {}),
          }));

          if (q) {
            list = list.filter(
              (g) =>
                g.name?.toLowerCase().includes(q) ||
                g.description?.toLowerCase().includes(q) ||
                g.developer?.toLowerCase().includes(q)
            );
          }
          if (genre !== "all") {
            list = list.filter(
              (g) =>
                g.genre?.toLowerCase() === genre ||
                g.category?.toLowerCase() === genre
            );
          }
          return NextResponse.json({ games: list });
        }
      } catch (dbErr) {
        console.warn("[Games API] DB query fallback to catalog.json:", (dbErr as Error).message);
      }
    }

    // Fallback: carregar de src/data/catalog.json
    const filePath = path.join(process.cwd(), "src", "data", "catalog.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      let games = data.games || [];

      if (q) {
        games = games.filter(
          (g: { name?: string; description?: string; developer?: string }) =>
            g.name?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q) ||
            g.developer?.toLowerCase().includes(q)
        );
      }

      if (genre !== "all") {
        games = games.filter(
          (g: { genre?: string; category?: string }) =>
            g.genre?.toLowerCase() === genre ||
            g.category?.toLowerCase() === genre
        );
      }

      return NextResponse.json({ games });
    }

    return NextResponse.json({ games: [] });
  } catch {
    return NextResponse.json(
      { error: { code: "CATALOG_UNAVAILABLE", message: "Catálogo indisponível." } },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    if (!user.roles.some((role) => ["ADMIN", "DEVELOPER"].includes(role))) {
      return NextResponse.json({ error: "Permissão insuficiente para excluir jogos." }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ error: "Informe o jogo que será excluído." }, { status: 400 });

    const result = await getDb().query("DELETE FROM rp_games WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir jogo:", error);
    return NextResponse.json({ error: "Falha ao excluir o jogo do banco." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    if (!user.roles.some((role) => ["ADMIN", "DEVELOPER"].includes(role))) return NextResponse.json({ error: "Permissão insuficiente para publicar jogos." }, { status: 403 });
    const body = await request.json() as { name?: string; description?: string; fullDescription?: string; developer?: string; genre?: string; category?: string; version?: string; coverImage?: string; downloadUrl?: string; platforms?: string[]; languages?: string[]; status?: string };
    const name = body.name?.trim();
    if (!name || !body.description?.trim() || !body.developer?.trim()) return NextResponse.json({ error: "Nome, descrição e desenvolvedor são obrigatórios." }, { status: 400 });
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const metadata = { ...body, description: body.description.trim(), fullDescription: body.fullDescription?.trim() || body.description.trim(), developer: body.developer.trim(), genre: body.genre?.trim() || "Visual Novel", category: body.category?.trim() || "Geral", version: body.version?.trim() || "1.0.0", coverImage: body.coverImage?.trim() || "", downloadUrl: body.downloadUrl?.trim() || "", platforms: body.platforms || ["Windows"], languages: body.languages || ["Português (Brasil)"] };
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const result = await getDb().query("INSERT INTO rp_games (id, name, status, metadata, created_by, distribution_authorized) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, status, metadata, created_at, updated_at", [id, name, status, metadata, user.id, status === "PUBLISHED"]);
    return NextResponse.json({ game: result.rows[0], success: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar jogo:", error);
    return NextResponse.json({ error: "Falha ao salvar o jogo no banco." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    if (!user.roles.some((role) => ["ADMIN", "DEVELOPER", "MODERATOR"].includes(role))) {
      return NextResponse.json({ error: "Permissão insuficiente para alterar jogos." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED";
      featured?: boolean;
      metadata?: Record<string, unknown>;
    };

    const id = body.id || request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identificador do jogo não fornecido." }, { status: 400 });
    }

    // Busca o jogo atual
    const current = await getDb().query<{ id: string; status: string; metadata: Record<string, unknown> }>(
      "SELECT id, status, metadata FROM rp_games WHERE id = $1 LIMIT 1",
      [id]
    );

    if (current.rowCount === 0) {
      return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    }

    const game = current.rows[0];
    const newStatus = body.status || game.status;
    const isPublished = newStatus === "PUBLISHED";
    const mergedMetadata = {
      ...game.metadata,
      ...(body.metadata || {}),
      ...(body.featured !== undefined ? { featured: body.featured } : {})
    };

    const updated = await getDb().query(
      `UPDATE rp_games
          SET status = $1,
              metadata = $2,
              distribution_authorized = $3,
              updated_at = now()
        WHERE id = $4
    RETURNING id, name, status, metadata, created_at, updated_at`,
      [newStatus, mergedMetadata, isPublished, id]
    );

    return NextResponse.json({
      success: true,
      game: updated.rows[0]
    });
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error);
    return NextResponse.json({ error: "Falha ao atualizar o jogo." }, { status: 500 });
  }
}
