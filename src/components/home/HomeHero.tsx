import React from "react";
import { LauncherInfo } from "@/types/game";

interface HomeHeroProps {
  isDark: boolean;
  launcherInfo: LauncherInfo;
  downloadStarted: boolean;
  onDownload: () => void;
}

export function HomeHero({
  isDark,
  launcherInfo,
  downloadStarted,
  onDownload
}: HomeHeroProps) {
  return (
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
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.2 10.5 4v7H3V5.2Zm9 5.8V3.8L21 2v9h-9ZM3 12.5h7.5v7L3 18.3v-5.8Zm9 0h9v9l-9-1.5v-7.5Z" />
              </svg>
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
              onClick={onDownload}
              className="w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wide bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_5px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] hover:translate-y-[3px] transition-all flex items-center justify-center gap-4 cursor-pointer group"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5.2 10.5 4v7H3V5.2Zm9 5.8V3.8L21 2v9h-9ZM3 12.5h7.5v7L3 18.3v-5.8Zm9 0h9v9l-9-1.5v-7.5Z" />
              </svg>
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
  );
}
