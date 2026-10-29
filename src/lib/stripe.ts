import Stripe from "stripe";
import { getVipPlans, getVipStoreSettings } from "@/lib/vip-store";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      // Mantém a versão já usada em produção; a migração de API Stripe é uma mudança separada.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2025-02-24.acacia" as any,
      appInfo: {
        name: "RenPlay VIP Subscriptions",
        version: "1.0.0",
      },
    })
  : null;

export interface CreateCheckoutSessionParams {
  userId: string;
  username: string;
  email?: string;
  vipLevel: 1 | 2 | 3;
  origin: string;
}

export async function createStripeCheckoutSession({
  userId,
  username,
  email,
  vipLevel,
  origin,
}: CreateCheckoutSessionParams) {
  const settings = await getVipStoreSettings();
  if (!settings.enabled) throw new Error("A VIP Store está temporariamente indisponível.");
  const plan = (await getVipPlans())[vipLevel];
  if (!plan) throw new Error("Plano VIP inválido.");

  if (!stripe) {
    // Modo de demonstração / desenvolvimento quando STRIPE_SECRET_KEY não foi informada
    return {
      url: null,
      isDemo: true,
      message: "STRIPE_SECRET_KEY não configurada no .env. Ativação via ambiente de desenvolvimento disponível.",
      plan,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email && email.includes("@") ? email : undefined,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${plan.name} — Assinatura Mensal`,
            description: `Acesso a ${plan.maxSaves} saves na nuvem e ${Math.round(plan.maxBytes / (1024 * 1024))} MB de Cloud Save no RenPlay`,
            images: [`${origin}/Logo.png`],
          },
          unit_amount: Math.round(plan.monthlyPriceBRL * 100),
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      username,
      vipLevel: String(vipLevel),
    },
    subscription_data: {
      metadata: {
        userId,
        username,
        vipLevel: String(vipLevel),
      },
    },
    success_url: `${origin}/portal?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${vipLevel}#planos`,
    cancel_url: `${origin}/portal?canceled=true#planos`,
  });

  return {
    url: session.url,
    sessionId: session.id,
    isDemo: false,
    plan,
  };
}
