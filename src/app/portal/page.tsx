"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatImageUrl } from "@/lib/image-url";
import { exportCloudSavesZip } from "@/lib/browser-save-zip";

interface UserProfile {
  displayName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  mfaEnabled: boolean;
}

interface LibraryGame {
  id: string;
  name: string;
  version: string;
  developer: string;
  favorite: boolean;
  coverImage: string;
}

type SubscriptionView = {
  subscription: { vipLevel: number; plan: string | null; status: string; periodEnd: string | null; graceExpiresAt: string | null; maxSaves: number; maxBytes: number; canDownload: boolean };
  usage: { saves: number; bytes: number };
  plans: Record<string, { name: string; monthlyPriceBRL: number; maxSaves: number; maxBytes: number }>;
};
type CloudSaveView = { gameId: string; gameName: string; slotNumber: number; filename: string; sizeBytes: number; updatedAt: string };

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<"account" | "library" | "notifications" | "security">("account");
  const [isDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("renplay_theme") !== "light";
    }
    return true;
  });

  const [user, setUser] = useState<UserProfile>({
    displayName: "Comandante RenPlay",
    username: "player_one",
    email: "player@renplay.com.br",
    emailVerified: true,
    roles: ["PLAYER"],
    mfaEnabled: false,
  });

  const [library, setLibrary] = useState<LibraryGame[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [cloudSaves, setCloudSaves] = useState<CloudSaveView[]>([]);
  const [saveError, setSaveError] = useState("");
  const [zipProgress, setZipProgress] = useState("");
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  // Estados do Gateway de Pagamento VIP
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanLevel, setSelectedPlanLevel] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Rolagem suave para planos quando chamado do launcher com planSelect=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("planSelect") === "true" || window.location.hash === "#planos") {
        setActiveTab("account");
        setTimeout(() => {
          document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
        }, 350);
      }
    }
  }, []);

  const handleConfirmPayment = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/v1/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vipLevel: selectedPlanLevel,
          paymentMethod
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Falha ao processar pagamento.");
      setCheckoutSuccess(data.message || "Pagamento confirmado com sucesso!");
      const subRes = await fetch("/api/v1/subscription", { cache: "no-store" });
      if (subRes.ok) setSubscription(await subRes.json());
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Erro ao processar pagamento.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Carrega usuário autenticado e biblioteca sincronizada
  useEffect(() => {
    async function loadPortalData() {
      try {
        const meRes = await fetch("/api/v1/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setUser({
              displayName: meData.user.displayName || meData.user.username,
              username: meData.user.username,
              email: meData.user.email,
              emailVerified: meData.user.emailVerified ?? true,
              roles: meData.user.roles || ["PLAYER"],
              mfaEnabled: meData.user.mfaEnabled ?? false,
            });
          }
        }

        const libRes = await fetch("/api/v1/library");
        if (libRes.ok) {
          const libData = await libRes.json();
          if (Array.isArray(libData.games)) {
            setLibrary(
              libData.games.map((g: { id: string; name: string; version?: string; developer?: string; favorite?: boolean; coverImage?: string; coverUrl?: string }) => ({
                id: g.id,
                name: g.name,
                version: g.version || "1.0",
                developer: g.developer || "RenPlay Studio",
                favorite: Boolean(g.favorite),
                coverImage: g.coverImage || g.coverUrl || "/Rina_open.png",
              }))
            );
          }
        }
        const subscriptionRes = await fetch("/api/v1/subscription", { cache: "no-store" });
        if (subscriptionRes.ok) setSubscription(await subscriptionRes.json());
        const savesRes = await fetch("/api/v1/cloud-saves/all", { cache: "no-store" });
        if (savesRes.ok) setCloudSaves((await savesRes.json()).saves || []);
      } catch (err) {
        console.warn("[Portal] Erro ao sincronizar dados:", err);
      } finally {
        setLoadingLibrary(false);
      }
    }
    loadPortalData();
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Boas-vindas ao RenPlay!",
      body: "Seu portal foi sincronizado. Baixe o launcher para habilitar saves em nuvem.",
      date: "Hoje às 14:30",
      read: false,
    },
    {
      id: "2",
      title: "Nova Atualização Disponível",
      body: "So Much to Love recebeu um novo patch de melhorias e tradução.",
      date: "Ontem às 19:15",
      read: true,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  };

  const downloadSave = async (save: CloudSaveView) => {
    setSaveError("");
    try {
      const response = await fetch("/api/v1/cloud-saves/download", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: save.gameId, slotNumber: save.slotNumber }) });
      const info = await response.json();
      if (!response.ok || !info.downloadUrl) throw new Error(info.error?.message || "Download indisponível.");
      const bytes = await fetch(info.downloadUrl);
      if (!bytes.ok) throw new Error("Não foi possível obter o arquivo.");
      const content = await bytes.arrayBuffer();
      if (content.byteLength !== Number(info.sizeBytes)) throw new Error("O arquivo baixado tem tamanho diferente do registrado.");
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", content)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (hash !== info.sha256) throw new Error("A verificação de integridade do save falhou.");
      const blobUrl = URL.createObjectURL(new Blob([content], { type: "application/octet-stream" }));
      const link = document.createElement("a");
      link.href = blobUrl; link.download = save.filename; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) { setSaveError(error instanceof Error ? error.message : "Falha ao baixar save."); }
  };

  const handleRemoveGame = async (gameId: string) => {
    if (!confirm("Deseja remover este jogo da sua biblioteca pessoal na nuvem?")) return;
    try {
      const res = await fetch("/api/v1/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      if (res.ok) {
        setLibrary((prev) => prev.filter((item) => item.id !== gameId));
      } else {
        alert("Não foi possível remover o jogo agora.");
      }
    } catch {
      alert("Falha de conexão ao remover o jogo.");
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0b0e14] text-zinc-100" : "bg-[#f4f5f8] text-zinc-900"} font-sans transition-colors duration-200`}>
      {/* HEADER DO PORTAL */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md ${isDark ? "bg-[#0d121c]/90 border-zinc-800/80" : "bg-white/90 border-zinc-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400/20 text-[#FFDE00] border border-amber-400/30">
                PORTAL
              </span>
            </Link>
            <span className="hidden md:inline text-xs text-zinc-400">
              Sua conta. Suas histórias.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-400 hover:text-[#FFDE00] transition-colors"
            >
              ← Voltar ao Catálogo
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* MENU LATERAL / NAVEGAÇÃO DE ÁREAS */}
          <aside className="lg:col-span-1 space-y-2">
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#121824] border-zinc-800" : "bg-white border-zinc-200"} mb-4`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-black text-lg shadow-md">
                  {user.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{user.displayName}</h3>
                  <p className="text-xs text-zinc-400">@{user.username}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: "account", label: "Sua Conta", icon: "👤", desc: "Perfil e detalhes" },
                { id: "library", label: "Minha Biblioteca", icon: "🎮", desc: "Jogos sincronizados" },
                { id: "notifications", label: "Notificações", icon: "🔔", desc: "Alertas e patches" },
                { id: "security", label: "Segurança & Sessões", icon: "🛡️", desc: "MFA e senhas" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all ${
                    activeTab === tab.id
                      ? "bg-[#FFDE00] text-black shadow-lg shadow-amber-500/20 scale-[1.02]"
                      : isDark
                      ? "text-zinc-300 hover:bg-zinc-800/60"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <div>
                    <div>{tab.label}</div>
                    <div className={`text-[10px] font-normal ${activeTab === tab.id ? "text-black/80" : "text-zinc-400"}`}>
                      {tab.desc}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-zinc-800/40">
              <Link
                href="/dashboard"
                className="w-full block text-center py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700"
              >
                Abrir Painel Epic Games →
              </Link>
            </div>
          </aside>

          {/* ÁREA DE VISUALIZAÇÃO ATIVA */}
          <section className="lg:col-span-3">
            {activeTab === "account" && (
              <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-[#121824] border-zinc-800" : "bg-white border-zinc-200"} space-y-6 animate-fade-in-up`}>
                <div className="border-b border-zinc-800/60 pb-4">
                  <h2 className="text-xl font-black">Informações da Conta</h2>
                  <p className="text-xs text-zinc-400 mt-1">Gerencie os detalhes públicos e credenciais do seu perfil no ecossistema RenPlay.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Nome de Exibição</span>
                    <p className="text-sm font-semibold mt-1">{user.displayName}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Identificador</span>
                    <p className="text-sm font-semibold mt-1">@{user.username}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">E-mail Cadastrado</span>
                    <p className="text-sm font-semibold mt-1">{user.email}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Status do E-mail</span>
                    <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                      ✓ Confirmado & Protegido
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Funções da conta</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.filter((r) => r !== "VIP").map((r) => (
                      <span key={r} className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                {subscription?.subscription.status === "GRACE_PERIOD" && (
                  <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-red-900/20 to-black/40 p-5 sm:p-6 mb-4">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                      <span>⚠️</span>
                      <span>Sua assinatura expirou</span>
                    </div>
                    <h3 className="mt-2 text-xl font-black text-white">Seus saves continuam disponíveis temporariamente para recuperação</h3>
                    <p className="mt-2 text-xs text-red-200/90 leading-relaxed">
                      Prazo restante: <strong className="text-white font-black">{Math.max(0, Math.ceil((new Date(subscription.subscription.graceExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias</strong> (expira em {new Date(subscription.subscription.graceExpiresAt!).toLocaleString("pt-BR")}).
                      <br />
                      Após o fim do prazo de 30 dias de carência, os arquivos da nuvem serão excluídos. Seus saves locais permanecem intactos.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href="#planos" className="rounded-xl bg-[#FFDE00] px-4 py-2 text-xs font-black text-black hover:bg-[#ffe53b]">
                        Renovar VIP
                      </a>
                      {cloudSaves.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSaveError("");
                            void exportCloudSavesZip(cloudSaves, (done, total) => setZipProgress(`${done} / ${total}`))
                              .then(() => setZipProgress("ZIP concluído"))
                              .catch(error => { setZipProgress(""); setSaveError(error instanceof Error ? error.message : "Falha na exportação."); });
                          }}
                          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                        >
                          Baixar meus saves (Exportar ZIP)
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {subscription?.subscription.status === "CANCELED_BUT_ACTIVE" && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-4 text-xs text-amber-200">
                    <strong>Renovação automática cancelada:</strong> Seus benefícios do plano continuam ativos até {new Date(subscription.subscription.periodEnd!).toLocaleString("pt-BR")}.
                  </div>
                )}
                {(subscription?.subscription.status === "DELETION_PENDING" || subscription?.subscription.status === "DELETED") && (
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4 mb-4 text-xs text-zinc-400">
                    <strong>Período de carência encerrado:</strong> Os saves da nuvem foram programados para exclusão segura. Seus saves locais no computador continuam disponíveis normalmente.
                  </div>
                )}
                <div id="planos" className="rounded-2xl border border-[#FFDE00]/25 bg-gradient-to-br from-[#24210e] to-[#0b0e14] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">Minha assinatura</p>
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-zinc-300">
                      Assinante: <strong className="text-[#FFDE00]">@{user.username}</strong> ({user.displayName})
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-black">{subscription?.subscription.plan || "RenPlay gratuito"}</h3>
                  <p className="mt-1 text-xs text-zinc-400">{subscription?.subscription.status === "GRACE_PERIOD" ? `Carência para recuperar saves até ${new Date(subscription.subscription.graceExpiresAt!).toLocaleString("pt-BR")}` : subscription?.subscription.periodEnd ? `Período pago até ${new Date(subscription.subscription.periodEnd).toLocaleString("pt-BR")}` : "Escolha um dos três planos para enviar saves à nuvem com sua conta."}</p>
                  {subscription && <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-black/30 p-3"><span className="text-[10px] text-zinc-400">Nível VIP</span><strong className="block text-lg">{subscription.subscription.vipLevel}</strong></div>
                    <div className="rounded-xl bg-black/30 p-3"><span className="text-[10px] text-zinc-400">Saves na nuvem</span><strong className="block text-lg">{subscription.usage.saves} / {subscription.subscription.maxSaves || "—"}</strong></div>
                    <div className="rounded-xl bg-black/30 p-3"><span className="text-[10px] text-zinc-400">Armazenamento</span><strong className="block text-lg">{(subscription.usage.bytes / 1_000_000).toFixed(1)} / {subscription.subscription.maxBytes ? (subscription.subscription.maxBytes / 1_000_000).toFixed(0) : "—"} MB</strong></div>
                  </div>}
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {Object.entries(subscription?.plans || {}).map(([levelStr, plan]) => {
                      const level = Number(levelStr);
                      const isCurrent = subscription?.subscription.vipLevel === level && subscription?.subscription.status === "ACTIVE";
                      return (
                        <div
                          key={level}
                          className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                            isCurrent
                              ? "border-[#FFDE00] bg-gradient-to-b from-[#2e260e] to-[#12141a] shadow-lg shadow-amber-500/10"
                              : "border-white/10 bg-white/5 hover:border-amber-400/40"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-[#FFDE00]">{plan.name}</p>
                              {isCurrent && (
                                <span className="rounded-full bg-[#FFDE00] px-2 py-0.5 text-[9px] font-black text-black">
                                  PLANO ATUAL
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-2xl font-black text-white">
                              R$ {plan.monthlyPriceBRL.toFixed(2).replace(".", ",")}
                              <span className="text-xs font-normal text-zinc-400">/mês</span>
                            </p>
                            <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                              <p className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span> {plan.maxSaves} saves globais
                              </p>
                              <p className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span> {plan.maxBytes / 1_000_000} MB na nuvem
                              </p>
                              <p className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span> Sincronização no Launcher
                              </p>
                              <p className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span> 30 dias de carência
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlanLevel(level);
                              setCheckoutSuccess(null);
                              setCheckoutError(null);
                              setCheckoutModalOpen(true);
                            }}
                            className={`mt-5 w-full rounded-xl py-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all ${
                              isCurrent
                                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 cursor-pointer"
                                : "bg-[#FFDE00] text-black hover:bg-[#ffe53b] shadow-md shadow-amber-500/15 cursor-pointer"
                            }`}
                          >
                            {isCurrent ? "Renovar Meu Plano" : `Assinar ${plan.name}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-zinc-500">Pagamento processado em ambiente seguro com conciliação automática. Seus saves locais continuam 100% gratuitos.</p>
                </div>
                <div className="rounded-2xl border border-zinc-700 bg-black/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-black">Meus saves na nuvem</h3>
                    {cloudSaves.length > 0 && <button type="button" onClick={() => { setSaveError(""); void exportCloudSavesZip(cloudSaves, (done, total) => setZipProgress(`${done} / ${total}`)).then(() => setZipProgress("ZIP concluído")).catch(error => { setZipProgress(""); setSaveError(error instanceof Error ? error.message : "Falha na exportação."); }); }} className="rounded-lg border border-[#FFDE00]/40 px-3 py-2 text-xs font-black text-[#FFDE00]">Exportar ZIP</button>}</div>
                  <p className="mt-1 text-xs text-zinc-400">Você pode recuperar cada arquivo enquanto sua assinatura estiver ativa ou em carência.</p>
                  {zipProgress && <p role="status" className="mt-2 text-xs text-[#FFDE00]">Exportação: {zipProgress}</p>}
                  {saveError && <p role="alert" className="mt-3 text-xs text-red-300">{saveError}</p>}
                  <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
                    {cloudSaves.map(save => <div key={`${save.gameId}:${save.slotNumber}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <div><strong className="block text-xs">{save.gameName} · slot {save.slotNumber}</strong><span className="text-[11px] text-zinc-400">{save.filename} · {(save.sizeBytes / 1_000_000).toFixed(1)} MB</span></div>
                      <button type="button" onClick={() => void downloadSave(save)} className="rounded-lg bg-[#FFDE00] px-3 py-2 text-xs font-black text-black">Baixar save</button>
                    </div>)}
                    {!cloudSaves.length && <p className="text-xs text-zinc-500">Nenhum save disponível para recuperação.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "library" && (
              <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-[#121824] border-zinc-800" : "bg-white border-zinc-200"} space-y-6 animate-fade-in-up`}>
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Minha Biblioteca</h2>
                    <p className="text-xs text-zinc-400 mt-1">Histórias salvas e sincronizadas com seu Launcher de PC.</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                    {library.length} jogos
                  </span>
                </div>

                {loadingLibrary ? (
                  <div className="py-16 text-center text-zinc-500 font-bold text-sm">
                    Carregando sua biblioteca da nuvem...
                  </div>
                ) : library.length === 0 ? (
                  <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-2xl">
                      🎮
                    </div>
                    <h3 className="text-lg font-black text-white">Sua biblioteca está vazia</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Você ainda não adicionou nenhum jogo à sua conta. Explore o catálogo oficial para adicionar histórias e sincronizá-las diretamente com o seu launcher de PC.
                    </p>
                    <Link
                      href="/"
                      className="inline-block px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe53b] text-black shadow-lg shadow-amber-500/10 transition-transform active:scale-95"
                    >
                      Explorar Catálogo de Jogos →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {library.map((game) => (
                      <div
                        key={game.id}
                        className={`p-4 rounded-xl border transition-all flex gap-4 ${
                          isDark ? "bg-[#0b0e14] border-zinc-800 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formatImageUrl(game.coverImage)}
                          alt={game.name}
                          className="w-24 h-32 object-cover rounded-lg shadow-md shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/images/so-much-to-love-cover.jpg";
                          }}
                        />
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">{game.developer}</span>
                            <h4 className="font-bold text-sm leading-snug truncate">{game.name}</h4>
                            <span className="text-xs text-zinc-400 block mt-0.5">Versão {game.version}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <a
                              href={`renplay://launch/${game.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFDE00] text-black hover:bg-[#ffe53b] transition-colors cursor-pointer"
                            >
                              ▶ Abrir no Launcher
                            </a>
                            <button
                              onClick={() => handleRemoveGame(game.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-[#121824] border-zinc-800" : "bg-white border-zinc-200"} space-y-4 animate-fade-in-up`}>
                <div className="border-b border-zinc-800/60 pb-4">
                  <h2 className="text-xl font-black">Notificações</h2>
                  <p className="text-xs text-zinc-400 mt-1">Atualizações da sua conta, novos patches e novidades da comunidade.</p>
                </div>

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                        n.read
                          ? isDark ? "bg-[#0b0e14]/50 border-zinc-800/40 opacity-70" : "bg-zinc-50 border-zinc-200 opacity-75"
                          : isDark ? "bg-[#0b0e14] border-amber-400/30" : "bg-white border-amber-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#FFDE00]" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{n.body}</p>
                        <span className="text-[10px] text-zinc-500 mt-2 block">{n.date}</span>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[11px] font-bold text-amber-400 hover:underline shrink-0"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-[#121824] border-zinc-800" : "bg-white border-zinc-200"} space-y-6 animate-fade-in-up`}>
                <div className="border-b border-zinc-800/60 pb-4">
                  <h2 className="text-xl font-black">Segurança da Conta</h2>
                  <p className="text-xs text-zinc-400 mt-1">Proteja suas histórias e mantenha o acesso seguro em múltiplos dispositivos.</p>
                </div>

                <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"} flex items-center justify-between gap-4`}>
                  <div>
                    <h4 className="font-bold text-sm">Autenticação em Duas Etapas (2FA / TOTP)</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Exige código de 6 dígitos do Google Authenticator ou Authy ao entrar.</p>
                  </div>
                  <button className="btn-epic-primary text-xs py-2 px-4 cursor-pointer">
                    Configurar 2FA
                  </button>
                </div>

                <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0b0e14] border-zinc-800" : "bg-zinc-50 border-zinc-200"} space-y-4`}>
                  <h4 className="font-bold text-sm">Trocar Senha de Acesso</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="password"
                      placeholder="Senha Atual"
                      className={`px-3 py-2 text-xs rounded-lg border outline-none ${isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-white border-zinc-300"}`}
                    />
                    <input
                      type="password"
                      placeholder="Nova Senha (mínimo 12 caracteres)"
                      className={`px-3 py-2 text-xs rounded-lg border outline-none ${isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-white border-zinc-300"}`}
                    />
                  </div>
                  <button className="text-xs font-bold py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer">
                    Atualizar Senha
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL GATEWAY DE PAGAMENTO RENPLAY */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#FFDE00]/40 bg-[#12141c] p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/10">
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg p-2 rounded-lg bg-white/5 hover:bg-white/10"
              aria-label="Fechar"
            >
              ✕
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-white">Pagamento Confirmado!</h3>
                <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  {checkoutSuccess}
                </p>
                <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-xs text-[#FFDE00]">
                  ✦ Seus benefícios VIP e slots de nuvem já estão ativos no Site e no Launcher.
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#FFDE00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#ffe53b]"
                >
                  Concluir e Voltar
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#FFDE00] px-2 py-0.5 text-[9px] font-black text-black uppercase">
                    Checkout Seguro
                  </span>
                  <span className="text-xs text-zinc-400">Gateway de Pagamento RenPlay</span>
                </div>
                <h3 className="mt-2 text-xl font-black">
                  Contratar {subscription?.plans?.[selectedPlanLevel]?.name || "RenPlay VIP"}
                </h3>

                {/* Resumo do Pedido */}
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Assinante:</span>
                    <strong className="text-white">@{user.username} ({user.displayName})</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">E-mail:</span>
                    <span className="text-zinc-300">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Plano Selecionado:</span>
                    <strong className="text-[#FFDE00]">
                      {subscription?.plans?.[selectedPlanLevel]?.name} ({subscription?.plans?.[selectedPlanLevel]?.maxSaves} saves · {Number(subscription?.plans?.[selectedPlanLevel]?.maxBytes || 0) / 1_000_000} MB)
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm font-bold">Total Mensal:</span>
                    <strong className="text-xl font-black text-[#FFDE00]">
                      R$ {Number(subscription?.plans?.[selectedPlanLevel]?.monthlyPriceBRL || 0).toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                </div>

                {/* Escolha do Método */}
                <div className="mt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black transition-all ${
                        paymentMethod === "pix"
                          ? "border-[#FFDE00] bg-amber-500/10 text-[#FFDE00]"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>⚡</span> PIX Instantâneo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black transition-all ${
                        paymentMethod === "card"
                          ? "border-[#FFDE00] bg-amber-500/10 text-[#FFDE00]"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>💳</span> Cartão de Crédito
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Método */}
                {paymentMethod === "pix" ? (
                  <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40 text-center space-y-3">
                    <div className="w-24 h-24 mx-auto rounded-xl bg-white p-2 flex items-center justify-center">
                      {/* Stylized QR Code placeholder */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
                        <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v20H40zM50 40h20v10H50zM40 70h20v10H40zM70 50h10v20H70zM80 80h20v20H80z"/>
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Escaneie o QR Code ou use a chave Copia-e-Cola abaixo no app do seu banco:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`00020126580014br.gov.bcb.pix0136renplay-vip-${selectedPlanLevel}-${Date.now()}5204000053039865802BR`}
                        className="w-full text-[11px] p-2 rounded-lg bg-black/60 border border-white/10 text-zinc-400 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2000);
                        }}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold shrink-0 text-white"
                      >
                        {copiedPix ? "✓ Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40 space-y-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8899"
                        className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-zinc-400 mb-1">Validade</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                    ⚠ {checkoutError}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={checkoutLoading}
                    onClick={handleConfirmPayment}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    {checkoutLoading ? "Processando..." : `Confirmar Pagamento (${paymentMethod === "pix" ? "PIX" : "Cartão"})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
