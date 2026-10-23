import React from "react";
import Link from "next/link";

interface HomeDownloadCtaProps {
  onDownload: () => void;
}

export function HomeDownloadCta({ onDownload }: HomeDownloadCtaProps) {
  return (
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
            onClick={onDownload}
            className="py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe84d] active:scale-95 text-black shadow-[0_4px_0_#b59b00] hover:shadow-[0_2px_0_#b59b00] transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5.2 10.5 4v7H3V5.2Zm9 5.8V3.8L21 2v9h-9ZM3 12.5h7.5v7L3 18.3v-5.8Zm9 0h9v9l-9-1.5v-7.5Z" />
            </svg>
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
  );
}
