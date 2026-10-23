"use client";

import React from "react";
import Link from "next/link";
import { TeamMember } from "./types";

interface DashboardUsersTabProps {
  users: TeamMember[];
}

function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CodeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CrownIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

function UserIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function getRoleBadge(role: string) {
  const r = (role || "").toLowerCase();
  switch (r) {
    case "admin":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
          <ShieldIcon className="w-3 h-3 text-rose-400" />
          <span>Administrador</span>
        </span>
      );
    case "dev":
    case "developer":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]">
          <CodeIcon className="w-3 h-3 text-sky-400" />
          <span>Desenvolvedor</span>
        </span>
      );
    case "tradutor":
    case "translator":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <GlobeIcon className="w-3 h-3 text-emerald-400" />
          <span>Tradutor Oficial</span>
        </span>
      );
    case "moderador":
    case "moderator":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          <ShieldIcon className="w-3 h-3 text-indigo-400" />
          <span>Moderador</span>
        </span>
      );
    case "vip":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/40 shadow-[0_0_15px_rgba(255,222,0,0.3)]">
          <CrownIcon className="w-3 h-3 text-[#FFDE00]" />
          <span>Membro VIP</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
          <UserIcon className="w-3 h-3 text-zinc-400" />
          <span>Usuário</span>
        </span>
      );
  }
}

export function getVerificationBadge(level: number = 1) {
  if (level >= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-amber-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>3/3 Verificado</span>
      </span>
    );
  }
  if (level === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>2/3 Em Análise</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
      <span>1/3 E-mail</span>
    </span>
  );
}

export default function DashboardUsersTab({ users }: DashboardUsersTabProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Equipe & Permissões
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Membros com acesso para gerenciar o catálogo, traduções e publicações.
          </p>
        </div>

        <Link
          href="/dashboard/usuarios"
          className="px-4 py-2.5 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <UsersIcon className="w-4 h-4 text-black" />
          <span>Painel de Usuários (Neon DB) →</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-[#29292F] bg-[#12141D] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#29292F] bg-[#090A0F] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
              <th className="p-4">Usuário</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Função</th>
              <th className="p-4">Verificação (3 Etapas)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Cadastrado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-semibold">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <UsersIcon className="w-9 h-9 text-zinc-700 stroke-1" />
                    <p className="text-sm font-bold text-zinc-400">Nenhum membro cadastrado</p>
                    <p className="text-xs text-zinc-600">A equipe está vazia no momento.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <Link
                      href="/dashboard/usuarios"
                      className="font-bold text-white hover:text-[#FFDE00] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                      title="Clique para abrir a ficha do usuário no Painel Neon"
                    >
                      <span>{u.name}</span>
                      <span className="text-[10px] text-zinc-500 group-hover:text-[#FFDE00] transition-colors">↗ Ficha</span>
                    </Link>
                  </td>
                  <td className="p-4 text-zinc-300 font-mono text-[11px]">{u.email}</td>
                  <td className="p-4">{getRoleBadge(u.role)}</td>
                  <td className="p-4">{getVerificationBadge(u.verificationLevel)}</td>
                  <td className="p-4">
                    <span className="text-emerald-400 text-xs font-bold">✓ Ativo</span>
                  </td>
                  <td className="p-4 text-zinc-400 text-xs">{u.joinedDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
