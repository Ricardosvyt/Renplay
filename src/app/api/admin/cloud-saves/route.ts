import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canManageUsers } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!canManageUsers(user)) return NextResponse.json({ error: "Apenas administradores podem consultar saves de usuários." }, { status: 403 });

  try {
    const db = getDb();
    const gamesResult = await db.query<{
      id: string; name: string; status: string; save_count: string; user_count: string; total_bytes: string;
    }>(`
      SELECT g.id, g.name, g.status, COUNT(*)::text AS save_count,
             COUNT(DISTINCT s.user_id)::text AS user_count,
             COALESCE(SUM(s.file_size), 0)::text AS total_bytes
        FROM rp_cloud_saves s
        JOIN rp_games g ON g.id = s.game_id
       WHERE s.status = 'ACTIVE'
       GROUP BY g.id, g.name, g.status
       ORDER BY MAX(s.updated_at) DESC
    `);
    const games = gamesResult.rows.map((row) => ({
      id: row.id, name: row.name, status: row.status,
      saveCount: Number(row.save_count), userCount: Number(row.user_count), totalBytes: Number(row.total_bytes),
    }));
    const gameId = request.nextUrl.searchParams.get("gameId") || games[0]?.id || "";
    const rawPage = Number(request.nextUrl.searchParams.get("page") || "1");
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100000) : 1;
    if (!gameId) return NextResponse.json({ games, gameId: null, saves: [], total: 0, page, pageSize: 25 }, { headers: { "Cache-Control": "no-store" } });

    const count = await db.query<{ total: string }>(
      "SELECT COUNT(*)::text AS total FROM rp_cloud_saves WHERE game_id = $1 AND status = 'ACTIVE'",
      [gameId]
    );
    const saves = await db.query<{
      id: string; user_id: string; username: string; email: string; slot_number: number;
      original_filename: string; file_size: string; version: number; game_version: string; updated_at: string;
    }>(`
      SELECT s.id, s.user_id, u.username, u.email, s.slot_number,
             s.original_filename, s.file_size, s.version, s.game_version, s.updated_at
        FROM rp_cloud_saves s
        JOIN rp_users u ON u.id = s.user_id
       WHERE s.game_id = $1 AND s.status = 'ACTIVE'
       ORDER BY s.updated_at DESC, s.id
       LIMIT 25 OFFSET $2
    `, [gameId, (page - 1) * 25]);
    return NextResponse.json({
      games, gameId, total: Number(count.rows[0]?.total || 0), page, pageSize: 25,
      saves: saves.rows.map((row) => ({
        id: row.id, userId: row.user_id, username: row.username, email: row.email,
        slotNumber: row.slot_number, filename: row.original_filename,
        sizeBytes: Number(row.file_size), version: row.version,
        gameVersion: row.game_version, updatedAt: row.updated_at,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao listar saves Premium no painel:", error);
    return NextResponse.json({ error: "Não foi possível carregar os saves." }, { status: 500 });
  }
}
