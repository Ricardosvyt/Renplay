export const VIP_PLANS = {
  1: { name: "RenPlay Plus", monthlyPriceBRL: 14.90, maxSaves: 50, maxBytes: 150_000_000 },
  2: { name: "RenPlay Pro", monthlyPriceBRL: 24.90, maxSaves: 150, maxBytes: 500_000_000 },
  3: { name: "RenPlay Ultra", monthlyPriceBRL: 39.90, maxSaves: 400, maxBytes: 1_500_000_000 }
} as const;

export type VipLevel = 0 | 1 | 2 | 3;
export type SubscriptionStatus = "NONE" | "ACTIVE" | "CANCELED_BUT_ACTIVE" | "GRACE_PERIOD" | "DELETION_PENDING" | "DELETED" | "LEGACY_REVIEW";

export type SubscriptionRow = {
  vip_level: VipLevel;
  subscription_status: SubscriptionStatus;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  grace_expires_at: Date | null;
  last_payment_confirmed_at: Date | null;
};

export function effectiveSubscription(row: SubscriptionRow | null, now = new Date()) {
  const level = row?.vip_level ?? 0;
  const periodEnd = row?.current_period_end ? new Date(row.current_period_end) : null;
  const graceEnd = row?.grace_expires_at ? new Date(row.grace_expires_at) : periodEnd
    ? new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const paid = Boolean(level && row?.last_payment_confirmed_at && periodEnd && now < periodEnd &&
    (row.subscription_status === "ACTIVE" || row.subscription_status === "CANCELED_BUT_ACTIVE"));
  const grace = Boolean(level && row?.last_payment_confirmed_at && periodEnd && now >= periodEnd && graceEnd && now < graceEnd &&
    row.subscription_status !== "DELETED" && row.subscription_status !== "DELETION_PENDING");
  const status: SubscriptionStatus = paid
    ? row!.cancel_at_period_end ? "CANCELED_BUT_ACTIVE" : "ACTIVE"
    : grace ? "GRACE_PERIOD"
    : row?.subscription_status === "DELETED" ? "DELETED"
    : row?.subscription_status === "LEGACY_REVIEW" ? "LEGACY_REVIEW"
    : row?.last_payment_confirmed_at && periodEnd && now >= periodEnd ? "DELETION_PENDING" : "NONE";
  const plan = level ? VIP_PLANS[level] : null;
  return {
    vipLevel: paid || grace ? level : 0,
    plan: paid || grace ? plan?.name ?? null : null,
    status,
    periodEnd: periodEnd?.toISOString() ?? null,
    graceExpiresAt: graceEnd?.toISOString() ?? null,
    canUpload: paid,
    canDownload: paid || grace || status === "LEGACY_REVIEW",
    maxSaves: paid || grace ? plan?.maxSaves ?? 0 : 0,
    maxBytes: paid || grace ? plan?.maxBytes ?? 0 : 0
  };
}
