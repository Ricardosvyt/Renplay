"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ============================================================== */
/* TIPAGENS DO DASHBOARD                                          */
/* ============================================================== */
export interface GameItem {
  id: string;
  title: string;
  developer: string;
  category: string;
  genre: string;
  version: string;
  engine: string;
  adult: boolean;
  coverUrl: string;
  downloadUrl: string;
  downloads: number;
  status: "PUBLISHED" | "PENDING_REVIEW" | "DRAFT";
  lastUpdate: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DEVELOPER" | "MODERATOR" | "TRANSLATOR" | "VIP" | "USUARIO";
  status: "ACTIVE" | "PENDING";
  joinedDate: string;
  verificationLevel?: number;
}

/* ============================================================== */
/* ÍCONES VETORIAIS (SVG)                                         */
/* ============================================================== */
function GridIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function GamepadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <circle cx="15" cy="13" r="1" />
      <circle cx="17.5" cy="10.5" r="1" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </svg>
  );
}

function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ShieldIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CodeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CrownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z" />
    </svg>
  );
}

function UserIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function getRoleBadge(role: string) {
  const r = (role || "").toLowerCase();
  switch (r) {
    case "admin":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
          <ShieldIcon className="w-3 h-3 text-rose-400" />
          <span>Administrador</span>
        </span>
      );
    case "dev":
    case "developer":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]">
          <CodeIcon className="w-3 h-3 text-sky-400" />
          <span>Desenvolvedor</span>
        </span>
      );
    case "tradutor":
    case "translator":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <GlobeIcon className="w-3 h-3 text-emerald-400" />
          <span>Tradutor Oficial</span>
        </span>
      );
    case "moderador":
    case "moderator":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          <ShieldIcon className="w-3 h-3 text-indigo-400" />
          <span>Moderador</span>
        </span>
      );
    case "vip":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/40 shadow-[0_0_15px_rgba(255,222,0,0.3)]">
          <CrownIcon className="w-3 h-3 text-[#FFDE00]" />
          <span>Membro VIP</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
          <UserIcon className="w-3 h-3 text-zinc-400" />
          <span>Usuário</span>
        </span>
      );
  }
}

function getVerificationBadge(level: number = 1) {
  if (level >= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-amber-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>3/3 Verificado</span>
      </span>
    );
  }
  if (level === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>2/3 Em Análise</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
      <span>1/3 E-mail</span>
    </span>
  );
}

/* ============================================================== */
/* COMPONENTE PRINCIPAL: DASHBOARD LIMPO E MODERNO                */
/* ============================================================== */
export default function DashboardPage() {
  const pathname = usePathname();
  const routeTab = pathname === "/dashboard/jogos" ? "games" : pathname === "/dashboard/configuracoes" ? "settings" : "overview";
  const [activeTab] = useState<"overview" | "games" | "users" | "settings">(routeTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Jogos carregados do catálogo persistido no banco.
  const [games, setGames] = useState<GameItem[]>([]);

  // Lista de Membros da Equipe sincronizada com o banco
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setUsers(
            data.users.map((u: { id: string; username: string; email: string; role: string; status: string; created_at: string; verification_level?: number }) => ({
              id: u.id,
              name: u.username,
              email: u.email,
              role: (u.role.toUpperCase() as UserItem["role"]) || "MODERATOR",
              status: "ACTIVE",
              joinedDate: new Date(u.created_at).toLocaleDateString("pt-BR"),
              verificationLevel: u.verification_level ?? 1,
            }))
          );
        }
      })
      .catch((err) => console.error("Erro ao sincronizar usuários:", err));

    fetch("/api/games?includeAll=true")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.games)) return;
        setGames(
          data.games.map((game: { id: string; name: string; developer?: string; category?: string; genre?: string; version?: string; coverImage?: string; downloadUrl?: string; status?: string; updated_at?: string; created_at?: string }) => ({
            id: game.id,
            title: game.name,
            developer: game.developer || "Desenvolvedor não informado",
            category: game.category || "Geral",
            genre: game.genre || "Visual Novel",
            version: game.version || "1.0.0",
            engine: "Ren'Py",
            adult: false,
            coverUrl: game.coverImage || "/images/so-much-to-love-cover.jpg",
            downloadUrl: game.downloadUrl || "",
            downloads: 0,
            status: game.status === "PUBLISHED" ? "PUBLISHED" : game.status === "PENDING_REVIEW" ? "PENDING_REVIEW" : "DRAFT",
            lastUpdate: new Date(game.updated_at || game.created_at || Date.now()).toLocaleDateString("pt-BR"),
          }))
        );
      })
      .catch((err) => console.error("Erro ao sincronizar jogos:", err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteGame = async (id: string, name: string) => {
    if (!confirm(`Deseja remover "${name}" do catálogo?`)) return;
    const response = await fetch(`/api/games?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showToast(data.error || "Não foi possível excluir o jogo.");
      return;
    }
    setGames((current) => current.filter((g) => g.id !== id));
    showToast("Jogo removido com sucesso.");
  };

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F5F5] font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#FFDE00] text-black font-black text-xs shadow-2xl animate-fade-in-up">
          {toastMessage}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="border-b border-[#29292F] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                PAINEL DE CONTROLE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-400 hover:text-[#FFDE00] transition-colors"
            >
              ← Ir ao Site
            </Link>
            <Link
              href="/portal"
              className="text-xs font-bold px-3 py-2 rounded-lg border border-[#29292F] bg-[#12141D] hover:border-[#FFDE00]/60 text-zinc-300 transition-colors"
            >
              Minha Conta
            </Link>
          </div>
        </div>
      </header>

      {/* CORPO DO DASHBOARD */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto flex flex-col md:flex-row">
        {/* SIDEBAR LIMPA */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#29292F] p-5 shrink-0 space-y-6 bg-[#0D0E14]/70">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDE00] px-3">
              NAVEGAÇÃO
            </span>
            <nav className="space-y-1 pt-1">
              {[
                { id: "overview", label: "Visão Geral", href: "/dashboard", icon: <GridIcon /> },
                { id: "games", label: "Catálogo de Jogos", href: "/dashboard/jogos", icon: <GamepadIcon />, count: games.length },
                { id: "users", label: "Equipe & Acessos", href: "/dashboard/usuarios", icon: <UsersIcon />, count: users.length },
                { id: "settings", label: "Configurações", href: "/dashboard/configuracoes", icon: <SettingsIcon /> },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#FFDE00] text-black font-black shadow-md shadow-amber-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        activeTab === tab.id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span>Status dos Servidores</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">CDN e APIs operando normalmente com 100% de disponibilidade.</p>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
          {/* ============================================================ */}
          {/* ABA 1: VISÃO GERAL (OVERVIEW)                                */}
          {/* ============================================================ */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    Painel Geral
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Métricas de distribuição, downloads e catálogo da plataforma.
                  </p>
                </div>

                <Link
                  href="/dashboard/jogos/publish"
                  className="btn-epic-primary py-2.5 px-5 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
                >
                  <PlusIcon />
                  <span>Publicar Novo Jogo</span>
                </Link>
              </div>

              <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#FFDE00]/25 bg-[linear-gradient(120deg,#171506_0%,#12141D_52%,#090A0F_100%)] px-6 py-7 sm:px-8 sm:py-8 shadow-[0_20px_55px_rgba(0,0,0,0.22)]">
                <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#FFDE00]/10 blur-3xl" aria-hidden="true" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#FFDE00]/8 to-transparent" aria-hidden="true" />
                <div className="relative z-10 max-w-xl space-y-3">
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">
                    <span className="h-2 w-2 rounded-full bg-[#FFDE00] shadow-[0_0_12px_#FFDE00]" />
                    Central RenPlay
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Tudo pronto para a próxima história.</h2>
                  <p className="max-w-lg text-sm leading-relaxed text-zinc-400">Acompanhe o catálogo, organize a equipe e mantenha o ecossistema RenPlay em movimento.</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/dashboard/jogos" className="rounded-xl bg-[#FFDE00] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black hover:bg-[#ffe84d] transition-colors">Ver catálogo</Link>
                    <Link href="/dashboard/usuarios" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-zinc-200 hover:border-[#FFDE00]/50 hover:text-[#FFDE00] transition-colors">Gerenciar equipe</Link>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Rina_open.png" alt="Rina, personagem do RenPlay" className="pointer-events-none absolute -right-3 -bottom-16 hidden h-[310px] w-[280px] object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.55)] sm:block" />
              </section>

              {/* CARDS DE MÉTRICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Total de Jogos", val: games.length.toString(), desc: "Títulos cadastrados no launcher", color: "text-[#FFDE00]" },
                  { title: "Downloads Totais", val: games.reduce((acc, g) => acc + (g.downloads || 0), 0).toLocaleString(), desc: "Instalações solicitadas", color: "text-[#FFDE00]" },
                  { title: "Equipe Ativa", val: users.length.toString(), desc: "Criadores e moderadores", color: "text-zinc-200" },
                  { title: "CDN Uptime", val: "100%", desc: "Pixeldrain e Cloudflare R2", color: "text-zinc-200" },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-1 hover:border-[#FFDE00]/30 transition-colors">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.title}</span>
                    <div className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</div>
                    <p className="text-[10px] text-zinc-500 font-medium">{kpi.desc}</p>
                  </div>
                ))}
              </div>

              {/* ÚLTIMOS LANÇAMENTOS */}
              <div className="p-6 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-wider text-zinc-200">
                    Jogos em Destaque no Catálogo
                  </h3>
                  <Link
                    href="/dashboard/jogos"
                    className="text-xs font-bold text-[#FFDE00] hover:underline cursor-pointer"
                  >
                    Ver Todos →
                  </Link>
                </div>

                {games.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 w-full flex flex-col items-center justify-center gap-2">
                    <GamepadIcon className="w-10 h-10 text-zinc-700 stroke-1" />
                    <p className="text-sm font-bold text-zinc-400">Nenhum jogo no catálogo ainda</p>
                    <p className="text-xs text-zinc-600">O catálogo está vazio. Cadastre uma nova visual novel para começar.</p>
                    <Link
                      href="/dashboard/jogos/publish"
                      className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-[#FFDE00] text-black hover:bg-[#ffe53b] transition-all cursor-pointer shadow-md"
                    >
                      + Publicar Primeiro Jogo
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {games.slice(0, 2).map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded-xl bg-[#090A0F] border border-[#29292F] flex gap-4 items-center"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-20 h-24 object-cover rounded-lg shrink-0 shadow-md"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-amber-400 block">{game.developer}</span>
                          <h4 className="font-bold text-sm truncate">{game.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span>v{game.version}</span>
                            <span>•</span>
                            <span>{game.downloads.toLocaleString()} downloads</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: CATÁLOGO DE JOGOS & BUILDS                            */}
          {/* ============================================================ */}
          {activeTab === "games" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    Catálogo de Jogos
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Gerencie títulos, versões de build e links de download do ecossistema.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar jogo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-2 pl-9 pr-4 rounded-xl text-xs bg-[#12141D] border border-[#29292F] text-white placeholder-zinc-500 outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
                    />
                    <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" />
                  </div>

                  <Link
                    href="/dashboard/jogos/publish"
                    className="btn-epic-primary py-2 px-4 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
                  >
                    <PlusIcon />
                    <span>Novo Jogo</span>
                  </Link>
                </div>
              </div>

              {/* TABELA DE JOGOS LIMPA */}
              <div className="rounded-2xl border border-[#29292F] bg-[#12141D] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#29292F] bg-[#090A0F] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                        <th className="p-4">Jogo</th>
                        <th className="p-4">Versão</th>
                        <th className="p-4">Engine</th>
                        <th className="p-4">Downloads</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-semibold">
                      {filteredGames.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-zinc-500">
                            <div className="flex flex-col items-center justify-center gap-2.5">
                              <GamepadIcon className="w-9 h-9 text-zinc-700 stroke-1" />
                              <p className="text-sm font-bold text-zinc-400">
                                {searchQuery ? "Nenhum jogo encontrado com esse termo." : "Nenhum jogo cadastrado"}
                              </p>
                              <p className="text-xs text-zinc-600">
                                {searchQuery ? "Tente buscar por outro nome ou gênero." : "O catálogo está vazio no momento."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredGames.map((game) => (
                          <tr key={game.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={game.coverUrl}
                                alt={game.title}
                                className="w-10 h-12 object-cover rounded-md shadow-sm shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white leading-snug">{game.title}</div>
                                <div className="text-[10px] text-zinc-400">{game.developer} · {game.genre}</div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-zinc-300">v{game.version}</td>
                            <td className="p-4 text-zinc-300">{game.engine}</td>
                            <td className="p-4 text-amber-400 font-bold">{game.downloads.toLocaleString()}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {game.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {game.downloadUrl && (
                                <a
                                  href={game.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors inline-block"
                                >
                                  Baixar
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteGame(game.id, game.title)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: EQUIPE & PERMISSÕES                                   */}
          {/* ============================================================ */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    Equipe & Permissões
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Membros com acesso para gerenciar o catálogo, traduções e publicações.
                  </p>
                </div>

                <Link
                  href="/dashboard/usuarios"
                  className="px-4 py-2.5 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <UsersIcon className="w-4 h-4 text-black" />
                  <span>Painel de Usuários (Neon DB) →</span>
                </Link>
              </div>

              <div className="rounded-2xl border border-[#29292F] bg-[#12141D] overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#29292F] bg-[#090A0F] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="p-4">Usuário</th>
                      <th className="p-4">E-mail</th>
                      <th className="p-4">Função</th>
                      <th className="p-4">Verificação (3 Etapas)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Cadastrado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-semibold">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <UsersIcon className="w-9 h-9 text-zinc-700 stroke-1" />
                            <p className="text-sm font-bold text-zinc-400">Nenhum membro cadastrado</p>
                            <p className="text-xs text-zinc-600">A equipe está vazia no momento.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <Link
                              href="/dashboard/usuarios"
                              className="font-bold text-white hover:text-[#FFDE00] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                              title="Clique para abrir a ficha do usuário no Painel Neon"
                            >
                              <span>{u.name}</span>
                              <span className="text-[10px] text-zinc-500 group-hover:text-[#FFDE00] transition-colors">↗ Ficha</span>
                            </Link>
                          </td>
                          <td className="p-4 text-zinc-300 font-mono text-[11px]">{u.email}</td>
                          <td className="p-4">
                            {getRoleBadge(u.role)}
                          </td>
                          <td className="p-4">
                            {getVerificationBadge(u.verificationLevel)}
                          </td>
                          <td className="p-4">
                            <span className="text-emerald-400 text-xs font-bold">✓ Ativo</span>
                          </td>
                          <td className="p-4 text-zinc-400 text-xs">{u.joinedDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 4: CONFIGURAÇÕES GLOBAIS                                 */}
          {/* ============================================================ */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in-up max-w-2xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Configurações Globais
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Ajuste os parâmetros gerais da plataforma e do launcher.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Nome Oficial da Plataforma
                  </label>
                  <input
                    type="text"
                    defaultValue="RenPlay Launcher"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#29292F] bg-[#090A0F] text-white text-xs outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Versão Atual do Launcher OTA
                  </label>
                  <input
                    type="text"
                    defaultValue="1.0.0"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#29292F] bg-[#090A0F] text-white text-xs outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast("Configurações salvas com sucesso!")}
                    className="btn-epic-primary py-2.5 px-6 rounded-xl font-black text-xs cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="py-4 text-center text-[11px] font-semibold border-t border-[#29292F] bg-[#090A0F] text-zinc-500">
        © 2026 RenPlay Studios. Painel de Controle e Distribuição Oficial.
      </footer>
    </div>
  );
}
