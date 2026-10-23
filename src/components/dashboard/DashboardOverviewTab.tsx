import React from "react";
import Link from "next/link";
import { GameItem, UserItem } from "./types";

interface DashboardOverviewTabProps {
  games: GameItem[];
  users: UserItem[];
}

export function DashboardOverviewTab({ games, users }: DashboardOverviewTabProps) {
  const totalDownloads = games.reduce((acc, g) => acc + (g.downloads || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Painel Geral
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Métricas de distribuição, downloads e catálogo da plataforma.
          </p>
        </div>

        <Link
          href="/dashboard/jogos/publish"
          className="btn-epic-primary py-2.5 px-5 rounded-xl cursor-pointer gap-2 font-black text-xs shadow-lg flex items-center shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Publicar Novo Jogo</span>
        </Link>
      </div>

      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#FFDE00]/25 bg-[linear-gradient(120deg,#171506_0%,#12141D_52%,#090A0F_100%)] px-6 py-7 sm:px-8 sm:py-8 shadow-[0_20px_55px_rgba(0,0,0,0.22)]">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#FFDE00]/10 blur-3xl" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#FFDE00]/8 to-transparent" aria-hidden="true" />
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">
            <span className="h-2 w-2 rounded-full bg-[#FFDE00] shadow-[0_0_12px_#FFDE00]" />
            Central RenPlay
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Tudo pronto para a próxima história.</h2>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400">Acompanhe o catálogo, organize a equipe e mantenha o ecossistema RenPlay em movimento.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/dashboard/jogos" className="rounded-xl bg-[#FFDE00] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black hover:bg-[#ffe84d] transition-colors">Ver catálogo</Link>
            <Link href="/dashboard/usuarios" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-zinc-200 hover:border-[#FFDE00]/50 hover:text-[#FFDE00] transition-colors">Gerenciar equipe</Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Rina_open.png" alt="Rina, personagem do RenPlay" className="pointer-events-none absolute -right-3 -bottom-16 hidden h-[310px] w-[280px] object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.55)] sm:block" />
      </section>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total de Jogos", val: games.length.toString(), desc: "Títulos cadastrados no launcher", color: "text-[#FFDE00]" },
          { title: "Downloads Totais", val: totalDownloads.toLocaleString(), desc: "Instalações solicitadas", color: "text-[#FFDE00]" },
          { title: "Equipe Ativa", val: users.length.toString(), desc: "Criadores e moderadores", color: "text-zinc-200" },
          { title: "CDN Uptime", val: "100%", desc: "Pixeldrain e Cloudflare R2", color: "text-zinc-200" },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-1 hover:border-[#FFDE00]/30 transition-colors">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.title}</span>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</div>
            <p className="text-[10px] text-zinc-500 font-medium">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* ÚLTIMOS LANÇAMENTOS */}
      <div className="p-6 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-200">
            Jogos em Destaque no Catálogo
          </h3>
          <Link
            href="/dashboard/jogos"
            className="text-xs font-bold text-[#FFDE00] hover:underline cursor-pointer"
          >
            Ver Todos →
          </Link>
        </div>

        {games.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 w-full flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-zinc-700 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <circle cx="15" cy="13" r="1" />
              <circle cx="17.5" cy="10.5" r="1" />
              <rect x="2" y="6" width="20" height="12" rx="4" />
            </svg>
            <p className="text-sm font-bold text-zinc-400">Nenhum jogo no catálogo ainda</p>
            <p className="text-xs text-zinc-600">O catálogo está vazio. Cadastre uma nova visual novel para começar.</p>
            <Link
              href="/dashboard/jogos/publish"
              className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-[#FFDE00] text-black hover:bg-[#ffe53b] transition-all cursor-pointer shadow-md"
            >
              + Publicar Primeiro Jogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {games.slice(0, 2).map((game) => (
              <div
                key={game.id}
                className="p-4 rounded-xl bg-[#090A0F] border border-[#29292F] flex gap-4 items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-20 h-24 object-cover rounded-lg shrink-0 shadow-md"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">{game.developer}</span>
                  <h4 className="font-bold text-sm truncate">{game.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>v{game.version}</span>
                    <span>•</span>
                    <span>{game.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
