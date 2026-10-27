import React from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, panelClass } from "./FormControls";
import { Status } from "./types";

export interface ReadinessItem {
  label: string;
  ready: boolean;
  detail: string;
}

interface Step6CommunityPreviewProps {
  readiness: ReadinessItem[];
  completedCount: number;
  progressPercent: number;
  status: Status;
  onUpdate: (field: string, value: string) => void;
}

export function Step6Launch({
  readiness,
  completedCount,
  progressPercent,
  status,
  onUpdate
}: Step6CommunityPreviewProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 6: Comunidade, Automações & Revisão Final"
        description="Verifique a prontidão dos dados, as rotinas automáticas do banco de dados Neon e conclua a publicação da obra na loja."
      />

      <div className="space-y-6">
        {/* CHECKLIST DE PRONTIDÃO */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between border-b border-[#29292F] pb-3">
            <span className="text-sm font-black text-white">Checklist de Validação dos Campos</span>
            <span className="text-xs font-bold text-[#FFDE00]">
              {completedCount} de {readiness.length} requisitos preenchidos ({progressPercent}%)
            </span>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {readiness.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                  item.ready
                    ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-200"
                    : "border-red-500/20 bg-red-500/5 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${
                    item.ready ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {item.ready ? "✓" : "!"}
                  </span>
                  <span className={item.ready ? "font-bold text-white" : "font-semibold"}>{item.label}</span>
                </div>
                <span className="max-w-[140px] truncate text-right text-[11px] text-zinc-400">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AUTOMAÇÕES DO BANCO DE DADOS NEON */}
        <div className="rounded-2xl border border-[#FFDE00]/30 bg-[#FFDE00]/5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" className="h-5 w-5 text-[#FFDE00]" />
            <span className="text-sm font-black text-white">Sincronização & Automações no Banco de Dados Neon</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Estes recursos não precisam de preenchimento manual; o backend do RenPlay cuida de tudo automaticamente:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#29292F] bg-[#0E1017] p-3.5">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Avaliações & Média de Estrelas
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Calculadas dinamicamente na tabela <code className="text-zinc-300">rp_reviews</code>. Cada usuário pode avaliar de 1 a 5 estrelas e o sistema recalcula a nota média e o total de reviews.
              </p>
            </div>

            <div className="rounded-xl border border-[#29292F] bg-[#0E1017] p-3.5">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>
                Total de Downloads
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Contabilizado a cada instalação pelo Launcher ou download direto registrado em <code className="text-zinc-300">rp_downloads</code>, atualizando o contador público.
              </p>
            </div>

            <div className="rounded-xl border border-[#29292F] bg-[#0E1017] p-3.5">
              <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Comentários & Comunidade
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Armazenados de forma isolada, vinculando a conta do jogador à obra, com moderação ativa contra spam e ofensas.
              </p>
            </div>

            <div className="rounded-xl border border-[#29292F] bg-[#0E1017] p-3.5">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Jogos Recomendados
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Sugeridos dinamicamente pela API por correspondência de gênero, engine e tags temáticas cadastradas na Etapa 1.
              </p>
            </div>
          </div>
        </div>

        {/* DECISÃO FINAL DE STATUS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <span className="text-sm font-black text-white">Publicar Agora ou Salvar como Rascunho?</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onUpdate("status", "DRAFT")}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                status === "DRAFT"
                  ? "border-amber-500 bg-amber-500/15 text-white ring-2 ring-amber-500/40"
                  : "border-[#29292F] bg-[#12141D] text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-amber-400">Rascunho Privado</span>
                <p className="mt-1 text-xs text-zinc-300">Salvar alterações com segurança sem exibir ao público</p>
              </div>
              {status === "DRAFT" && <span className="text-xs font-bold text-amber-400">Selecionado</span>}
            </button>

            <button
              type="button"
              onClick={() => onUpdate("status", "PUBLISHED")}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                status === "PUBLISHED"
                  ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/40"
                  : "border-[#29292F] bg-[#12141D] text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-emerald-400">Publicado Oficialmente</span>
                <p className="mt-1 text-xs text-zinc-300">Disponibilizar na loja do site e na biblioteca do Launcher</p>
              </div>
              {status === "PUBLISHED" && <span className="text-xs font-bold text-emerald-400">Selecionado</span>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
