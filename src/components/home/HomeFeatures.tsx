import React from "react";

interface HomeFeaturesProps {
  isDark: boolean;
}

export function HomeFeatures({ isDark }: HomeFeaturesProps) {
  return (
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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
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
  );
}
