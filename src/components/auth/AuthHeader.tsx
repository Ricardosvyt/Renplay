"use client";

import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
  isDark?: boolean;
}

function ArrowLeftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function AuthHeader({ isDark = true }: AuthHeaderProps) {
  return (
    <header className="border-b px-4 sm:px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md bg-[#090A0F]/90 border-[#1B1D27]">
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
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
        >
          <ArrowLeftIcon />
          <span>Início</span>
        </Link>
      </div>
    </header>
  );
}
