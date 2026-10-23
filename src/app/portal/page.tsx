"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatImageUrl } from "@/lib/image-url";

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
  const [loadingLibrary, setLoadingLibrary] = useState(true);

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
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cargos e Permissões</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((r) => (
                      <span key={r} className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        {r}
                      </span>
                    ))}
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
    </div>
  );
}
