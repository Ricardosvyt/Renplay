"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VIP_PLANS } from "@/lib/subscriptions";

type UserProfile = {
  displayName: string;
  username: string;
  email: string;
  emailVerified: boolean;
};

type SubscriptionView = {
  vipLevel: number;
  plan: string | null;
  status: string;
  periodEnd: string | null;
  graceExpiresAt: string | null;
  canUpload: boolean;
  canDownload: boolean;
  maxSaves: number;
  maxBytes: number;
};

export default function PlansCheckoutPage() {
  const [user, setUser] = useState<UserProfile>({
    displayName: "Jogador RenPlay",
    username: "membro",
    email: "carregando...",
    emailVerified: false,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de checkout Stripe
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [demoModal, setDemoModal] = useState<{ open: boolean; planLevel: number; planName: string } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlUser = params.get("user");
        if (urlUser) {
          setUser((prev) => ({
            ...prev,
            displayName: urlUser,
            username: urlUser,
            email: `${urlUser}@renplay.site`,
          }));
        }

        if (params.get("success") === "true") {
          setSuccessBanner("🎉 Pagamento confirmado pela Stripe! Sua assinatura RenPlay VIP está ativa!");
        } else if (params.get("canceled") === "true") {
          setCheckoutError("O checkout da Stripe foi cancelado. Você pode tentar novamente a qualquer momento.");
        }
      }

      try {
        const meRes = await fetch("/api/v1/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setIsAuthenticated(true);
            setUser({
              displayName: meData.user.displayName || meData.user.display_name || meData.user.username,
              username: meData.user.username,
              email: meData.user.email,
              emailVerified: meData.user.emailVerified ?? true,
            });
          }
        }

        const subRes = await fetch("/api/v1/subscription", { cache: "no-store" });
        if (subRes.ok) {
          setSubscription(await subRes.json());
        }
      } catch (err) {
        console.warn("[Plans] Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSubscribeStripe = async (vipLevel: 1 | 2 | 3) => {
    setProcessingPlan(vipLevel);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/v1/subscription/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vipLevel }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        throw new Error(data.error?.message || "Falha ao iniciar checkout Stripe.");
      }

      if (data.url) {
        // Redireciona diretamente para o Stripe Checkout oficial
        window.location.href = data.url;
      } else if (data.isDemo) {
        // Stripe keys não configuradas ainda no .env
        setDemoModal({
          open: true,
          planLevel: vipLevel,
          planName: data.plan,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao processar assinatura.";
      setCheckoutError(msg);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleSimulateStripeSuccess = async (vipLevel: number) => {
    setProcessingPlan(vipLevel);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/v1/subscription/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vipLevel, simulatePayment: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Erro ao ativar assinatura de teste.");

      setSuccessBanner(`🎉 ${data.message}`);
      setDemoModal(null);

      // Recarrega status da assinatura
      const subRes = await fetch("/api/v1/subscription", { cache: "no-store" });
      if (subRes.ok) setSubscription(await subRes.json());
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Erro ao ativar.");
    } finally {
      setProcessingPlan(null);
    }
  };

  const isCurrentVip = Boolean(subscription?.vipLevel && subscription.status === "ACTIVE");
  const isGrace = subscription?.status === "GRACE_PERIOD";

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans selection:bg-[#ffd400] selection:text-black">
      {/* HEADER MINIMALISTA E PROFISSIONAL */}
      <header className="border-b border-zinc-800/80 sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400/20 text-[#ffd400] border border-amber-400/30">
                VIP STORE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-400">Assinante:</span>
              <strong className="text-zinc-200">@{user.username}</strong>
            </div>

            <Link
              href="/"
              className="text-xs font-bold text-zinc-400 hover:text-[#ffd400] transition-colors"
            >
              ← Voltar ao Catálogo
            </Link>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="text-xs font-black px-3.5 py-1.5 rounded-lg bg-[#ffd400] text-black hover:bg-[#ffe033] transition-colors shadow-md shadow-amber-500/10"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 text-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-amber-500/10 to-yellow-300/5 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[#ffd400] text-xs font-bold tracking-wide">
            <span>✦</span> OFICIAL RENPLAY CLOUD SAVE <span>✦</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Seus jogos e saves sincronizados <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#ffd400] via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              em qualquer lugar.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Nunca mais perca seu progresso em novelas visuais. Sincronização direta pelo launcher com armazenamento em nuvem privada e processamento 100% seguro via <strong>Stripe</strong>.
          </p>

          {/* BANNER DE STATUS ATUAL SE VIP OU CARÊNCIA */}
          {isCurrentVip && (
            <div className="mt-4 p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs inline-flex items-center gap-2">
              <span>👑</span>
              <span>Você possui o plano <strong>{subscription?.plan}</strong> ativo até {subscription?.periodEnd ? new Date(subscription.periodEnd).toLocaleDateString("pt-BR") : "o próximo ciclo"}.</span>
            </div>
          )}

          {isGrace && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs inline-flex items-center gap-2">
              <span>⚠️</span>
              <span>Sua assinatura está em <strong>carência de 30 dias</strong>. Renove abaixo para manter o envio de novos saves liberado.</span>
            </div>
          )}

          {successBanner && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs inline-flex items-center gap-2">
              <span>{successBanner}</span>
            </div>
          )}

          {checkoutError && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs inline-flex items-center gap-2">
              <span>⚠️ {checkoutError}</span>
            </div>
          )}
        </div>
      </section>

      {/* GRADE DE PLANOS STRIPE */}
      <main id="planos" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* PLANO 1: PLUS */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0d1017] p-6 sm:p-7 flex flex-col justify-between transition-all hover:border-zinc-700">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black tracking-widest uppercase text-zinc-400">Plano Inicial</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">50 Saves</span>
              </div>
              <h3 className="text-xl font-black text-white">{VIP_PLANS[1].name}</h3>
              <p className="text-xs text-zinc-400 mt-1">Ideal para quem joga poucas histórias simultaneamente.</p>

              <div className="my-6">
                <span className="text-xs text-zinc-400">R$ </span>
                <strong className="text-3xl font-black text-white">14,90</strong>
                <span className="text-xs text-zinc-400"> / mês</span>
              </div>

              <div className="border-t border-zinc-800/80 pt-5 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>50 slots globais</strong> de saves na nuvem</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>150 MB</strong> de armazenamento dedicado</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Sincronização com 1 clique pelo launcher</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Backup automático de proteção (.previous)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Cancelamento fácil a qualquer momento</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                type="button"
                disabled={processingPlan === 1}
                onClick={() => handleSubscribeStripe(1)}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all border border-zinc-700 disabled:opacity-50"
              >
                {processingPlan === 1 ? "Iniciando Stripe..." : "Assinar Plus via Stripe"}
              </button>
            </div>
          </div>

          {/* PLANO 2: PRO (DESTAQUE DOURADO) */}
          <div className="rounded-2xl border-2 border-[#ffd400] bg-gradient-to-b from-[#161a22] to-[#0d1017] p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-amber-500/10 relative transition-all scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ffd400] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              ★ Mais Popular ★
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-black tracking-widest uppercase text-[#ffd400]">Recomendado</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-[#ffd400] border border-amber-400/30">150 Saves</span>
              </div>
              <h3 className="text-2xl font-black text-white">{VIP_PLANS[2].name}</h3>
              <p className="text-xs text-zinc-400 mt-1">A escolha ideal para jogadores frequentes de visual novels.</p>

              <div className="my-6">
                <span className="text-xs text-zinc-400">R$ </span>
                <strong className="text-4xl font-black text-[#ffd400]">24,90</strong>
                <span className="text-xs text-zinc-400"> / mês</span>
              </div>

              <div className="border-t border-zinc-800/80 pt-5 space-y-3 text-xs text-zinc-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ffd400] font-black">✓</span>
                  <span><strong>150 slots globais</strong> de saves na nuvem</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ffd400] font-black">✓</span>
                  <span><strong>500 MB</strong> de armazenamento dedicado</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ffd400] font-black">✓</span>
                  <span>Até 10 saves na nuvem por jogo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ffd400] font-black">✓</span>
                  <span>Prioridade máxima de restauração</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ffd400] font-black">✓</span>
                  <span>Suporte prioritário RenPlay</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                type="button"
                disabled={processingPlan === 2}
                onClick={() => handleSubscribeStripe(2)}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#ffd400] via-yellow-300 to-amber-400 text-black hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {processingPlan === 2 ? "Iniciando Stripe..." : "Assinar Pro via Stripe"}
              </button>
            </div>
          </div>

          {/* PLANO 3: ULTRA */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0d1017] p-6 sm:p-7 flex flex-col justify-between transition-all hover:border-zinc-700">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black tracking-widest uppercase text-zinc-400">Poder Total</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">400 Saves</span>
              </div>
              <h3 className="text-xl font-black text-white">{VIP_PLANS[3].name}</h3>
              <p className="text-xs text-zinc-400 mt-1">Para colecionadores e jogadores que exploram dezenas de rotas.</p>

              <div className="my-6">
                <span className="text-xs text-zinc-400">R$ </span>
                <strong className="text-3xl font-black text-white">39,90</strong>
                <span className="text-xs text-zinc-400"> / mês</span>
              </div>

              <div className="border-t border-zinc-800/80 pt-5 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>400 slots globais</strong> de saves na nuvem</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>1,5 GB</strong> de armazenamento de saves</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Slots ilimitados por jogo Ren'Py</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Badge Lendária Ouro no perfil</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Acesso antecipado a novos recursos</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/80">
              <button
                type="button"
                disabled={processingPlan === 3}
                onClick={() => handleSubscribeStripe(3)}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all border border-zinc-700 disabled:opacity-50"
              >
                {processingPlan === 3 ? "Iniciando Stripe..." : "Assinar Ultra via Stripe"}
              </button>
            </div>
          </div>

        </div>

        {/* GARANTIAS E FAQ */}
        <div className="mt-16 pt-12 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-2xl mb-2 block">🛡️</span>
            <h4 className="font-bold text-sm text-white">Saves Locais Preservados</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              O ciclo da nuvem nunca apaga nem substitui seus arquivos locais sem seu consentimento expresso. Seus saves no PC continuam 100% seguros.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-2xl mb-2 block">💳</span>
            <h4 className="font-bold text-sm text-white">Checkout Seguro Stripe</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Pagamento processado em ambiente certificado PCI-DSS nível 1 pela Stripe. Aceita Cartão de Crédito internacional e nacional, com renovação automática e cancelamento simples.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <span className="text-2xl mb-2 block">⏳</span>
            <h4 className="font-bold text-sm text-white">Carência Gratuita de 30 Dias</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Se você decidir pausar a assinatura, seus saves ficam guardados por 30 dias na nuvem com download gratuito garantido para resgate.
            </p>
          </div>
        </div>
      </main>

      {/* MODAL DE DEMONSTRAÇÃO / DESENVOLVIMENTO STRIPE */}
      {demoModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161f] border border-amber-400/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-base font-black text-white">Ambiente Stripe Conectado</h3>
                <p className="text-xs text-zinc-400">Ativação de plano para @{user.username}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Você selecionou o plano <strong>{demoModal.planName}</strong>. Em ambiente de produção com a chave <code className="text-[#ffd400]">STRIPE_SECRET_KEY</code> cadastrada, este botão redireciona para a página oficial do Stripe Checkout.
            </p>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div>• <strong>Assinante:</strong> @{user.username}</div>
              <div>• <strong>Plano:</strong> {demoModal.planName}</div>
              <div>• <strong>Vigência:</strong> 30 dias renováveis</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDemoModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => handleSimulateStripeSuccess(demoModal.planLevel)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#ffd400] text-black hover:bg-[#ffe033] transition-colors"
              >
                Confirmar Ativação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
