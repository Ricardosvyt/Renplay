import React from "react";
import { Icon } from "../ui/Icon";
import { TextArea, SectionTitle, inputClass, panelClass } from "./FormControls";
import { ImageInputMode } from "./types";

interface Step4GalleryProps {
  mainCover: string;
  coverMode: ImageInputMode;
  screenshots: string;
  onSetCoverMode: (mode: ImageInputMode) => void;
  onUpdate: (field: string, value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "horizontalBanner" | "gameIcon" | "mainCover") => void;
}

export function Step4Gallery({
  mainCover,
  coverMode,
  screenshots,
  onSetCoverMode,
  onUpdate,
  onFileUpload
}: Step4GalleryProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 4: Galeria de Fotos e Capa Pôster"
        description="Configure o pôster vertical de cinema para a grade de jogos e inclua capturas de tela das cenas."
      />
      <div className="space-y-6">
        {/* Lembrete dos elementos já configurados na etapa 1 */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-black text-emerald-400">
            <Icon name="check" className="h-4 w-4" />
            Banner e Perfil configurados na Categoria 1
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            O Banner da vitrine e a foto de Perfil já foram definidos. Aqui você define a capa pôster vertical clássica e as capturas da galeria.
          </p>
        </div>

        {/* Capa Pôster com Upload ou URL */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-black text-white">Capa Principal (Pôster Vertical 3:4)</span>
              <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">Vitrine Clássica</span>
            </div>
            <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onSetCoverMode("url")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  coverMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="link" className="h-3 w-3" /> Link / URL
              </button>
              <button
                type="button"
                onClick={() => onSetCoverMode("upload")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  coverMode === "upload" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="upload" className="h-3 w-3" /> Enviar Imagem
              </button>
            </div>
          </div>

          {coverMode === "url" ? (
            <div className="mt-3">
              <input
                type="url"
                value={mainCover}
                onChange={(e) => onUpdate("mainCover", e.target.value)}
                className={inputClass}
                placeholder="https://.../capa-vertical.jpg"
              />
            </div>
          ) : (
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-5 text-center transition hover:border-[#FFDE00]/60">
                <Icon name="upload" className="h-6 w-6 text-[#FFDE00]" />
                <span className="mt-2 text-xs font-bold text-white">Clique para escolher a Capa Pôster</span>
                <span className="mt-1 text-[11px] text-zinc-500">Proporção 3:4 vertical até 5 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "mainCover")}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Screenshots */}
        <TextArea
          label="Screenshots da Galeria (uma URL por linha)"
          rows={6}
          value={screenshots}
          onChange={(e) => onUpdate("screenshots", e.target.value)}
          placeholder={"https://.../screenshot-01.jpg\nhttps://.../screenshot-02.jpg\nhttps://.../screenshot-03.jpg"}
          wide
        />
      </div>
    </section>
  );
}
