import React from "react";
import { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  isDark: boolean;
  onOpenModal: (game: Game) => void;
}

export function GameCard({ game, isDark, onOpenModal }: GameCardProps) {
  return (
    <article
      onClick={() => onOpenModal(game)}
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
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
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
  );
}
