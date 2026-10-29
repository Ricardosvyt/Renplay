import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getSubscription } from "@/lib/subscriptions";
import { getVipPlans } from "@/lib/vip-store";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Entre na sua conta." } }, { status: 401 });
  const db = getDb();
  const [subscription, usage, count, plans] = await Promise.all([
    getSubscription(user.id, db),
    db.query<{ confirmed_bytes: string }>("SELECT confirmed_bytes FROM rp_cloud_storage_usage WHERE user_id = $1", [user.id]),
    db.query<{ total: string }>("SELECT count(*)::text AS total FROM rp_cloud_saves WHERE user_id = $1 AND status = 'ACTIVE'", [user.id]),
    getVipPlans(db)
  ]);
  return NextResponse.json({
    role: user.roles.find((role) => role !== "VIP" && role !== "USER") ?? "MEMBRO",
    subscription,
    usage: { saves: Number(count.rows[0]?.total || 0), bytes: Number(usage.rows[0]?.confirmed_bytes || 0) },
    plans
  }, { headers: { "Cache-Control": "no-store" } });
}
