import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { activateOrRenewSubscription } from "@/lib/subscriptions";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  let event: any;

  try {
    const rawBody = await request.text();

    if (stripe && webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("[Stripe Webhook] Erro de assinatura:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const rawLevel = Number(session.metadata?.vipLevel || 2);
        const vipLevel = ([1, 2, 3].includes(rawLevel) ? rawLevel : 2) as 1 | 2 | 3;

        if (userId) {
          await activateOrRenewSubscription(userId, {
            vipLevel,
            periodDays: 30,
            paymentReference: session.id || session.payment_intent || `stripe_${Date.now()}`
          });
          console.log(`[Stripe Webhook] Assinatura ativada para usuário ${userId} — Nível ${vipLevel}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const userId = invoice.subscription_details?.metadata?.userId || invoice.metadata?.userId;
        const rawLevel = Number(invoice.metadata?.vipLevel || 2);
        const vipLevel = ([1, 2, 3].includes(rawLevel) ? rawLevel : 2) as 1 | 2 | 3;

        if (userId) {
          await activateOrRenewSubscription(userId, {
            vipLevel,
            periodDays: 30,
            paymentReference: invoice.id || `stripe_inv_${subscriptionId}`
          });
          console.log(`[Stripe Webhook] Renovação confirmada para usuário ${userId}`);
        }
        break;
      }

      default:
        // Outros eventos
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno ao processar webhook";
    console.error("[Stripe Webhook] Falha de execução:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
