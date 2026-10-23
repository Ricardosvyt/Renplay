import React from "react";
import { Game } from "@/types/game";
import { GameCard } from "@/components/catalog/GameCard";

interface HomeCatalogSectionProps {
  isDark: boolean;
  games: Game[];
  genreList: string[];
  selectedGenre: string;
  loadingGames: boolean;
  onSelectGenre: (genre: string) => void;
  onOpenModal: (game: Game) => void;
}

export function HomeCatalogSection({
  isDark,
  games,
  genreList,
  selectedGenre,
  loadingGames,
  onSelectGenre,
  onOpenModal
}: HomeCatalogSectionProps) {
  return (
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
              onClick={() => onSelectGenre(g)}
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
      ) : games.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          Nenhum jogo encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isDark={isDark}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      )}
    </section>
  );
}
