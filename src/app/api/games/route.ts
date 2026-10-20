import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

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
        const query = `
          SELECT g.id, g.name, g.status, g.metadata, g.created_at, g.updated_at
          FROM rp_games g
          WHERE g.status = 'PUBLISHED'
          ORDER BY g.updated_at DESC
        `;
        const res = await p.query(query);
        if (res.rows.length > 0) {
          let list = res.rows.map((row) => ({
            id: row.id,
            name: row.name,
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
