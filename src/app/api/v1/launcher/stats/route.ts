import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const result = await getDb().query<{ users: string; games: string }>("SELECT (SELECT count(*) FROM rp_users WHERE active = true AND banned = false)::text AS users, (SELECT count(*) FROM rp_games WHERE status = 'PUBLISHED')::text AS games");
    return NextResponse.json({ users: Number(result.rows[0]?.users || 0), games: Number(result.rows[0]?.games || 0) });
  } catch { return NextResponse.json({ error: { code: "STATS_UNAVAILABLE", message: "Estatísticas indisponíveis." } }, { status: 503 }); }
}
