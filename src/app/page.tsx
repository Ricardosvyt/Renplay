"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

/* ============================================================== */
/* INTERFACES E TIPAGENS                                          */
/* ============================================================== */
export interface DownloadMirror {
  id: string;
  name: string;
  url: string;
  priority: number;
  provider: string;
  status: string;
}

export interface GameReview {
  user: string;
  rating: number;
  date: string;
  text: string;
}

export interface GameUpdate {
  date: string;
  version: string;
  title: string;
  improvements?: string;
  fixes?: string;
  translation?: string;
}

export interface Game {
  id: string;
  name: string;
  version: string;
  developer: string;
  description: string;
  fullDescription?: string;
  engine?: string;
  platforms?: string[];
  languages?: string[];
  adult?: boolean;
  coverImage?: string;
  screenshots?: string[];
  sourceUrl?: string;
  downloadUrl?: string;
  downloadMirrors?: DownloadMirror[];
  archiveType?: string;
  fileName?: string;
  sizeLabel?: string;
  sizeBytes?: number;
  sha256?: string;
  genre?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  translator?: string;
  story?: string;
  gameplay?: string;
  rating?: number;
  reviewCount?: number;
  downloads?: number;
  views?: number;
  reviews?: GameReview[];
  updates?: GameUpdate[];
}

export interface LauncherInfo {
  version: string;
  channel: string;
  downloadUrl: string | null;
  notes: string;
}

/* ============================================================== */
/* ÍCONES VETORIAIS PROFISSIONAIS (SVG)                           */
/* ============================================================== */
function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function DownloadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function WindowsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.2 10.5 4v7H3V5.2Zm9 5.8V3.8L21 2v9h-9ZM3 12.5h7.5v7L3 18.3v-5.8Zm9 0h9v9l-9-1.5v-7.5Z" />
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

function StarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ============================================================== */
/* COMPONENTE PRINCIPAL                                           */
/* ============================================================== */
export default function Home() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("renplay_theme") !== "light";
    }
    return true;
  });
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [launcherInfo, setLauncherInfo] = useState<LauncherInfo>({
    version: "1.0.0",
    channel: "stable",
    downloadUrl: null,
    notes: "Instalador oficial verificado para Windows.",
  });
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Modal de Detalhes do Jogo
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Acordeão FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sincronização inicial da classe html .dark
  useEffect(() => {
    if (!isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("renplay_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("renplay_theme", "light");
    }
  };

  // Carregar dados de Jogos e Launcher da API Next.js
  useEffect(() => {
    async function loadData() {
      try {
        const [gamesRes, launcherRes] = await Promise.all([
          fetch("/api/games"),
          fetch("/api/launcher"),
        ]);
        if (gamesRes.ok) {
          const data = await gamesRes.json();
          setGames(data.games || []);
        }
        if (launcherRes.ok) {
          const lData = await launcherRes.json();
          setLauncherInfo(lData);
        }
      } catch (err) {
        console.warn("Erro ao carregar dados do catálogo:", err);
      } finally {
        setLoadingGames(false);
      }
    }
    loadData();
  }, []);

  // Atalho de Teclado '/' para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("search-games-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtragem de jogos por busca e gênero
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch =
        !searchQuery ||
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.developer?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === "all" ||
        game.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
        game.category?.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [games, searchQuery, selectedGenre]);

  // Lista dinâmica de gêneros para os chips
  const genreList = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.genre) set.add(g.genre);
      if (g.category) set.add(g.category);
    });
    return ["all", ...Array.from(set)];
  }, [games]);

  // Jogo em destaque para o Mockup do Launcher
  const featuredGame = games[0] || {
    id: "so-much-to-love",
    name: "So Much to Love",
    developer: "ALDOR",
    description: "Visual novel adulta de escolhas e relacionamentos.",
    coverImage: "/images/so-much-to-love-cover.jpg",
    screenshots: [
      "/images/so-much-to-love-01.jpg",
      "/images/so-much-to-love-02.webp",
      "/images/so-much-to-love-03.webp",
    ],
    rating: 4.7,
    adult: true,
    genre: "Visual novel",
    category: "Romance adulto",
    version: "0.4.4B",
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    if (launcherInfo.downloadUrl) {
      window.open(launcherInfo.downloadUrl, "_blank");
    } else {
      setTimeout(() => {
        alert("Iniciando download do RenPlay-Launcher-Setup para Windows (64-bit)!");
      }, 300);
    }
  };

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setActiveImageIndex(0);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 flex flex-col justify-between overflow-x-hidden ${
        isDark ? "bg-[#090A0F] text-[#F5F5F5]" : "bg-[#f7f7f5] text-[#111216]"
      }`}
    >
      {/* ============================================================== */}
      {/* HEADER: EPIC GAMES BAR + RENPLAY LOGO + CTA                    */}
      {/* ============================================================== */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
          isDark
            ? "bg-[#090A0F]/90 border-[#29292F] shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            : "bg-white/95 border-zinc-200 shadow-sm"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo e Links Principais */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logo.png"
                alt="RenPlay Launcher"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-zinc-400">
              <a href="#inicio" className="hover:text-[#FFDE00] transition-colors">Download</a>
              <a href="#vantagens" className="hover:text-[#FFDE00] transition-colors">Vantagens</a>
              <a href="#descobrir" className="hover:text-[#FFDE00] transition-colors">Catálogo</a>
              <a href="#faq" className="hover:text-[#FFDE00] transition-colors">FAQ</a>
              <Link href="/portal" className="text-[#FFDE00] hover:underline">Meu Portal</Link>
              <Link href="/dashboard" className="text-zinc-300 hover:text-white">Criador</Link>
            </nav>
          </div>

          {/* Ações da Direita: Busca Rápida + Tema + CTA Download */}
          <div className="flex items-center gap-3">
            {/* Campo de Busca Rápida */}
            <div className="relative hidden md:block">
              <input
                id="search-games-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no catálogo..."
                className={`py-2 pl-9 pr-8 text-xs rounded-xl border outline-none transition-all w-44 lg:w-56 ${
                  isDark
                    ? "bg-[#12141D] border-[#29292F] text-white placeholder-zinc-500 focus:border-[#FFDE00] focus:w-64"
                    : "bg-zinc-100 border-zinc-300 text-black placeholder-zinc-400 focus:border-[#FFDE00] focus:w-64"
                }`}
              />
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" />
              <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 pointer-events-none">
                /
              </kbd>
            </div>

            {/* Alternador de Tema */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? "bg-[#141a26] text-[#FFDE00] border-zinc-700/80 hover:border-[#FFDE00]"
                  : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
              }`}
              title="Alternar Tema"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Link de Login */}
            <Link
              href="/login"
              className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-colors ${
                isDark ? "text-zinc-300 hover:text-white hover:bg-zinc-800/60" : "text-zinc-700 hover:text-black hover:bg-zinc-100"
              }`}
            >
              Entrar
            </Link>

            {/* Botão Baixar Launcher (Verde Duolingo / Gamified CTA) */}
            <button
              onClick={handleDownload}
                  className="py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_4px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] hover:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar Launcher</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* HERO SECTION: IDENTIDADE RENPLAY                               */}
      {/* ============================================================== */}
      <main className="flex-1 space-y-24 py-10 sm:py-16">
        <section id="inicio" className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Lado Esquerdo: Pitch de Download & Mascote */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#FFDE00]/10 border border-[#FFDE00]/25 text-xs font-semibold text-[#FFDE00] shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFDE00] text-black font-black">R</span>
                <div>
                  <strong className="text-white">Rina apresenta:</strong> histórias para jogar no seu ritmo, com tudo em um só lugar.
                </div>
              </div>

              {/* Badges de Destaque */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="px-3 py-1 rounded-full bg-[#FFDE00] text-black shadow-sm">
                  APLICATIVO OFICIAL
                </span>
                <span className="text-zinc-500">•</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-[#29292F]">
                  GRATUITO
                </span>
                <span className="text-zinc-500">•</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-[#29292F] flex items-center gap-1.5">
                  <WindowsIcon className="w-3 h-3" />
                  WINDOWS
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] uppercase">
                O Launcher definitivo para suas <br />
                <span className="text-[#FFDE00] drop-shadow-[0_2px_20px_rgba(255,222,0,0.25)]">
                  Visual Novels
                </span>{" "}
                no PC.
              </h1>

              {/* Subtítulo */}
              <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Descubra histórias incríveis, gerencie seus downloads em um só lugar, mantenha seus jogos sempre atualizados e continue exatamente de onde parou.
              </p>

              {/* Caixa Principal de Ação / Botão de Download para Windows */}
              <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#12141D] border-[#29292F] shadow-2xl" : "bg-white border-zinc-200 shadow-xl"} space-y-4`}>
                <button
                  onClick={handleDownload}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wide bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_5px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] hover:translate-y-[3px] transition-all flex items-center justify-center gap-4 cursor-pointer group"
                >
                  <WindowsIcon className="w-6 h-6 shrink-0" />
                  <div className="text-left">
                    <div className="text-base font-black leading-tight">Baixar Launcher RenPlay</div>
                    <div className="text-[11px] font-semibold text-white/80 lowercase">Para Windows 10 e 11 (64-bit)</div>
                  </div>
                </button>

                {downloadStarted && (
                  <p className="text-xs font-bold text-[#FFDE00] text-center animate-pulse">
                    Download iniciado com sucesso!
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
                  <span>Versão {launcherInfo.version} ({launcherInfo.channel})</span>
                  <span>•</span>
                  <span>{launcherInfo.notes || "Instalador verificado"}</span>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-zinc-400">
                  <span className="inline-flex items-center gap-1.5"><span className="text-[#FFDE00]">◆</span> Instalador verificado</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-[#FFDE00]">◆</span> Leve e rápido</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-[#FFDE00]">◆</span> Jogue offline</span>
                </div>
              </div>
            </div>

            {/* Lado Direito: Rina como assinatura visual da marca */}
            <div className="lg:col-span-6 relative min-h-[520px] flex items-end justify-center">
              <div className="absolute inset-8 rounded-full bg-[#FFDE00]/10 blur-3xl pointer-events-none" />
              <div className="absolute top-10 right-6 sm:right-12 w-28 h-28 rounded-full border border-[#FFDE00]/30" />
              <div className="absolute top-24 left-8 sm:left-16 w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_18px_#FFDE00]" />

              <div className={`relative w-full max-w-[520px] min-h-[500px] overflow-hidden rounded-[2rem] border ${
                isDark ? "bg-[#12141D] border-[#29292F]" : "bg-white border-zinc-200"
              }`}>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,222,0,0.10),transparent_42%,rgba(255,255,255,0.02))]" />
                <div className="absolute left-6 top-6 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">
                  <span className="h-2 w-2 rounded-full bg-[#FFDE00] shadow-[0_0_12px_#FFDE00]" />
                  Sua próxima história
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Rina_open.png"
                  alt="Rina, personagem do RenPlay"
                  className="absolute inset-x-0 bottom-0 z-10 mx-auto h-[520px] w-full object-contain object-bottom drop-shadow-[0_18px_36px_rgba(0,0,0,0.55)]"
                />
                <div className="absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-4 rounded-2xl border border-white/10 bg-[#090A0F]/75 p-4 backdrop-blur-md">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">RenPlay</p>
                    <p className="mt-1 text-lg font-black text-white">Histórias que ficam com você.</p>
                  </div>
                  <a href="#descobrir" className="shrink-0 rounded-xl bg-[#FFDE00] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-black hover:bg-[#ffe84d] transition-colors">
                    Explorar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SEÇÃO DE VANTAGENS / FEATURES                                 */}
        {/* ============================================================== */}
        <section id="vantagens" className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFDE00]">
              EXPERIÊNCIA SUPERIOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase">
              Construído para quem ama Visual Novels
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Esqueça downloads quebrados em links temporários. O RenPlay centraliza, valida e roda seus jogos com máximo conforto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-2xl border transition-all ${
              isDark ? "bg-[#12141D] border-[#29292F] hover:border-[#FFDE00]" : "bg-white border-zinc-200 hover:border-black"
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#FFDE00]/15 text-[#FFDE00] flex items-center justify-center mb-4">
                <DownloadIcon className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">Downloads Rápidos</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Servidores com CDN otimizada e espelhos de alta velocidade para você jogar sem lentidão.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border transition-all ${
              isDark ? "bg-[#12141D] border-[#29292F] hover:border-[#FFDE00]" : "bg-white border-zinc-200 hover:border-black"
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#FFDE00]/15 text-[#FFDE00] flex items-center justify-center mb-4">
                <span className="text-lg font-black">↗</span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">Saves na Nuvem</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Suas decisões e capítulos concluídos sincronizam automaticamente entre qualquer PC.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border transition-all ${
              isDark ? "bg-[#12141D] border-[#29292F] hover:border-[#FFDE00]" : "bg-white border-zinc-200 hover:border-black"
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#FFDE00]/15 text-[#FFDE00] flex items-center justify-center mb-4">
                <span className="text-lg font-black">◆</span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">Modo 100% Offline</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Baixou uma vez? Jogue quando quiser sem depender de internet ou DRM que bloqueia o jogo.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border transition-all ${
              isDark ? "bg-[#12141D] border-[#29292F] hover:border-[#FFDE00]" : "bg-white border-zinc-200 hover:border-black"
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#FFDE00]/15 text-[#FFDE00] flex items-center justify-center mb-4">
                <span className="text-lg font-black">◎</span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">Traduções em PT-BR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Catálogo revisado com localização e patches em português já integrados e prontos para rodar.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* CATÁLOGO INTERATIVO COMPLETO (#descobrir)                      */}
        {/* ============================================================== */}
        <section id="descobrir" className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FFDE00]">
                BIBLIOTECA EM CONSTANTE EXPANSÃO
              </span>
              <h2 className="text-3xl font-black uppercase mt-1">Catálogo de Jogos</h2>
              <p className="text-xs text-zinc-400 mt-1">Descubra títulos verificados disponíveis para jogar no Launcher.</p>
            </div>

            {/* Chips de Filtro por Gênero */}
            <div className="flex flex-wrap items-center gap-2">
              {genreList.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGenre === g
                      ? "bg-[#FFDE00] text-black shadow-md shadow-yellow-500/20"
                      : isDark
                      ? "bg-[#141a26] text-zinc-400 hover:text-white hover:bg-zinc-800"
                      : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                  }`}
                >
                  {g === "all" ? "Todos os jogos" : g}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Jogos */}
          {loadingGames ? (
            <div className="text-center py-20 text-zinc-400 text-sm">
              Carregando catálogo de jogos...
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-sm">
              Nenhum jogo encontrado para o filtro selecionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <article
                  key={game.id}
                  onClick={() => openGameModal(game)}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? "bg-[#12141D] border-[#29292F] hover:border-[#FFDE00] hover:shadow-[0_8px_30px_rgba(255,222,0,0.12)] hover:-translate-y-1"
                      : "bg-white border-zinc-200 hover:border-black hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={game.coverImage || game.screenshots?.[0] || "/images/so-much-to-love-cover.jpg"}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {game.adult && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white shadow-md">
                        18+
                      </span>
                    )}
                    {game.rating && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-black/80 text-[#FFDE00] backdrop-blur-md flex items-center gap-1">
                        <StarIcon className="w-3 h-3" />
                        <span>{game.rating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        <span>{game.developer || "Indie"}</span>
                        <span>{game.engine || "Ren'Py"}</span>
                      </div>
                      <h3 className="font-black text-base group-hover:text-[#FFDE00] transition-colors leading-snug">
                        {game.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-500 text-[11px]">{game.version ? `v${game.version}` : "Atualizado"}</span>
                      <span className="text-[#FFDE00] group-hover:underline flex items-center gap-1">
                        Ver Detalhes →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* SEÇÃO DE PERGUNTAS FREQUENTES (FAQ ACORDEÃO)                  */}
        {/* ============================================================== */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFDE00]">
              TIRE SUAS DÚVIDAS
            </span>
            <h2 className="text-3xl font-black uppercase">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "O RenPlay Launcher é gratuito?",
                a: "Sim, o aplicativo do RenPlay é 100% gratuito, sem planos pagos para baixar ou jogar histórias públicas da comunidade.",
              },
              {
                q: "Como funcionam as traduções em português?",
                a: "Os jogos já contam com os pacotes de tradução instalados diretamente ou disponibilizados com instalador automático em game/tl.",
              },
              {
                q: "Posso jogar offline sem conexão com a internet?",
                a: "Com certeza! Depois de baixar o jogo através do launcher, ele roda localmente no seu computador sem exigir conexão ativa.",
              },
              {
                q: "O launcher é compatível com Windows 10 e 11?",
                a: "Sim! Desenvolvido com aceleração nativa e suporte completo a arquiteturas 64-bit para Windows 10 e Windows 11.",
              },
              {
                q: "Como publico meu jogo no catálogo do RenPlay?",
                a: "Basta acessar a área de criadores no menu ou em /dev, criar sua conta de desenvolvedor e submeter a documentação do projeto.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDark ? "bg-[#141a26] border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-[#FFDE00]" : "text-zinc-500"
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* BANNER CTA FINAL DE DOWNLOAD                                   */}
        {/* ============================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#252000] via-[#12141D] to-[#090A0F] border border-[#FFDE00]/25 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="space-y-3 relative z-10 max-w-xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFDE00]">
                COMECE A JOGAR AGORA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase">
                Pronto para viver grandes histórias?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Baixe o instalador oficial do RenPlay Launcher para Windows e tenha a biblioteca completa no seu computador.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button
                onClick={handleDownload}
                className="py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_4px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] transition-all flex items-center gap-2 cursor-pointer"
              >
                <WindowsIcon className="w-5 h-5" />
                <span>Baixar para Windows (64-bit)</span>
              </button>
              <Link
                href="/portal"
                className="py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              >
                Acessar Portal da Conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* MODAL DETALHADO DO JOGO COM CARROSSEL DE SCREENSHOTS           */}
      {/* ============================================================== */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${
              isDark ? "bg-[#0d111a] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
            }`}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            {/* Galeria de Screenshots */}
            {selectedGame.screenshots && selectedGame.screenshots.length > 0 && (
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedGame.screenshots[activeImageIndex] || selectedGame.coverImage}
                  alt={selectedGame.name}
                  className="w-full h-full object-cover"
                />

                {/* Controles de Próximo / Anterior */}
                {selectedGame.screenshots.length > 1 && (
                  <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === 0 ? selectedGame.screenshots!.length - 1 : prev - 1
                        );
                      }}
                      className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors pointer-events-auto cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev === selectedGame.screenshots!.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors pointer-events-auto cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                )}

                {/* Miniaturas de Navegação */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                  {selectedGame.screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeImageIndex === i ? "w-6 bg-[#FFDE00]" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo do Modal */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                    <span>{selectedGame.developer}</span>
                    <span>•</span>
                    <span>{selectedGame.genre || "Visual Novel"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1">{selectedGame.name}</h2>
                </div>

                {selectedGame.downloadUrl && (
                  <a
                    href={selectedGame.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wide bg-[#FFDE00] hover:bg-[#ffe84d] text-black shadow-lg flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Baixar Jogo ({selectedGame.sizeLabel || "Direto"})</span>
                  </a>
                )}
              </div>

              {/* Informações Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <span className="text-zinc-500 font-bold uppercase block text-[10px]">Versão</span>
                  <span className="font-semibold">{selectedGame.version || "1.0"}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <span className="text-zinc-500 font-bold uppercase block text-[10px]">Tradução</span>
                  <span className="font-semibold">{selectedGame.translator || "Oficial"}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <span className="text-zinc-500 font-bold uppercase block text-[10px]">Engine</span>
                  <span className="font-semibold">{selectedGame.engine || "Ren'Py"}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
                  <span className="text-zinc-500 font-bold uppercase block text-[10px]">Classificação</span>
                  <span className={`font-bold ${selectedGame.adult ? "text-red-400" : "text-emerald-400"}`}>
                    {selectedGame.adult ? "Adulto (18+)" : "Livre"}
                  </span>
                </div>
              </div>

              {/* Sinopse e História */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Sinopse da História</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {selectedGame.fullDescription || selectedGame.description}
                </p>
                {selectedGame.story && (
                  <p className="text-xs text-zinc-400 italic leading-relaxed">
                    &ldquo;{selectedGame.story}&rdquo;
                  </p>
                )}
              </div>

              {/* Espelhos de Download */}
              {selectedGame.downloadMirrors && selectedGame.downloadMirrors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Espelhos de Download</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedGame.downloadMirrors.map((mirror) => (
                      <a
                        key={mirror.id}
                        href={mirror.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-zinc-700/80 bg-zinc-800/30 hover:border-[#FFDE00] transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{mirror.name}</div>
                          <div className="text-[10px] text-zinc-400">{mirror.provider}</div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {mirror.status}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Atualizações Recentes */}
              {selectedGame.updates && selectedGame.updates.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Notas de Atualização</h4>
                  <div className="space-y-2">
                    {selectedGame.updates.map((up, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-[#FFDE00]">v{up.version} — {up.title}</span>
                          <span className="text-zinc-500 text-[10px]">{up.date}</span>
                        </div>
                        {up.improvements && <p className="text-zinc-400">{up.improvements}</p>}
                        {up.translation && <p className="text-zinc-400 font-semibold">{up.translation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FOOTER OFICIAL COMPLETO                                        */}
      {/* ============================================================== */}
      <footer
        className={`border-t py-12 transition-colors ${
          isDark
            ? "bg-[#0a0d14] border-zinc-800/80 text-zinc-500"
            : "bg-[#f1f3f7] border-zinc-200 text-zinc-600"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-xs text-zinc-400 font-semibold">
                Plataforma e Launcher oficial de Visual Novels para Windows.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold">
              <a href="#inicio" className="hover:text-[#FFDE00] transition-colors">Download</a>
              <a href="#descobrir" className="hover:text-[#FFDE00] transition-colors">Catálogo</a>
              <Link href="/portal" className="hover:text-[#FFDE00] transition-colors">Minha Conta</Link>
              <Link href="/dev" className="hover:text-[#FFDE00] transition-colors">Área da Equipe</Link>
              <Link href="/dashboard" className="hover:text-[#FFDE00] transition-colors">Dashboard RenPlay</Link>
              <Link href="/login" className="hover:text-[#FFDE00] transition-colors">Entrar</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© 2026 RenPlay. Todos os direitos reservados. Não associado oficialmente ao Ren&apos;Py.</p>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Termos de Serviço</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
