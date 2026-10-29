import { NextResponse } from "next/server";
import { getVipPlans, getVipStoreSettings } from "@/lib/vip-store";

export async function GET() {
  const [settings, plans] = await Promise.all([getVipStoreSettings(), getVipPlans()]);
  return NextResponse.json({ enabled: settings.enabled, currency: settings.currency, plans }, { headers: { "Cache-Control": "no-store" } });
}
