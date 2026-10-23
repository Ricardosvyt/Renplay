import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getBearerUser } from "@/lib/auth";
import launcherCatalogMetrics from "@/lib/launcher-catalog-query.cjs";

function authorized(request: Request) {
  const configured = process.env.LAUNCHER_API_KEY?.trim();
  if (!configured) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-renplay-api-key") === configured;
}

export async function GET(request: Request) {
  try {
    if (!authorized(request) && !await getBearerUser(request)) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre na sua conta para consultar os jogos." } }, { status: 401 });
    const result = await getDb().query(launcherCatalogMetrics.launcherCatalogQuery);
    const games = result.rows.map(launcherCatalogMetrics.mapLauncherCatalogGame);
    const users = await getDb().query<{ total: string }>("SELECT count(*)::text AS total FROM rp_users WHERE active = true AND banned = false");
    return NextResponse.json({ apiVersion: "v1", games, userCount: Number(users.rows[0]?.total || 0) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "CATALOG_UNAVAILABLE", message: "Catálogo do launcher indisponível." } }, { status: 503 }); }
}
