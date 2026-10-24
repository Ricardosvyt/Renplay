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

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
          SELECT g.id, g.name, g.status, g.metadata, g.created_at, g.updated_at,
            reviews.rating_average,
            COALESCE(reviews.review_count, 0)::int AS review_count,
            COALESCE(downloads.download_count, 0)::int AS download_count
          FROM rp_games g
          LEFT JOIN (
            SELECT game_id, ROUND(AVG(rating)::numeric, 1) AS rating_average,
              COUNT(*)::int AS review_count
            FROM rp_reviews
            WHERE hidden = false
            GROUP BY game_id
          ) reviews ON reviews.game_id = g.id
          LEFT JOIN (
            SELECT game_id, COUNT(*)::int AS download_count
            FROM rp_downloads
            GROUP BY game_id
          ) downloads ON downloads.game_id = g.id
          ${canManage ? "" : "WHERE g.status = 'PUBLISHED'"}
          ORDER BY COALESCE((g.metadata->>'featuredOrder')::int, 0) DESC, g.updated_at DESC
        `;
        const res = await p.query(query);
        {
          let list = res.rows.map((row) => {
            const meta = row.metadata || {};
            const avg = row.rating_average !== null && row.rating_average !== undefined ? Number(row.rating_average) : (meta.rating || null);
            const sizeLabel = (meta.fileSize as string) || (meta.sizeLabel as string) || (meta.size as string) || (meta.tamanho as string) || "";
            return {
              id: row.id,
              name: row.name,
              status: row.status,
              created_at: row.created_at,
              updated_at: row.updated_at,
              ...meta,
              fileSize: (meta.fileSize as string) || sizeLabel,
              sizeLabel: sizeLabel,
              size: sizeLabel,
              sizeBytes: Number(meta.sizeBytes) || 0,
              coverImage: meta.coverImage || meta.mainCover || meta.horizontalBanner || "/images/so-much-to-love-cover.jpg",
              mainCover: meta.mainCover || meta.coverImage || "/images/so-much-to-love-cover.jpg",
              slug: meta.slug || slugify(row.name),
              engine: meta.engine || "Ren'Py",
              classification: meta.classification || "18",
              rating: avg,
              reviewCount: Number(row.review_count ?? meta.reviewCount ?? 0),
              commentsCount: Number(row.review_count ?? meta.commentsCount ?? 0),
              downloads: Number(row.download_count ?? meta.downloads ?? 0),
            };
          });

          if (q) {
            list = list.filter(
              (g) =>
                g.name?.toLowerCase().includes(q) ||
                g.description?.toLowerCase().includes(q) ||
                g.developer?.toLowerCase().includes(q) ||
                g.slug?.toLowerCase().includes(q) ||
                (Array.isArray(g.tags) && g.tags.some((t: string) => t.toLowerCase().includes(q)))
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
    if (!user.roles.some((role) => ["ADMIN", "DEVELOPER"].includes(role))) {
      return NextResponse.json({ error: "Permissão insuficiente para publicar jogos." }, { status: 403 });
    }

    const body = await request.json() as {
      name?: string;
      slug?: string;
      description?: string;
      shortDescription?: string;
      fullDescription?: string;
      developer?: string;
      publisher?: string;
      genre?: string;
      category?: string;
      engine?: string;
      customEngine?: string;
      classification?: string;
      version?: string;
      mainFileName?: string;
      fileSize?: string;
      sha256?: string;
      coverImage?: string;
      mainCover?: string;
      gameIcon?: string;
      bannerImage?: string;
      horizontalBanner?: string;
      trailerUrl?: string;
      githubUrl?: string;
      downloadUrl?: string;
      downloadMirrors?: Array<{ id: string; name?: string; url: string; provider?: string; priority?: number }>;
      platforms?: string[];
      systemRequirements?: Record<string, string>;
      languages?: string[];
      translationStatus?: string;
      translatedBy?: string;
      translationNotes?: string;
      status?: string;
      originalReleaseDate?: string;
      renplayPublishDate?: string;
      featuredOrder?: number;
      versionNotes?: string;
      releaseNotes?: string;
      responsibleDev?: string;
      responsibleTranslator?: string;
      editPermissions?: string;
      tags?: string[];
      screenshots?: string[];
    };

    const name = body.name?.trim();
    const shortDesc = (body.shortDescription || body.description || "").trim();
    const developer = body.developer?.trim();

    if (!name || !shortDesc || !developer) {
      return NextResponse.json(
        { error: "Nome, descrição e desenvolvedor são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanSlug = slugify(body.slug || name);
    const id = `${cleanSlug}-${Date.now().toString(36)}`;
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : body.status === "SUSPENDED" ? "SUSPENDED" : "DRAFT";

    const metadata = {
      ...body,
      slug: cleanSlug,
      name,
      developer,
      publisher: body.publisher?.trim() || "",
      genre: body.genre?.trim() || "Visual Novel",
      category: body.category?.trim() || "Visual Novel",
      engine: body.engine?.trim() || "Ren'Py",
      customEngine: body.customEngine?.trim() || "",
      classification: body.classification?.trim() || "18",
      shortDescription: shortDesc,
      description: shortDesc,
      fullDescription: body.fullDescription?.trim() || shortDesc,
      version: body.version?.trim() || "1.0.0",
      mainFileName: body.mainFileName?.trim() || "",
      fileSize: body.fileSize?.trim() || "",
      sha256: body.sha256?.trim() || "",
      downloadUrl: body.downloadUrl?.trim() || "",
      downloadMirrors: Array.isArray(body.downloadMirrors) ? body.downloadMirrors : [],
      platforms: Array.isArray(body.platforms) && body.platforms.length ? body.platforms : ["Windows"],
      systemRequirements: body.systemRequirements || {},
      languages: Array.isArray(body.languages) && body.languages.length ? body.languages : ["Português (Brasil)"],
      translationStatus: body.translationStatus?.trim() || "Completa",
      translatedBy: body.translatedBy?.trim() || "",
      translationNotes: body.translationNotes?.trim() || "",
      originalReleaseDate: body.originalReleaseDate || "",
      renplayPublishDate: body.renplayPublishDate || new Date().toISOString().split("T")[0],
      featuredOrder: Number(body.featuredOrder) || 0,
      versionNotes: (body.versionNotes || body.releaseNotes || "").trim(),
      releaseNotes: (body.versionNotes || body.releaseNotes || "").trim(),
      gameIcon: body.gameIcon?.trim() || "",
      mainCover: body.mainCover?.trim() || body.coverImage?.trim() || "",
      coverImage: body.mainCover?.trim() || body.coverImage?.trim() || body.gameIcon?.trim() || "",
      horizontalBanner: body.horizontalBanner?.trim() || body.bannerImage?.trim() || "",
      bannerImage: body.horizontalBanner?.trim() || body.bannerImage?.trim() || "",
      trailerUrl: body.trailerUrl?.trim() || "",
      githubUrl: body.githubUrl?.trim() || "",
      screenshots: Array.isArray(body.screenshots) ? body.screenshots : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      responsibleDev: body.responsibleDev?.trim() || "",
      responsibleTranslator: body.responsibleTranslator?.trim() || "",
      editPermissions: body.editPermissions?.trim() || "admin_only",
      rating: 5.0,
      reviewCount: 0,
      commentsCount: 0,
      downloads: 0
    };

    const result = await getDb().query(
      `INSERT INTO rp_games (id, name, status, metadata, created_by, distribution_authorized)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, status, metadata, created_at, updated_at`,
      [id, name, status, metadata, user.id, status === "PUBLISHED"]
    );

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
      featuredOrder?: number;
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
      ...(body.featured !== undefined ? { featured: body.featured } : {}),
      ...(body.featuredOrder !== undefined ? { featuredOrder: Number(body.featuredOrder) } : {})
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
