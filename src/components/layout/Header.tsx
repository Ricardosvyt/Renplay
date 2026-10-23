import React from "react";
import Link from "next/link";

interface HeaderProps {
  isDark: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleTheme: () => void;
  onDownload: () => void;
}

export function Header({
  isDark,
  searchQuery,
  onSearchChange,
  onToggleTheme,
  onDownload
}: HeaderProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar no catálogo..."
              className={`py-2 pl-9 pr-8 text-xs rounded-xl border outline-none transition-all w-44 lg:w-56 ${
                isDark
                  ? "bg-[#12141D] border-[#29292F] text-white placeholder-zinc-500 focus:border-[#FFDE00] focus:w-64"
                  : "bg-zinc-100 border-zinc-300 text-black placeholder-zinc-400 focus:border-[#FFDE00] focus:w-64"
              }`}
            />
            <svg className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 pointer-events-none">
              /
            </kbd>
          </div>

          {/* Alternador de Tema */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? "bg-[#141a26] text-[#FFDE00] border-zinc-700/80 hover:border-[#FFDE00]"
                : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
            }`}
            title="Alternar Tema"
          >
            {isDark ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
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

          {/* Botão Baixar Launcher */}
          <button
            onClick={onDownload}
            className="py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_4px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] hover:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">Baixar Launcher</span>
          </button>
        </div>
      </div>
    </header>
  );
}
