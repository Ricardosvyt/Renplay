import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre no launcher para acessar traduções." } }, { status: 401 });
  const result = await getDb().query("SELECT id, game_id, language, version, compatible_versions, status, notes FROM rp_translations WHERE status = 'PUBLISHED' ORDER BY created_at DESC");
  return NextResponse.json({ translations: result.rows });
}
