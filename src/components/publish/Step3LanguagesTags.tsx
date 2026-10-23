import React from "react";
import { ChipEditor, SectionTitle, inputClass, panelClass } from "./FormControls";

interface Step4LanguagesProps {
  languages: string[];
  setLanguages: (languages: string[]) => void;
  languageInput: string;
  setLanguageInput: (val: string) => void;
  onAddLanguage: (textToAdd?: string) => void;
  translationStatus: string;
  translatedBy: string;
  translationNotes: string;
  onUpdate: (field: string, value: string) => void;
}

const translationStatusOptions = [
  { value: "Completa", label: "Tradução Completa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", desc: "100% dos textos, menus e diálogos em português" },
  { value: "Parcial", label: "Tradução Parcial", color: "bg-amber-500/20 text-amber-400 border-amber-500/40", desc: "Rotas principais ou capítulos iniciais traduzidos" },
  { value: "Em andamento", label: "Em Andamento", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40", desc: "Equipe trabalhando ativamente no patch" },
  { value: "Inexistente", label: "Sem Tradução (Original)", color: "bg-zinc-800 text-zinc-400 border-zinc-700", desc: "Jogo disponível apenas em seus idiomas originais" }
];

export function Step3LanguagesTags({
  languages,
  setLanguages,
  languageInput,
  setLanguageInput,
  onAddLanguage,
  translationStatus,
  translatedBy,
  translationNotes,
  onUpdate
}: Step4LanguagesProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 4: Idiomas & Status de Tradução"
        description="Indique os idiomas de áudio/texto e especifique o estado da localização em português para a comunidade brasileira."
      />

      <div className="space-y-6">
        {/* STATUS DA TRADUÇÃO PT-BR */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">
              Status da Tradução para Português (Brasil) <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Comunidade PT-BR</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Informa com clareza aos jogadores se a obra já pode ser aproveitada totalmente em português.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {translationStatusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("translationStatus", opt.value)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  (translationStatus || "Completa") === opt.value
                    ? "border-[#FFDE00] bg-[#FFDE00]/15 ring-2 ring-[#FFDE00]/40"
                    : "border-[#29292F] bg-[#12141D] hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-black uppercase tracking-wider ${opt.color}`}>
                    {opt.label}
                  </span>
                  {(translationStatus || "Completa") === opt.value && (
                    <span className="text-xs font-black text-[#FFDE00]">Selecionado</span>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* TRADUTOR RESPONSÁVEL E NOTAS */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="trans-author" className="text-sm font-black text-white">
                Tradutor ou Equipe Responsável
              </label>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">Créditos</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Nome ou grupo que realizou a tradução e adaptação.
            </p>
            <input
              id="trans-author"
              type="text"
              value={translatedBy}
              onChange={(e) => onUpdate("translatedBy", e.target.value)}
              className={`${inputClass} mt-3 text-sm`}
              placeholder="Ex.: Equipe RenPlay Brasil, João Traduções..."
            />
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="trans-notes" className="text-sm font-black text-white">
              Observações / Notas da Tradução
            </label>
            <p className="mt-1 text-xs text-zinc-400">
              Avisos especiais sobre termos adaptados ou instruções.
            </p>
            <input
              id="trans-notes"
              type="text"
              value={translationNotes || ""}
              onChange={(e) => onUpdate("translationNotes", e.target.value)}
              className={`${inputClass} mt-3 text-sm`}
              placeholder="Ex.: Patch compatível com a versão v1.2 do jogo original"
            />
          </div>
        </div>

        {/* LISTA DE IDIOMAS DISPONÍVEIS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <ChipEditor
            title="Todos os Idiomas Disponíveis no Jogo"
            values={languages}
            setValues={setLanguages}
            input={languageInput}
            setInput={setLanguageInput}
            add={onAddLanguage}
            placeholder="Ex.: Português (Brasil), Inglês, Japonês, Espanhol..."
          />
        </div>
      </div>
    </section>
  );
}
