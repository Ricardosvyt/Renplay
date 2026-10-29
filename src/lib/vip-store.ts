import type { Pool, PoolClient } from "pg";
import { getDb } from "@/lib/db";
import { VIP_PLANS, type VipPlan, type VipPlanLevel } from "@/lib/subscription-plans";

export type VipStoreSettings = {
  enabled: boolean;
  currency: "brl";
  priceCents: Record<VipPlanLevel, number>;
};

export const DEFAULT_VIP_STORE_SETTINGS: VipStoreSettings = {
  enabled: true,
  currency: "brl",
  priceCents: { 1: 1490, 2: 2490, 3: 3990 },
};

function validCents(value: unknown, fallback: number) {
  const cents = Number(value);
  return Number.isInteger(cents) && cents >= 100 && cents <= 1_000_000 ? cents : fallback;
}

export function normalizeVipStoreSettings(value: unknown): VipStoreSettings {
  const input = value && typeof value === "object" ? value as { enabled?: unknown; priceCents?: Record<string, unknown> } : {};
  return {
    enabled: input.enabled !== false,
    currency: "brl",
    priceCents: {
      1: validCents(input.priceCents?.["1"], DEFAULT_VIP_STORE_SETTINGS.priceCents[1]),
      2: validCents(input.priceCents?.["2"], DEFAULT_VIP_STORE_SETTINGS.priceCents[2]),
      3: validCents(input.priceCents?.["3"], DEFAULT_VIP_STORE_SETTINGS.priceCents[3]),
    },
  };
}

export async function getVipStoreSettings(db: Pool | PoolClient = getDb()) {
  const result = await db.query<{ value: unknown }>("SELECT value FROM rp_settings WHERE key = 'vip_store' LIMIT 1");
  return normalizeVipStoreSettings(result.rows[0]?.value);
}

export async function getVipPlans(db: Pool | PoolClient = getDb()): Promise<Record<VipPlanLevel, VipPlan>> {
  const settings = await getVipStoreSettings(db);
  return {
    1: { ...VIP_PLANS[1], monthlyPriceBRL: settings.priceCents[1] / 100 },
    2: { ...VIP_PLANS[2], monthlyPriceBRL: settings.priceCents[2] / 100 },
    3: { ...VIP_PLANS[3], monthlyPriceBRL: settings.priceCents[3] / 100 },
  };
}
