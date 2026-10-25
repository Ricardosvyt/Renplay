import { getDb } from "@/lib/db";
import type { Pool, PoolClient } from "pg";

export const VIP_PLANS = {
  1: { name: "RenPlay Plus", monthlyPriceBRL: 14.90, maxSaves: 50, maxBytes: 150_000_000 },
  2: { name: "RenPlay Pro", monthlyPriceBRL: 24.90, maxSaves: 150, maxBytes: 500_000_000 },
  3: { name: "RenPlay Ultra", monthlyPriceBRL: 39.90, maxSaves: 400, maxBytes: 1_500_000_000 }
} as const;

export type VipLevel = 0 | 1 | 2 | 3;
export type SubscriptionStatus = "NONE" | "ACTIVE" | "CANCELED_BUT_ACTIVE" | "GRACE_PERIOD" | "DELETION_PENDING" | "DELETED" | "LEGACY_REVIEW";

type Row = {
  vip_level: VipLevel;
  subscription_status: SubscriptionStatus;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  grace_expires_at: Date | null;
  last_payment_confirmed_at: Date | null;
};

export function effectiveSubscription(row: Row | null, now = new Date()) {
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

export async function getSubscription(userId: string, db: Pool | PoolClient = getDb()) {
  const result = await db.query<Row>(
    `SELECT vip_level, subscription_status, current_period_end, cancel_at_period_end,
            grace_expires_at, last_payment_confirmed_at
       FROM rp_subscriptions WHERE user_id = $1`, [userId]);
  return effectiveSubscription(result.rows[0] ?? null);
}

export interface ActivateSubscriptionOptions {
  vipLevel: 1 | 2 | 3;
  periodDays?: number;
  paymentReference?: string;
  cancelAtPeriodEnd?: boolean;
}

export async function activateOrRenewSubscription(
  userId: string,
  options: ActivateSubscriptionOptions,
  client?: Pool | PoolClient
) {
  const db = client ?? getDb();
  const days = options.periodDays && options.periodDays > 0 ? options.periodDays : 30;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const paymentRef = options.paymentReference || `ref_${userId}_${now.getTime()}`;

  const res = await db.query<Row>(
    `INSERT INTO rp_subscriptions (
       user_id, vip_level, subscription_status, current_period_start, current_period_end,
       cancel_at_period_end, grace_started_at, grace_expires_at, cloud_deletion_status,
       cloud_deleted_at, last_payment_confirmed_at, payment_reference, updated_at
     ) VALUES (
       $1, $2, 'ACTIVE', now(), $3, $4, NULL, NULL, 'NONE', NULL, now(), $5, now()
     )
     ON CONFLICT (user_id) DO UPDATE
       SET vip_level = EXCLUDED.vip_level,
           subscription_status = 'ACTIVE',
           current_period_start = now(),
           current_period_end = $3,
           cancel_at_period_end = EXCLUDED.cancel_at_period_end,
           grace_started_at = NULL,
           grace_expires_at = NULL,
           cloud_deletion_status = 'NONE',
           cloud_deleted_at = NULL,
           last_payment_confirmed_at = now(),
           payment_reference = EXCLUDED.payment_reference,
           updated_at = now()
     RETURNING vip_level, subscription_status, current_period_end, cancel_at_period_end,
               grace_expires_at, last_payment_confirmed_at`,
    [userId, options.vipLevel, periodEnd, Boolean(options.cancelAtPeriodEnd), paymentRef]
  );

  // Cancel any scheduled cleanup jobs for this user
  await db.query(
    "UPDATE rp_cloud_cleanup_jobs SET status = 'DONE', updated_at = now() WHERE user_id = $1 AND status = 'PENDING'",
    [userId]
  ).catch(() => undefined);

  // Send renewal notification
  const planName = VIP_PLANS[options.vipLevel]?.name || `Nível ${options.vipLevel}`;
  await db.query(
    `INSERT INTO rp_notifications (user_id, title, body)
     VALUES ($1, 'RenPlay VIP Ativado', $2)`,
    [userId, `Seu plano ${planName} está ativo até ${periodEnd.toLocaleDateString('pt-BR')}. Seus saves na nuvem estão protegidos!`]
  ).catch(() => undefined);

  return effectiveSubscription(res.rows[0], now);
}

export async function cancelSubscriptionRenewal(
  userId: string,
  client?: Pool | PoolClient
) {
  const db = client ?? getDb();
  const res = await db.query<Row>(
    `UPDATE rp_subscriptions
        SET cancel_at_period_end = true,
            subscription_status = 'CANCELED_BUT_ACTIVE',
            updated_at = now()
      WHERE user_id = $1
    RETURNING vip_level, subscription_status, current_period_end, cancel_at_period_end,
              grace_expires_at, last_payment_confirmed_at`,
    [userId]
  );
  return effectiveSubscription(res.rows[0] ?? null);
}
