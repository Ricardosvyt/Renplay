"use client";

import { useState } from "react";
import Link from "next/link";

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
  role: "ADMIN" | "DEVELOPER" | "MODERATOR" | "TRANSLATOR";
  status: "ACTIVE" | "PENDING";
  joinedDate: string;
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

/* ============================================================== */
/* COMPONENTE PRINCIPAL: DASHBOARD LIMPO E MODERNO                */
/* ============================================================== */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "users" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lista de Jogos do Catálogo
  const [games, setGames] = useState<GameItem[]>([
    {
      id: "the-last-echo",
      title: "The Last Echo — Rina's Story",
      developer: "RenPlay Studios",
      category: "Sci-Fi / Mistério",
      genre: "Visual Novel",
      version: "1.2.4",
      engine: "Ren'Py 8.3",
      adult: false,
      coverUrl: "/Rina.png",
      downloadUrl: "https://pixeldrain.com/u/theLastEcho12",
      downloads: 18450,
      status: "PUBLISHED",
      lastUpdate: "Hoje às 10:45",
    },
    {
      id: "so-much-to-love",
      title: "So Much to Love",
      developer: "ALDOR",
      category: "Romance adulto",
      genre: "Visual Novel",
      version: "0.4.4B",
      engine: "Ren'Py 8.1",
      adult: true,
      coverUrl: "/images/so-much-to-love-cover.jpg",
      downloadUrl: "https://pixeldrain.com/u/4J1pu8YP",
      downloads: 12480,
      status: "PUBLISHED",
      lastUpdate: "Ontem às 18:20",
    },
  ]);

  // Lista de Membros da Equipe
  const [users] = useState<UserItem[]>([
    {
      id: "u-1",
      name: "Administrador Geral",
      email: "admin@renplay.com.br",
      role: "ADMIN",
      status: "ACTIVE",
      joinedDate: "14/01/2026",
    },
    {
      id: "u-2",
      name: "Thatty Hentai",
      email: "thatty@lapkjogos.com",
      role: "TRANSLATOR",
      status: "ACTIVE",
      joinedDate: "18/02/2026",
    },
    {
      id: "u-3",
      name: "ALDOR Dev",
      email: "contact@aldor.dev",
      role: "DEVELOPER",
      status: "ACTIVE",
      joinedDate: "20/02/2026",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteGame = (id: string, name: string) => {
    if (confirm(`Deseja remover "${name}" do catálogo?`)) {
      setGames(games.filter((g) => g.id !== id));
      showToast(`Jogo removido com sucesso.`);
    }
  };

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0d14] text-zinc-100 font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#FFDE00] text-black font-black text-xs shadow-2xl animate-fade-in-up">
          {toastMessage}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="border-b border-zinc-800/80 bg-[#0d111a]/95 backdrop-blur-md sticky top-0 z-40">
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
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Minha Conta
            </Link>
          </div>
        </div>
      </header>

      {/* CORPO DO DASHBOARD */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto flex flex-col md:flex-row">
        {/* SIDEBAR LIMPA */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/80 p-5 shrink-0 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDE00] px-3">
              NAVEGAÇÃO
            </span>
            <nav className="space-y-1 pt-1">
              {[
                { id: "overview", label: "Visão Geral", icon: <GridIcon /> },
                { id: "games", label: "Catálogo de Jogos", icon: <GamepadIcon />, count: games.length },
                { id: "users", label: "Equipe & Acessos", icon: <UsersIcon />, count: users.length },
                { id: "settings", label: "Configurações", icon: <SettingsIcon /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 rounded-2xl bg-[#141a26] border border-zinc-800/80 space-y-2">
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
                  href="/dashboard/publish"
                  className="btn-epic-primary py-2.5 px-5 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
                >
                  <PlusIcon />
                  <span>Publicar Novo Jogo</span>
                </Link>
              </div>

              {/* CARDS DE MÉTRICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Total de Jogos", val: games.length.toString(), desc: "Títulos cadastrados no launcher", color: "text-[#FFDE00]" },
                  { title: "Downloads Totais", val: "30.930", desc: "Instalações solicitadas", color: "text-emerald-400" },
                  { title: "Equipe Ativa", val: users.length.toString(), desc: "Criadores e moderadores", color: "text-blue-400" },
                  { title: "CDN Uptime", val: "99.98%", desc: "Pixeldrain e Cloudflare R2", color: "text-purple-400" },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#141a26] border border-zinc-800 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.title}</span>
                    <div className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</div>
                    <p className="text-[10px] text-zinc-500 font-medium">{kpi.desc}</p>
                  </div>
                ))}
              </div>

              {/* ÚLTIMOS LANÇAMENTOS */}
              <div className="p-6 rounded-2xl bg-[#141a26] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-wider text-zinc-200">
                    Jogos em Destaque no Catálogo
                  </h3>
                  <button
                    onClick={() => setActiveTab("games")}
                    className="text-xs font-bold text-[#FFDE00] hover:underline cursor-pointer"
                  >
                    Ver Todos →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {games.slice(0, 2).map((game) => (
                    <div
                      key={game.id}
                      className="p-4 rounded-xl bg-[#0d111a] border border-zinc-800 flex gap-4 items-center"
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
                      className="py-2 pl-9 pr-4 rounded-xl text-xs bg-[#141a26] border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-[#FFDE00]"
                    />
                    <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" />
                  </div>

                  <Link
                    href="/dashboard/publish"
                    className="btn-epic-primary py-2 px-4 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
                  >
                    <PlusIcon />
                    <span>Novo Jogo</span>
                  </Link>
                </div>
              </div>

              {/* TABELA DE JOGOS LIMPA */}
              <div className="rounded-2xl border border-zinc-800 bg-[#141a26] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#0d111a] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
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
                          <td colSpan={6} className="p-8 text-center text-zinc-400">
                            Nenhum jogo encontrado com esse termo.
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
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Equipe & Permissões
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Membros com acesso para gerenciar o catálogo, traduções e publicações.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-[#141a26] overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0d111a] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="p-4">Nome</th>
                      <th className="p-4">E-mail</th>
                      <th className="p-4">Função</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Cadastrado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-semibold">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">{u.name}</td>
                        <td className="p-4 text-zinc-300 font-mono text-[11px]">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-emerald-400 text-xs font-bold">✓ Ativo</span>
                        </td>
                        <td className="p-4 text-zinc-400 text-xs">{u.joinedDate}</td>
                      </tr>
                    ))}
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

              <div className="p-6 rounded-2xl bg-[#141a26] border border-zinc-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Nome Oficial da Plataforma
                  </label>
                  <input
                    type="text"
                    defaultValue="RenPlay Launcher"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#0d111a] text-white text-xs outline-none focus:border-[#FFDE00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Versão Atual do Launcher OTA
                  </label>
                  <input
                    type="text"
                    defaultValue="1.0.0"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#0d111a] text-white text-xs outline-none focus:border-[#FFDE00]"
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
      <footer className="py-4 text-center text-[11px] font-semibold border-t border-zinc-800/80 bg-[#0d111a] text-zinc-500">
        © 2026 RenPlay Studios. Painel de Controle e Distribuição Oficial.
      </footer>
    </div>
  );
}
