"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import type { DashboardTab } from "./types";

const routeMeta: Array<{ prefix: string; tab: DashboardTab; eyebrow: string; title: string; description: string }> = [
  { prefix: "/dashboard/publicidade", tab: "advertising", eyebrow: "Monetização", title: "Publicidade", description: "Campanhas, posicionamentos e desempenho em todos os canais." },
  { prefix: "/dashboard/configuracoes", tab: "settings", eyebrow: "Sistema", title: "Configurações", description: "Preferências, integrações e parâmetros da plataforma." },
  { prefix: "/dashboard/usuarios", tab: "users", eyebrow: "Administração", title: "Equipe e acessos", description: "Contas, funções, permissões e segurança da equipe." },
  { prefix: "/dashboard/saves", tab: "saves", eyebrow: "Nuvem", title: "Saves Premium", description: "Armazenamento, planos e integridade dos saves." },
  { prefix: "/dashboard/jogos", tab: "games", eyebrow: "Conteúdo", title: "Catálogo de jogos", description: "Publicação, revisão e distribuição do catálogo RenPlay." },
  { prefix: "/dashboard", tab: "overview", eyebrow: "Central operacional", title: "Visão geral", description: "Acompanhe a plataforma e acesse todas as áreas administrativas." },
];

export function DashboardShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const current = routeMeta.find((item) => pathname.startsWith(item.prefix)) ?? routeMeta.at(-1)!;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F5F5]">
      <header className="sticky top-0 z-50 border-b border-[#29292F] bg-[#090A0F]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto shrink-0" />
            <span className="hidden rounded-md border border-[#FFDE00]/30 bg-[#FFDE00]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[.18em] text-[#FFDE00] sm:inline">Central administrativa</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block"><p className="text-[11px] font-bold text-white">{userName}</p><p className="text-[9px] uppercase tracking-widest text-zinc-600">Sessão administrativa</p></div>
            <Link href="/" className="rounded-xl border border-[#29292F] px-3 py-2 text-[11px] font-bold text-zinc-400 transition hover:border-[#FFDE00]/50 hover:text-[#FFDE00]">Ver site</Link>
            <Link href="/portal" className="rounded-xl bg-[#FFDE00] px-3 py-2 text-[11px] font-black text-black transition hover:bg-[#ffe84d]">Minha conta</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:min-h-[calc(100vh-65px)] lg:flex-row">
        <DashboardSidebar activeTab={current.tab} />
        <div className="min-w-0 flex-1">
          <div className="border-b border-[#29292F] bg-[#0D0E14]/55 px-4 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[9px] font-black uppercase tracking-[.24em] text-[#FFDE00]">{current.eyebrow}</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{current.title}</h1><p className="mt-1 text-xs text-zinc-500">{current.description}</p></div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600"><span className="h-2 w-2 rounded-full bg-emerald-400" />Serviços operacionais</div>
            </div>
          </div>
          <main className="p-4 sm:p-6 xl:p-8">{children}</main>
          <footer className="border-t border-[#29292F] px-6 py-4 text-center text-[10px] font-semibold text-zinc-600">© 2026 RenPlay Studios · Central de Controle e Distribuição</footer>
        </div>
      </div>
    </div>
  );
}
