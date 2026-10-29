import React from "react";
import Link from "next/link";
import { DashboardTab } from "./types";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  gamesCount?: number;
  usersCount?: number;
}

export function DashboardSidebar({ activeTab, gamesCount, usersCount }: DashboardSidebarProps) {
  const navItems = [
    {
      id: "overview" as DashboardTab,
      label: "Visão Geral",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    },
    {
      id: "games" as DashboardTab,
      label: "Catálogo de Jogos",
      href: "/dashboard/jogos",
      count: gamesCount,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <circle cx="15" cy="13" r="1" />
          <circle cx="17.5" cy="10.5" r="1" />
          <rect x="2" y="6" width="20" height="12" rx="4" />
        </svg>
      )
    },
    {
      id: "saves" as DashboardTab,
      label: "Saves Premium",
      href: "/dashboard/saves",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h14l2 2v14H4z" /><path d="M7 4v6h10V4M8 20v-7h8v7" />
        </svg>
      )
    },
    {
      id: "users" as DashboardTab,
      label: "Equipe & Acessos",
      href: "/dashboard/usuarios",
      count: usersCount,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: "advertising" as DashboardTab,
      label: "Publicidade",
      href: "/dashboard/publicidade",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5L7 9H5a2 2 0 0 0-2 2Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>
        </svg>
      )
    },
    {
      id: "settings" as DashboardTab,
      label: "Configurações",
      href: "/dashboard/configuracoes",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-full shrink-0 border-b border-[#29292F] bg-[#0D0E14]/80 p-3 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
      <div className="space-y-1">
        <span className="hidden px-3 text-[10px] font-black uppercase tracking-widest text-[#FFDE00] lg:block">
          NAVEGAÇÃO
        </span>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0 lg:pt-2">
          {navItems.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex min-h-10 shrink-0 items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all lg:w-full ${
                activeTab === tab.id
                  ? "bg-[#FFDE00] text-black font-black shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    activeTab === tab.id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 hidden space-y-2 rounded-2xl border border-[#29292F] bg-[#12141D] p-4 lg:block">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
          <span>Status dos Servidores</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[11px] text-zinc-400 font-medium">CDN e APIs operando normalmente com 100% de disponibilidade.</p>
      </div>
    </aside>
  );
}
