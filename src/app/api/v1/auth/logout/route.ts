import { NextResponse } from "next/server";
import { getBearerUser, hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getBearerUser(request).catch(() => null);
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (user && token) await getDb().query("UPDATE rp_sessions SET revoked_at = now() WHERE token_hash = $1", [hashToken(token)]).catch(() => undefined);
  return NextResponse.json({ success: true });
}
