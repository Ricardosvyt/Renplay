import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";
import { getVipPlans, getVipStoreSettings, normalizeVipStoreSettings } from "@/lib/vip-store";

async function requireAdmin(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return { response: NextResponse.json({ error: "Autenticação necessária." }, { status: 401 }) };
  if (!canManageSettings(user)) return { response: NextResponse.json({ error: "Apenas administradores podem alterar preços." }, { status: 403 }) };
  return { user };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const db = getDb();
  const [settings, plans] = await Promise.all([getVipStoreSettings(db), getVipPlans(db)]);
  return NextResponse.json({ settings, plans }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response || !auth.user) return auth.response;
  try {
    const body = await request.json() as { enabled?: unknown; priceCents?: Record<string, unknown> };
    for (const level of ["1", "2", "3"] as const) {
      const value = Number(body.priceCents?.[level]);
      if (!Number.isInteger(value) || value < 100 || value > 1_000_000) {
        return NextResponse.json({ error: "Cada preço deve ficar entre R$ 1,00 e R$ 10.000,00." }, { status: 400 });
      }
    }
    const settings = normalizeVipStoreSettings(body);
    const client = await getDb().connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO rp_settings(key,value) VALUES('vip_store',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value", [JSON.stringify(settings)]);
      await client.query("INSERT INTO rp_audit(actor_id,action,resource,metadata) VALUES($1,'vip_store.prices','vip_store',$2)", [auth.user.id, JSON.stringify({ priceCents: settings.priceCents, enabled: settings.enabled })]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return NextResponse.json({ success: true, settings, plans: await getVipPlans() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar os preços." }, { status: 400 });
  }
}
