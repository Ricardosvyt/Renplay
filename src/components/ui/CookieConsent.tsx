"use client";

import React, { useState, useEffect } from "react";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem("renplay_cookie_consent");
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage bloqueado ou indisponível
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    setClosing(true);
    setTimeout(() => {
      try {
        localStorage.setItem("renplay_cookie_consent", type);
      } catch {}
      setVisible(false);
    }, 250);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Consentimento de Cookies"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[200] transition-all duration-300 ${
        closing ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100 animate-arrive"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#111217]/95 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,222,0,0.12)] p-5 text-zinc-100 font-sans">
        {/* Linha de brilho dourado no topo */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_0_12px_#FFDE00]" />

        <div className="flex items-start gap-3.5 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FFDE00]/10 border border-[#FFDE00]/30 flex items-center justify-center text-[#FFDE00] shadow-[0_0_15px_rgba(255,222,0,0.2)] animate-pulse">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
              <circle cx="10" cy="15.5" r="1" fill="currentColor" />
              <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              Privacidade & Cookies
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFDE00] px-2 py-0.5 rounded-full bg-[#FFDE00]/10 border border-[#FFDE00]/20">
                RenPlay
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Utilizamos cookies para salvar suas preferências, manter sessões ativas e proporcionar uma experiência rápida e segura.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FFDE00] hover:bg-[#ffe655] active:scale-95 text-[#12110a] text-xs font-black tracking-wide transition-all shadow-[0_4px_16px_rgba(255,222,0,0.25)] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Aceitar todos
          </button>
          <button
            type="button"
            onClick={() => handleAccept("essential")}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 active:scale-95 text-zinc-300 text-xs font-semibold transition-all cursor-pointer text-center"
          >
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
