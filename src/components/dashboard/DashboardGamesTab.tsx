import React, { useState } from "react";
import Link from "next/link";
import { GameItem } from "./types";

interface DashboardGamesTabProps {
  games: GameItem[];
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (status: string) => void;
  onUpdateStatus: (id: string, newStatus: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED") => void;
  onDeleteGame: (id: string, title: string) => void;
  onBatchUpdateStatus?: (ids: string[], newStatus: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED") => void;
  onBatchDelete?: (ids: string[]) => void;
}

export function DashboardGamesTab({
  games,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onUpdateStatus,
  onDeleteGame,
  onBatchUpdateStatus,
  onBatchDelete
}: DashboardGamesTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredGames = games.filter(
    (g) =>
      (statusFilter === "ALL" || g.status === statusFilter) &&
      (g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAllSelected =
    filteredGames.length > 0 && filteredGames.every((g) => selectedIds.includes(g.id));
  const hasSomeSelected = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Desmarca todos os filtrados
      const filteredIds = new Set(filteredGames.map((g) => g.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Marca todos os filtrados
      const newSet = new Set([...selectedIds, ...filteredGames.map((g) => g.id)]);
      setSelectedIds(Array.from(newSet));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBatchStatus = (newStatus: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED") => {
    if (!selectedIds.length) return;
    if (onBatchUpdateStatus) {
      onBatchUpdateStatus(selectedIds, newStatus);
    } else {
      selectedIds.forEach((id) => onUpdateStatus(id, newStatus));
    }
    clearSelection();
  };

  const handleBatchDeleteAction = () => {
    if (!selectedIds.length) return;
    if (onBatchDelete) {
      onBatchDelete(selectedIds);
    } else {
      if (confirm(`Deseja excluir os ${selectedIds.length} jogos selecionados?`)) {
        selectedIds.forEach((id) => {
          const game = games.find((g) => g.id === id);
          onDeleteGame(id, game?.title || "Jogo");
        });
      }
    }
    clearSelection();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Catálogo de Jogos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gerencie títulos, versões de build, status de publicação e downloads do ecossistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar jogo..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="py-2 pl-9 pr-4 rounded-xl text-xs bg-[#12141D] border border-[#29292F] text-white placeholder-zinc-500 outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
            />
            <svg className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <Link
            href="/dashboard/jogos/publish"
            className="btn-epic-primary py-2 px-4 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Novo Jogo</span>
          </Link>
        </div>
      </div>

      {/* FILTROS POR STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "Todos", count: games.length },
            { id: "PUBLISHED", label: "Publicados", count: games.filter((g) => g.status === "PUBLISHED").length },
            { id: "DRAFT", label: "Rascunhos", count: games.filter((g) => g.status === "DRAFT").length },
            { id: "ARCHIVED", label: "Arquivados", count: games.filter((g) => g.status === "ARCHIVED" || g.status === "SUSPENDED").length },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onStatusFilterChange(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === f.id
                  ? "bg-[#FFDE00] text-black shadow-md font-black"
                  : "bg-[#12141D] text-zinc-400 hover:text-white border border-[#29292F]"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === f.id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-400"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {hasSomeSelected && (
          <div className="text-xs font-bold text-[#FFDE00]">
            {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* BARRA FLUTUANTE DE AÇÕES EM MASSA (MÚLTIPLA SELEÇÃO) */}
      {hasSomeSelected && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FFDE00]/40 bg-[#0E1017]/95 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFDE00] text-xs font-black text-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-white">
              {selectedIds.length === 1 ? "1 jogo selecionado" : `${selectedIds.length} jogos selecionados`}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white underline cursor-pointer ml-1"
            >
              Desmarcar todos
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchStatus("PUBLISHED")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer"
            >
              ✓ Publicar ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus("DRAFT")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
            >
              Tornar rascunho
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus("ARCHIVED")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition cursor-pointer"
            >
              Arquivar
            </button>
            <button
              type="button"
              onClick={handleBatchDeleteAction}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/25 transition cursor-pointer"
            >
              Excluir selecionados
            </button>
          </div>
        </div>
      )}

      {/* TABELA DE JOGOS */}
      <div className="rounded-2xl border border-[#29292F] bg-[#12141D] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#29292F] bg-[#090A0F] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Selecionar todos os jogos"
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#FFDE00] accent-[#FFDE00] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4">Jogo</th>
                <th className="p-4">Versão</th>
                <th className="p-4">Engine</th>
                <th className="p-4">Downloads</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-semibold">
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <svg className="w-9 h-9 text-zinc-700 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="6" y1="12" x2="10" y2="12" />
                        <line x1="8" y1="10" x2="8" y2="14" />
                        <circle cx="15" cy="13" r="1" />
                        <circle cx="17.5" cy="10.5" r="1" />
                        <rect x="2" y="6" width="20" height="12" rx="4" />
                      </svg>
                      <p className="text-sm font-bold text-zinc-400">
                        {searchQuery ? "Nenhum jogo encontrado com esse termo." : "Nenhum jogo nesta categoria"}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {searchQuery ? "Tente buscar por outro nome ou gênero." : "Altere o filtro acima ou cadastre um novo título."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => {
                  const isSelected = selectedIds.includes(game.id);
                  return (
                    <tr
                      key={game.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-[#FFDE00]/10 hover:bg-[#FFDE00]/15"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(game.id)}
                          aria-label={`Selecionar ${game.title}`}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#FFDE00] accent-[#FFDE00] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-10 h-12 object-cover rounded-md shadow-sm shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white leading-snug">{game.title}</div>
                          <div className="text-[10px] text-zinc-400">{game.developer} · {game.genre}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-300">v{game.version}</td>
                      <td className="p-4 text-zinc-300">{game.engine}</td>
                      <td className="p-4 text-amber-400 font-bold">{game.downloads.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                            game.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : game.status === "DRAFT"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {game.status === "PUBLISHED" ? "Publicado" : game.status === "DRAFT" ? "Rascunho" : game.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {game.status === "PUBLISHED" ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(game.id, "DRAFT")}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Tornar jogo privado/rascunho"
                          >
                            Despublicar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(game.id, "PUBLISHED")}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Publicar jogo no catálogo"
                          >
                            Publicar
                          </button>
                        )}
                        {game.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(game.id, "ARCHIVED")}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:bg-zinc-700/30 transition-colors cursor-pointer"
                            title="Arquivar jogo"
                          >
                            Arquivar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteGame(game.id, game.title)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
