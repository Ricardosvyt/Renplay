import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { activateOrRenewSubscription } from "@/lib/subscriptions";
import { getVipPlans, getVipStoreSettings } from "@/lib/vip-store";

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
      paymentMethod?: string;
      payment_method?: string;
      reference?: string;
    };

    const rawLevel = Number(body.vipLevel ?? body.vip_level);
    if (![1, 2, 3].includes(rawLevel)) {
      return NextResponse.json(
        { error: { code: "INVALID_PLAN", message: "Escolha um plano VIP válido (Plus, Pro ou Ultra)." } },
        { status: 400 }
      );
    }

    const vipLevel = rawLevel as 1 | 2 | 3;
    const storeSettings = await getVipStoreSettings();
    if (!storeSettings.enabled) {
      return NextResponse.json({ error: { code: "STORE_DISABLED", message: "A VIP Store está temporariamente indisponível." } }, { status: 503 });
    }
    const plan = (await getVipPlans())[vipLevel];
    const method = body.paymentMethod || body.payment_method || "pix";
    const ref = body.reference || `gw_${method}_${user.id}_${Date.now()}`;

    // Confirm payment and activate/renew subscription
    const updatedSub = await activateOrRenewSubscription(user.id, {
      vipLevel,
      periodDays: 30,
      paymentReference: ref
    });

    return NextResponse.json(
      {
        success: true,
        message: `Pagamento via ${method.toUpperCase()} confirmado! Seu plano ${plan.name} está ativo por 30 dias.`,
        plan: plan.name,
        subscription: updatedSub
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Falha ao processar pagamento.";
    console.error("[Checkout API] Erro:", errMsg);
    return NextResponse.json(
      { error: { code: "PAYMENT_FAILED", message: errMsg } },
      { status: 500 }
    );
  }
}
