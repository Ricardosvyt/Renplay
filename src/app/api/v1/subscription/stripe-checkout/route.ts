import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { activateOrRenewSubscription, VIP_PLANS } from "@/lib/subscriptions";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para assinar um plano." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      vipLevel?: number;
      vip_level?: number;
      simulatePayment?: boolean;
    };

    const rawLevel = Number(body.vipLevel ?? body.vip_level ?? 2);
    if (![1, 2, 3].includes(rawLevel)) {
      return NextResponse.json(
        { error: { code: "INVALID_PLAN", message: "Escolha um plano VIP válido (Plus, Pro ou Ultra)." } },
        { status: 400 }
      );
    }

    const vipLevel = rawLevel as 1 | 2 | 3;
    const plan = VIP_PLANS[vipLevel];

    // Se solicitado em modo demonstração/dev direto
    if (body.simulatePayment) {
      const updatedSub = await activateOrRenewSubscription(user.id, {
        vipLevel,
        periodDays: 30,
        paymentReference: `stripe_sim_${user.id}_${Date.now()}`
      });

      return NextResponse.json(
        {
          success: true,
          isSimulated: true,
          message: `Assinatura do ${plan.name} ativada com sucesso!`,
          plan: plan.name,
          subscription: updatedSub
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const origin = request.headers.get("origin") || "https://www.renplay.site";

    const checkout = await createStripeCheckoutSession({
      userId: user.id,
      username: user.username,
      email: user.email,
      vipLevel,
      origin,
    });

    return NextResponse.json(
      {
        success: true,
        url: checkout.url,
        sessionId: checkout.sessionId,
        isDemo: checkout.isDemo,
        plan: checkout.plan.name,
        message: checkout.isDemo ? checkout.message : "Redirecionando para o Stripe Checkout..."
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Erro ao iniciar checkout Stripe.";
    console.error("[Stripe Checkout API] Erro:", errMsg);
    return NextResponse.json(
      { error: { code: "STRIPE_ERROR", message: errMsg } },
      { status: 500 }
    );
  }
}
