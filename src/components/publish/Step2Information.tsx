import React from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, inputClass, panelClass } from "./FormControls";
import { Status } from "./types";

interface Step5PublicationProps {
  status: Status;
  originalReleaseDate: string;
  renplayPublishDate: string;
  featuredOrder: number;
  releaseNotes: string;
  responsibleDev: string;
  editPermissions: string;
  onUpdate: (field: string, value: string) => void;
}

const statusOptions = [
  { value: "PUBLISHED", label: "Publicado na Loja", badge: "Ativo", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400", desc: "Visível imediatamente para todos os jogadores no site e no Launcher" },
  { value: "DRAFT", label: "Rascunho Privado", badge: "Rascunho", color: "border-amber-500 bg-amber-500/10 text-amber-400", desc: "Apenas administradores e desenvolvedores autorizados podem visualizar" },
  { value: "SUSPENDED", label: "Oculto do Catálogo", badge: "Oculto", color: "border-zinc-600 bg-zinc-800/40 text-zinc-400", desc: "Temporariamente desativado da vitrine para manutenção ou revisão" }
];

export function Step2Information({
  status,
  originalReleaseDate,
  renplayPublishDate,
  featuredOrder,
  releaseNotes,
  responsibleDev,
  editPermissions,
  onUpdate
}: Step5PublicationProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 5: Publicação, Visibilidade & Destaque"
        description="Defina se o jogo ficará visível publicamente, organize a ordem de exibição no carrossel e registre as notas da atualização."
      />

      <div className="space-y-6">
        {/* SELETOR DE STATUS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">
              Status de Publicação <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Controla se o jogo aparece no catálogo público e pode ser baixado pelos usuários do Launcher.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {statusOptions.map((opt) => {
              const active = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate("status", opt.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? `${opt.color} ring-2 ring-[#FFDE00]/50 shadow-[0_0_15px_rgba(255,222,0,0.1)]`
                      : "border-[#29292F] bg-[#12141D] text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider">{opt.badge}</span>
                    {active && <span className="text-xs font-black text-[#FFDE00]">Ativo</span>}
                  </div>
                  <p className="mt-2 text-sm font-black text-white">{opt.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ORDEM DE DESTAQUE NA VITRINE */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="pub-featured" className="text-sm font-black text-white">
              Ordem de Destaque no Hero Banner
            </label>
            <span className="rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Vitrine Hero</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Número que prioriza a ordem no grande carrossel principal (1 = primeiro destaque, 2 = segundo, 0 = sem prioridade).
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              id="pub-featured"
              type="number"
              min={0}
              max={99}
              value={featuredOrder || 0}
              onChange={(e) => onUpdate("featuredOrder", e.target.value)}
              className="w-32 rounded-xl border border-[#29292F] bg-[#12141D] px-4 py-3 text-sm font-black text-[#FFDE00] focus:border-[#FFDE00] outline-none"
            />
            <span className="text-xs text-zinc-400">
              {featuredOrder > 0 ? `Aparecerá como destaque prioritário #${featuredOrder}` : "Exibição padrão por data de lançamento"}
            </span>
          </div>
        </div>

        {/* DATAS DE LANÇAMENTO */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="pub-original-date" className="text-sm font-black text-white">
              Data de Lançamento Original
            </label>
            <p className="mt-1 text-xs text-zinc-400">Quando a obra foi originalmente publicada pelo estúdio.</p>
            <input
              id="pub-original-date"
              type="date"
              value={originalReleaseDate || ""}
              onChange={(e) => onUpdate("originalReleaseDate", e.target.value)}
              className={`${inputClass} mt-3 text-sm`}
            />
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="pub-renplay-date" className="text-sm font-black text-white">
              Data de Lançamento no RenPlay
            </label>
            <p className="mt-1 text-xs text-zinc-400">Data de publicação nesta plataforma.</p>
            <input
              id="pub-renplay-date"
              type="date"
              value={renplayPublishDate || ""}
              onChange={(e) => onUpdate("renplayPublishDate", e.target.value)}
              className={`${inputClass} mt-3 text-sm`}
            />
          </div>
        </div>

        {/* NOVIDADES DA VERSÃO (CHANGELOG) */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <label htmlFor="pub-release-notes" className="text-sm font-black text-white">
            Novidades da Versão (Notas de Atualização / Changelog)
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            Informe aos jogadores o que mudou nesta versão (novas rotas, correções de bugs, cenas adicionais, melhorias na tradução).
          </p>
          <textarea
            id="pub-release-notes"
            rows={4}
            value={releaseNotes || ""}
            onChange={(e) => onUpdate("releaseNotes", e.target.value)}
            className={`${inputClass} mt-3 text-sm leading-relaxed`}
            placeholder={"- Adicionado suporte completo à tradução PT-BR\n- Corrigido erro de transição no capítulo 3\n- Novos sprites em alta definição"}
          />
        </div>

        {/* GOVERNANÇA / PERMISSÕES */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="pub-resp-dev" className="text-sm font-black text-white">
              Desenvolvedor Responsável
            </label>
            <p className="mt-1 text-xs text-zinc-400">Usuário do sistema com permissão de gerenciar o jogo.</p>
            <input
              id="pub-resp-dev"
              type="text"
              value={responsibleDev || ""}
              onChange={(e) => onUpdate("responsibleDev", e.target.value)}
              className={`${inputClass} mt-3 text-sm`}
              placeholder="Username do desenvolvedor na plataforma"
            />
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="pub-perm" className="text-sm font-black text-white">
              Controle de Edição
            </label>
            <p className="mt-1 text-xs text-zinc-400">Quem pode fazer alterações futuras nos arquivos.</p>
            <select
              id="pub-perm"
              value={editPermissions || "admin_only"}
              onChange={(e) => onUpdate("editPermissions", e.target.value)}
              className={`${inputClass} mt-3 text-sm font-semibold`}
            >
              <option value="admin_only">Apenas Administradores</option>
              <option value="admin_and_dev">Administradores e Desenvolvedor Vinculado</option>
              <option value="moderators">Administradores e Moderadores</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
