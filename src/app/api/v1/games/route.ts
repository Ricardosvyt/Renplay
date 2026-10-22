import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getBearerUser } from "@/lib/auth";

function authorized(request: Request) {
  const configured = process.env.LAUNCHER_API_KEY?.trim();
  if (!configured) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-renplay-api-key") === configured;
}

export async function GET(request: Request) {
  try {
    if (!authorized(request) && !await getBearerUser(request)) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre na sua conta para consultar os jogos." } }, { status: 401 });
    const result = await getDb().query<{ id: string; name: string; status: string; metadata: Record<string, unknown>; updated_at: string }>(
      `SELECT id, name, status, metadata, updated_at FROM rp_games
        WHERE status = 'PUBLISHED' AND distribution_authorized = true
        ORDER BY updated_at DESC`
    );
    const games = result.rows.map((game) => ({ id: game.id, name: game.name, status: game.status, updatedAt: game.updated_at, ...game.metadata }));
    const users = await getDb().query<{ total: string }>("SELECT count(*)::text AS total FROM rp_users WHERE active = true AND banned = false");
    return NextResponse.json({ apiVersion: "v1", games, userCount: Number(users.rows[0]?.total || 0) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "CATALOG_UNAVAILABLE", message: "Catálogo do launcher indisponível." } }, { status: 503 }); }
}
