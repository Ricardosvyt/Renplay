import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getSubscription } from "@/lib/subscriptions";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre na sua conta." } }, { status: 401 });
  const db = getDb();
  const subscription = await getSubscription(user.id, db);
  if (!subscription.canDownload) return NextResponse.json({ subscription, saves: [] }, { headers: { "Cache-Control": "no-store" } });
  const result = await db.query<{ game_id: string; game_name: string; slot_number: number; original_filename: string; file_size: string; updated_at: Date }>(
    `SELECT g.public_id::text AS game_id, g.name AS game_name, s.slot_number,
            s.original_filename, s.file_size::text, s.updated_at
       FROM rp_cloud_saves s JOIN rp_games g ON g.id = s.game_id
      WHERE s.user_id = $1 AND s.status = 'ACTIVE'
      ORDER BY g.name, s.slot_number`, [user.id]);
  return NextResponse.json({ subscription, saves: result.rows.map(row => ({
    gameId: row.game_id, gameName: row.game_name, slotNumber: row.slot_number,
    filename: row.original_filename, sizeBytes: Number(row.file_size), updatedAt: row.updated_at
  })) }, { headers: { "Cache-Control": "no-store" } });
}
