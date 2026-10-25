"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type GameSummary = { id: string; name: string; status: string; saveCount: number; userCount: number; totalBytes: number };
type Save = { id: string; userId: string; username: string; email: string; slotNumber: number; filename: string; sizeBytes: number; version: number; gameVersion: string; updatedAt: string };
type Result = { games: GameSummary[]; gameId: string | null; saves: Save[]; total: number; page: number; pageSize: number; error?: string };

const size = (bytes: number) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function DashboardSavesTab() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [gameId, setGameId] = useState("");
  const [saves, setSaves] = useState<Save[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (gameId) params.set("gameId", gameId);
    fetch(`/api/admin/cloud-saves?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as Result;
        if (!response.ok) throw new Error(data.error || "Falha ao carregar saves.");
        return data;
      })
      .then((data) => {
        setGames(data.games);
        setSaves(data.saves);
        setTotal(data.total);
        setError("");
      })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Falha ao carregar saves."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [gameId, page]);

  const selectedId = gameId || games[0]?.id;
  const selected = games.find((game) => game.id === selectedId);
  const visibleGames = useMemo(() => games.filter((game) =>
    `${game.name} ${game.id}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))
  ), [games, search]);
  const totalPages = Math.max(1, Math.ceil(total / 25));
  const allSaves = games.reduce((sum, game) => sum + game.saveCount, 0);
  const allUsers = games.reduce((sum, game) => sum + game.userCount, 0);

  return <div className="space-y-6 animate-fade-in-up">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#FFDE00]/25 bg-[radial-gradient(circle_at_top_right,rgba(255,222,0,0.12),transparent_45%),#12141D] p-6 sm:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">RenPlay Cloud Save</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Saves por jogo e usuário</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">Consulte os saves Premium guardados na nuvem. Saves locais gratuitos ficam no computador de cada jogador.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"><strong className="block text-xl text-white">{games.length}</strong><span className="text-[11px] text-zinc-400">jogos com saves</span></div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"><strong className="block text-xl text-[#FFDE00]">{allSaves}</strong><span className="text-[11px] text-zinc-400">saves ativos</span></div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"><strong className="block text-xl text-white">{allUsers}</strong><span className="text-[11px] text-zinc-400">contas por jogo</span></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><Link href="/dashboard/jogos" className="rounded-xl border border-[#FFDE00]/40 px-4 py-2 text-xs font-bold text-[#FFDE00] hover:bg-[#FFDE00]/10">Editar jogos</Link><Link href="/dashboard/usuarios" className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/5">Editar usuários</Link></div>
    </section>

    {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <section className="min-w-0 rounded-2xl border border-[#29292F] bg-[#12141D] p-4">
        <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-black text-white">Jogos</h2><span className="text-xs text-zinc-500">{games.length}</span></div>
        <input aria-label="Buscar jogo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome ou ID..." className="mt-4 w-full rounded-xl border border-[#303038] bg-[#090A0F] px-3 py-2.5 text-xs text-white outline-none focus:border-[#FFDE00]" />
        <div className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {visibleGames.map((game) => <button key={game.id} type="button" onClick={() => { setLoading(true); setGameId(game.id); setPage(1); }} className={`w-full rounded-xl border p-3 text-left transition ${game.id === selectedId ? "border-[#FFDE00] bg-[#FFDE00]/10" : "border-[#29292F] bg-[#0D0E14] hover:border-[#FFDE00]/40"}`}>
            <span className="block truncate text-sm font-bold text-white">{game.name}</span>
            <span className="mt-1 block break-all font-mono text-[10px] text-zinc-500">{game.id}</span>
            <span className="mt-2 block text-[11px] text-[#FFDE00]">{game.saveCount} saves · {game.userCount} contas</span>
          </button>)}
          {!loading && games.length === 0 && <p className="rounded-xl border border-dashed border-[#303038] p-5 text-center text-xs text-zinc-500">Nenhum save Premium enviado ainda.</p>}
          {!loading && games.length > 0 && visibleGames.length === 0 && <p className="p-4 text-xs text-zinc-500">Nenhum jogo corresponde à busca.</p>}
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#29292F] bg-[#12141D]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#29292F] p-5">
          <div><p className="text-[10px] font-black uppercase tracking-widest text-[#FFDE00]">Detalhes do jogo</p><h2 className="mt-1 text-lg font-black text-white">{selected?.name || "Selecione um jogo"}</h2><p className="mt-1 break-all font-mono text-[10px] text-zinc-500">{selected?.id || ""}</p></div>
          {selected && <div className="text-right text-xs text-zinc-400"><div>{selected.userCount} jogadores</div><div className="mt-1">{size(selected.totalBytes)} armazenados</div><Link href={`/dashboard/jogos/publish?edit=${encodeURIComponent(selected.id)}`} className="mt-2 inline-block font-bold text-[#FFDE00] hover:underline">Editar jogo →</Link></div>}
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-[#0D0E14] text-[10px] uppercase tracking-widest text-zinc-500"><tr><th className="p-4">Usuário</th><th className="p-4">Slot</th><th className="p-4">Arquivo</th><th className="p-4">Tamanho</th><th className="p-4">Atualizado</th></tr></thead><tbody className="divide-y divide-[#29292F]">
          {loading ? <tr><td colSpan={5} className="p-10 text-center text-zinc-500">Carregando saves...</td></tr> : saves.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-zinc-500">Nenhum save para este jogo.</td></tr> : saves.map((save) => <tr key={save.id} className="hover:bg-white/[0.03]"><td className="p-4"><span className="block font-bold text-white">{save.username}</span><span className="text-zinc-500">{save.email}</span></td><td className="p-4"><span className="rounded-lg border border-[#FFDE00]/30 bg-[#FFDE00]/10 px-2 py-1 font-bold text-[#FFDE00]">{save.slotNumber}</span></td><td className="p-4"><span className="block max-w-48 truncate text-zinc-200" title={save.filename}>{save.filename}</span><span className="text-[10px] text-zinc-500">Versão do jogo: {save.gameVersion || "não informada"}</span></td><td className="p-4 text-zinc-300">{size(save.sizeBytes)}</td><td className="p-4 text-zinc-400">{new Date(save.updatedAt).toLocaleString("pt-BR")}</td></tr>)}
        </tbody></table></div>
        {total > 25 && <div className="flex items-center justify-between border-t border-[#29292F] px-5 py-4 text-xs text-zinc-400"><span>Página {page} de {totalPages} · {total} saves</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }} className="rounded-lg border border-[#34343B] px-3 py-2 disabled:opacity-40">Anterior</button><button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage(page + 1); }} className="rounded-lg bg-[#FFDE00] px-3 py-2 font-bold text-black disabled:opacity-40">Próxima</button></div></div>}
      </section>
    </div>
  </div>;
}
