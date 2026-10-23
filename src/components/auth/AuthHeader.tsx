"use client";

import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

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

function ArrowLeftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function AuthHeader({ isDark, onToggleTheme }: AuthHeaderProps) {
  return (
    <header
      className={`border-b px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? "bg-[#090A0F]/90 border-[#1B1D27]" : "bg-white/95 border-zinc-200/80 shadow-xs"
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logoaccount.png"
              alt="Renplay Account"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <Link
            href="/"
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isDark
                ? "text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                : "text-zinc-600 hover:text-black border-zinc-200 hover:border-zinc-300 bg-zinc-100/60"
            }`}
          >
            <ArrowLeftIcon />
            <span>Início</span>
          </Link>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
          aria-pressed={!isDark}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-[#141620] text-[#FFDE00] border-[#FFDE00]/40 hover:border-[#FFDE00] shadow-[0_2px_8px_rgba(255,222,0,0.15)]"
              : "bg-[#FFD200] text-black border-black/80 hover:bg-[#FFE033] shadow-sm"
          }`}
          title="Alternar Modo Escuro / Claro"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span className="hidden sm:inline">{isDark ? "Modo Claro" : "Modo Escuro"}</span>
        </button>
      </div>
    </header>
  );
}
