import React from "react";
import { Field, TextArea, SectionTitle, StatusButton, inputClass, panelClass } from "./FormControls";
import { Status } from "./types";

export interface ReadinessItem {
  label: string;
  ready: boolean;
  detail: string;
}

interface Step6LaunchProps {
  readiness: ReadinessItem[];
  completedCount: number;
  progressPercent: number;
  status: Status;
  responsibleDev: string;
  responsibleTranslator: string;
  editPermissions: string;
  scheduledPublishDate: string;
  changeLog: string;
  onUpdate: (field: string, value: string) => void;
}

export function Step6Launch({
  readiness,
  completedCount,
  progressPercent,
  status,
  responsibleDev,
  responsibleTranslator,
  editPermissions,
  scheduledPublishDate,
  changeLog,
  onUpdate
}: Step6LaunchProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 6: Publicação & Revisão Final"
        description="Confira o checklist de prontidão, defina o status do jogo e finalize a publicação."
      />
      <div className="space-y-6">
        {/* Checklist de Prontidão */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between border-b border-[#29292F] pb-3">
            <span className="text-sm font-black text-white">Checklist de Prontidão</span>
            <span className="text-xs font-bold text-[#FFDE00]">
              {completedCount} de {readiness.length} completos ({progressPercent}%)
            </span>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {readiness.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                  item.ready
                    ? "border-emerald-500/20 bg-emerald-500/5 text-zinc-300"
                    : "border-zinc-800 bg-zinc-950/50 text-zinc-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={item.ready ? "text-emerald-400" : "text-zinc-600"}>
                    {item.ready ? "✓" : "○"}
                  </span>
                  <span className={item.ready ? "font-bold text-white" : ""}>{item.label}</span>
                </div>
                <span className="truncate text-[10px] text-zinc-400">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status de Publicação */}
        <div>
          <p className="text-xs font-bold text-zinc-400">Status de publicação</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <StatusButton
              active={status === "DRAFT"}
              title="Rascunho"
              description="Salvo com segurança; visível apenas para você e equipe"
              onClick={() => onUpdate("status", "DRAFT")}
            />
            <StatusButton
              active={status === "PUBLISHED"}
              title="Publicado"
              description="Disponibilizado imediatamente na vitrine e no Launcher"
              onClick={() => onUpdate("status", "PUBLISHED")}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Responsável pelo desenvolvimento"
            value={responsibleDev}
            onChange={(e) => onUpdate("responsibleDev", e.target.value)}
            placeholder="Nome do responsável"
          />
          <Field
            label="Responsável pela tradução"
            value={responsibleTranslator}
            onChange={(e) => onUpdate("responsibleTranslator", e.target.value)}
            placeholder="Nome do tradutor"
          />
        </div>

        <label className="block text-xs font-bold text-zinc-400">
          Permissões de edição
          <select
            value={editPermissions}
            onChange={(e) => onUpdate("editPermissions", e.target.value)}
            className={inputClass}
          >
            <option value="admin_only">Apenas administradores</option>
            <option value="dev_trans">Desenvolvedor e tradutor responsáveis</option>
            <option value="all_team">Toda a equipe</option>
          </select>
        </label>

        <Field
          label="Data de publicação agendada"
          type="datetime-local"
          value={scheduledPublishDate}
          onChange={(e) => onUpdate("scheduledPublishDate", e.target.value)}
        />

        <TextArea
          label="Changelog da versão"
          rows={5}
          value={changeLog}
          onChange={(e) => onUpdate("changeLog", e.target.value)}
          placeholder="Correções, novos capítulos, melhorias e novidades desta versão..."
        />
      </div>
    </section>
  );
}
