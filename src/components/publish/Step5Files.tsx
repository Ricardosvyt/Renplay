import React from "react";
import { Field, SectionTitle, panelClass } from "./FormControls";

interface Step5FilesProps {
  downloadUrl: string;
  mainFileName: string;
  fileSize: string;
  fileVersion: string;
  platforms: string[];
  platformOptions: string[];
  onTogglePlatform: (platform: string) => void;
  onUpdate: (field: string, value: string) => void;
}

export function Step5Files({
  downloadUrl,
  mainFileName,
  fileSize,
  fileVersion,
  platforms,
  platformOptions,
  onTogglePlatform,
  onUpdate
}: Step5FilesProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 5: Arquivos & Download"
        description="Configure os links de download e os sistemas operacionais suportados para os jogadores baixarem a visual novel."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="URL do download (Pixeldrain, Drive ou direto) *"
          type="url"
          value={downloadUrl}
          onChange={(e) => onUpdate("downloadUrl", e.target.value)}
          placeholder="https://pixeldrain.com/u/... ou https://.../jogo.zip"
          wide
        />
        <Field
          label="Nome do arquivo"
          value={mainFileName}
          onChange={(e) => onUpdate("mainFileName", e.target.value)}
          placeholder="MeuJogo_v1.0.0.zip"
        />
        <Field
          label="Tamanho aproximado do arquivo"
          value={fileSize}
          onChange={(e) => onUpdate("fileSize", e.target.value)}
          placeholder="Ex.: 450 MB ou 1.2 GB"
        />
        <Field
          label="Versão do arquivo"
          value={fileVersion}
          onChange={(e) => onUpdate("fileVersion", e.target.value)}
        />
        <div className="sm:col-span-2">
          <p className="text-xs font-bold text-zinc-400">Plataformas suportadas</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {platformOptions.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => onTogglePlatform(platform)}
                className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${
                  platforms.includes(platform)
                    ? "border-[#FFDE00]/60 bg-[#FFDE00]/10 text-[#FFDE00]"
                    : "border-[#29292F] bg-[#090A0F] text-zinc-500 hover:text-white"
                }`}
              >
                {platforms.includes(platform) && "✓ "}
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
