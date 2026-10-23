"use client";

import React, { useEffect, useRef } from "react";

interface AuthCharacterSideProps {
  isDark: boolean;
}

function ArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CloudIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

export function AuthCharacterSide({ isDark }: AuthCharacterSideProps) {
  const closedEyeRef = useRef<HTMLImageElement>(null);
  const rinaImageClass = "absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none select-none";

  // Piscada natural usando as duas PNGs originais, sem alterar suas cores ou transparência.
  useEffect(() => {
    const preload = new Image();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let active = true;

    const wait = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const setClosed = (closed: boolean) => {
      if (closedEyeRef.current) {
        closedEyeRef.current.style.opacity = closed ? "1" : "0";
      }
    };

    const blink = (doubleBlink = false) => {
      if (!active) return;

      setClosed(true);
      wait(() => {
        if (!active) return;
        setClosed(false);

        if (doubleBlink) {
          wait(() => blink(false), 170);
        } else {
          scheduleNextBlink();
        }
      }, 105);
    };

    const scheduleNextBlink = () => {
      if (!active) return;
      const delay = 2800 + Math.random() * 4000;
      wait(() => blink(Math.random() < 0.16), delay);
    };

    preload.onload = () => {
      if (!active) return;
      const decoded = preload.decode ? preload.decode() : Promise.resolve();
      void decoded.catch(() => undefined).finally(() => {
        if (active) scheduleNextBlink();
      });
    };
    preload.src = "/Rina_closed_eyes.png";

    return () => {
      active = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <div
      className={`order-2 lg:order-1 relative w-full lg:w-[56%] min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden flex flex-col justify-center p-6 sm:p-14 z-10 animate-fade-in-up select-none transition-colors duration-300 ${
        isDark
          ? "bg-[#07070A] bg-[radial-gradient(ellipse_at_35%_40%,rgba(255,222,0,0.08),transparent_65%)]"
          : "bg-[#EAECEF] bg-[radial-gradient(ellipse_at_40%_40%,#FFFFFF,#DEE2E8_80%)]"
      }`}
    >
      {/* Grid de Pontos Amarelos Oficiais Renplay (#FFDE00) com Dissipação Suave */}
      <div
        className={`absolute inset-0 [background-size:22px_22px] pointer-events-none z-0 transition-all duration-300 ${
          isDark
            ? "bg-[radial-gradient(#FFDE00_1.5px,transparent_1.5px)] opacity-25"
            : "bg-[radial-gradient(#FFDE00_2px,transparent_2px)] opacity-70"
        }`}
        style={{
          maskImage: "linear-gradient(to right, black 72%, transparent 97%)",
          WebkitMaskImage: "linear-gradient(to right, black 72%, transparent 97%)",
        }}
      />

      {/* Sombreamento Natural nas Extremidades */}
      <div
        className={`absolute inset-0 pointer-events-none z-[1] transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-t from-[#07070A]/95 via-transparent to-transparent"
            : "bg-gradient-to-t from-[#EAECEF]/85 via-transparent to-transparent"
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none z-[1] transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-r from-[#07070A]/85 via-transparent to-transparent"
            : "bg-gradient-to-r from-[#FFFFFF]/70 via-transparent to-transparent"
        }`}
      />
      {/* Fade Suave na Margem Direita para Integração Perfeita */}
      <div
        className={`absolute inset-y-0 right-0 w-32 pointer-events-none z-[2] transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-r from-transparent via-[#090A10]/60 to-[#090A10]"
            : "bg-gradient-to-r from-transparent via-[#F7F8FA]/60 to-[#F7F8FA]"
        }`}
      />

      {/* Luz Ambiente Dinâmica / Aura Centralizada Atrás da Personagem (Rina) */}
      <div
        className={`absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none z-[2] animate-character-glow transition-colors duration-500 ${
          isDark
            ? "bg-[#FFDE00]/10 right-4 sm:right-16 top-1/4"
            : "bg-amber-400/18 right-4 sm:right-16 top-1/4"
        }`}
      />

      {/* Personagem Anime (Rina) Posicionada à Direita para Deixar Espaço Limpo para o Texto */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rina-anchored-float">
        <div
          aria-hidden="true"
          className="absolute right-[12%] top-[18%] w-[42%] h-[58%] rounded-full bg-[#FFDE00]/10 blur-[80px]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Rina_open.png"
          alt="Renplay Visual Artwork - Personagem Anime Rina"
          className={`${rinaImageClass} drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)] drop-shadow-[0_0_35px_rgba(255,222,0,0.22)]`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={closedEyeRef}
          src="/Rina_closed_eyes.png"
          alt=""
          aria-hidden="true"
          className={`${rinaImageClass} opacity-0 transition-opacity duration-75`}
        />
      </div>

      {/* Conteúdo Textual e Badges com Tipografia Refinada */}
      <div className="relative z-20 my-auto py-8 text-center sm:text-left max-w-sm xl:max-w-md">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md border ${
            isDark
              ? "bg-amber-400/10 text-[#FFDE00] border-[#FFDE00]/30 shadow-[0_0_12px_rgba(255,222,0,0.15)]"
              : "bg-amber-500/10 text-amber-800 border-amber-500/30 shadow-xs"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#FFDE00] animate-pulse" />
          <span>Renplay Account • Ecossistema Oficial</span>
        </div>

        <h2
          className={`text-2xl sm:text-4xl xl:text-[42px] font-black uppercase tracking-tight leading-[1.08] transition-colors duration-300 ${
            isDark
              ? "text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
              : "text-zinc-950 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]"
          }`}
        >
          Sua próxima história <br />
          <span className="bg-gradient-to-r from-[#FFDE00] via-[#FFE54D] to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,222,0,0.3)]">
            começa aqui.
          </span>
        </h2>

        <p
          className={`text-xs sm:text-sm font-medium mt-4 leading-relaxed max-w-[340px] xl:max-w-[380px] transition-colors duration-300 ${
            isDark
              ? "text-zinc-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
              : "text-zinc-700 drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
          }`}
        >
          Entre para explorar jogos, sincronizar seus saves e acompanhar seus projetos no ecossistema Ren&apos;Py.
        </p>

        <div className="relative z-30 flex flex-wrap items-center gap-2.5 pt-5">
          <span
            className={`inline-flex h-11 min-w-[154px] whitespace-nowrap justify-center text-xs font-bold px-4 rounded-lg border backdrop-blur-md items-center gap-2 ${
              isDark
                ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                : "bg-white/80 border-zinc-200/80 text-zinc-800 shadow-xs"
            }`}
          >
            <ArrowRightIcon className="w-3.5 h-3.5 text-[#FFDE00]" /> Instalação rápida
          </span>
          <span
            className={`inline-flex h-11 min-w-[166px] whitespace-nowrap justify-center text-xs font-bold px-4 rounded-lg border backdrop-blur-md items-center gap-2 ${
              isDark
                ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                : "bg-white/80 border-zinc-200/80 text-zinc-800 shadow-xs"
            }`}
          >
            <CloudIcon className="text-[#FFDE00]" /> Saves sincronizados
          </span>
        </div>
      </div>
    </div>
  );
}
