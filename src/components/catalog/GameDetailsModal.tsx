import React from "react";
import { Game } from "@/types/game";
import { formatImageUrl } from "@/lib/image-url";

interface GameDetailsModalProps {
  game: Game | null;
  isDark: boolean;
  activeImageIndex: number;
  userLibraryIds: string[];
  libraryActionLoading: boolean;
  onClose: () => void;
  onSetActiveImageIndex: (index: number | ((prev: number) => number)) => void;
  onToggleLibrary: (gameId: string) => void;
}

export function GameDetailsModal({
  game,
  isDark,
  activeImageIndex,
  userLibraryIds,
  libraryActionLoading,
  onClose,
  onSetActiveImageIndex,
  onToggleLibrary
}: GameDetailsModalProps) {
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${
          isDark ? "bg-[#0d111a] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
        }`}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Galeria de Screenshots */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="relative aspect-[16/9] bg-black overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formatImageUrl(game.screenshots[activeImageIndex] || game.coverImage || (game as { mainCover?: string }).mainCover)}
              alt={game.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/so-much-to-love-cover.jpg";
              }}
            />

            {/* Controles de Próximo / Anterior */}
            {game.screenshots.length > 1 && (
              <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveImageIndex((prev) =>
                      prev === 0 ? game.screenshots!.length - 1 : prev - 1
                    );
                  }}
                  className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors pointer-events-auto cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveImageIndex((prev) =>
                      prev === game.screenshots!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors pointer-events-auto cursor-pointer"
                >
                  →
                </button>
              </div>
            )}

            {/* Miniaturas de Navegação */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
              {game.screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSetActiveImageIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === i ? "w-6 bg-[#FFDE00]" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo do Modal */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                <span>{game.developer}</span>
                <span>•</span>
                <span>{game.genre || "Visual Novel"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">{game.name}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onToggleLibrary(game.id)}
                disabled={libraryActionLoading}
                className={`py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  userLibraryIds.includes(game.id)
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30"
                    : "bg-[#FFDE00] hover:bg-[#ffe84d] text-black shadow-lg"
                }`}
              >
                <span>
                  {userLibraryIds.includes(game.id)
                    ? "✓ Na sua biblioteca (Remover)"
                    : "+ Adicionar à Minha Biblioteca"}
                </span>
              </button>

              <a
                href={`renplay://launch/${game.id}`}
                className="py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <span>▶ Abrir no Launcher</span>
              </a>

              {game.downloadUrl && (
                <a
                  href={game.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wide bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Baixar Jogo</span>
                </a>
              )}
            </div>
          </div>

          {/* Informações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase block text-[10px]">Versão</span>
              <span className="font-semibold">{game.version || "1.0"}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase block text-[10px]">Tradução</span>
              <span className="font-semibold">{game.translator || "Oficial"}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase block text-[10px]">Engine</span>
              <span className="font-semibold">{game.engine || "Ren'Py"}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase block text-[10px]">Classificação</span>
              <span className={`font-bold ${game.adult ? "text-red-400" : "text-emerald-400"}`}>
                {game.adult ? "Adulto (18+)" : "Livre"}
              </span>
            </div>
          </div>

          {/* Sinopse e História */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Sinopse da História</h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {game.fullDescription || game.description}
            </p>
            {game.story && (
              <p className="text-xs text-zinc-400 italic leading-relaxed">
                &ldquo;{game.story}&rdquo;
              </p>
            )}
          </div>

          {/* Espelhos de Download */}
          {game.downloadMirrors && game.downloadMirrors.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Espelhos de Download</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {game.downloadMirrors.map((mirror) => (
                  <a
                    key={mirror.id}
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-zinc-700/80 bg-zinc-800/30 hover:border-[#FFDE00] transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{mirror.name}</div>
                      <div className="text-[10px] text-zinc-400">{mirror.provider}</div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {mirror.status}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Atualizações Recentes */}
          {game.updates && game.updates.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Notas de Atualização</h4>
              <div className="space-y-2">
                {game.updates.map((up, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#FFDE00]">v{up.version} — {up.title}</span>
                      <span className="text-zinc-500 text-[10px]">{up.date}</span>
                    </div>
                    {up.improvements && <p className="text-zinc-400">{up.improvements}</p>}
                    {up.translation && <p className="text-zinc-400 font-semibold">{up.translation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
