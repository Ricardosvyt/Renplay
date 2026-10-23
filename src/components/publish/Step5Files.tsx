import React from "react";
import { Icon } from "../ui/Icon";
import { Field, SectionTitle, inputClass, panelClass } from "./FormControls";
import { SystemRequirements } from "./types";

interface Step3DownloadProps {
  version: string;
  platforms: string[];
  platformOptions: string[];
  downloadUrl: string;
  mainFileName: string;
  fileSize: string;
  sha256: string;
  systemRequirements: SystemRequirements;
  onTogglePlatform: (platform: string) => void;
  onUpdate: (field: string, value: string) => void;
  onUpdateRequirements: (reqField: keyof SystemRequirements, value: string) => void;
}

export function Step5Files({
  version,
  platforms,
  platformOptions,
  downloadUrl,
  mainFileName,
  fileSize,
  sha256,
  systemRequirements,
  onTogglePlatform,
  onUpdate,
  onUpdateRequirements
}: Step3DownloadProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 3: Download, Plataformas & Requisitos do Sistema"
        description="Configure a versão, arquivos de download para o Launcher e os requisitos de hardware recomendados para os jogadores."
      />

      <div className="space-y-6">
        {/* VERSÃO E PLATAFORMAS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">
              Plataformas Suportadas <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Selecione todos os sistemas operacionais para os quais existem instaladores ou compatibilidade.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {platformOptions.map((platform) => {
              const active = platforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => onTogglePlatform(platform)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-bold transition ${
                    active
                      ? "border-[#FFDE00] bg-[#FFDE00]/15 text-[#FFDE00] shadow-[0_0_12px_rgba(255,222,0,0.1)]"
                      : "border-[#29292F] bg-[#12141D] text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  <span>{platform}</span>
                  {active ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDE00] text-[10px] font-black text-black">✓</span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-zinc-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DADOS DO ARQUIVO DE DOWNLOAD */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <span className="text-sm font-black text-white">Pacote de Instalação & Links</span>
          <p className="mt-1 text-xs text-zinc-400">
            Informe a URL do arquivo compactado (.zip, .7z, .rar) ou instalador executável. O Launcher RenPlay baixa e verifica automaticamente.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="file-download-url" className="text-xs font-bold text-zinc-300">
                Link de Download Direto (HTTPS) <span className="text-[#FFDE00]">*</span>
              </label>
              <input
                id="file-download-url"
                required
                type="url"
                value={downloadUrl}
                onChange={(e) => onUpdate("downloadUrl", e.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder="https://pixeldrain.com/api/file/... ou https://storage.renplay.com/..."
              />
            </div>

            <div>
              <label htmlFor="file-version" className="text-xs font-bold text-zinc-300">
                Versão da Build / Jogo <span className="text-[#FFDE00]">*</span>
              </label>
              <input
                id="file-version"
                type="text"
                value={version}
                onChange={(e) => onUpdate("version", e.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder="Ex.: 1.0.0 ou 0.8.2-patch2"
              />
            </div>

            <div>
              <label htmlFor="file-size" className="text-xs font-bold text-zinc-300">
                Tamanho Estimado do Arquivo
              </label>
              <input
                id="file-size"
                type="text"
                value={fileSize}
                onChange={(e) => onUpdate("fileSize", e.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder="Ex.: 450 MB, 1.8 GB..."
              />
            </div>

            <div>
              <label htmlFor="file-main-name" className="text-xs font-bold text-zinc-300">
                Nome do Arquivo / Executável
              </label>
              <input
                id="file-main-name"
                type="text"
                value={mainFileName}
                onChange={(e) => onUpdate("mainFileName", e.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder="Ex.: Jogo-Windows-v1.0.zip ou Game.exe"
              />
            </div>

            <div>
              <label htmlFor="file-sha256" className="text-xs font-bold text-zinc-300">
                Hash SHA-256 (Opcional para integridade)
              </label>
              <input
                id="file-sha256"
                type="text"
                value={sha256 || ""}
                onChange={(e) => onUpdate("sha256", e.target.value)}
                className={`${inputClass} mt-1.5 font-mono text-xs`}
                placeholder="64 caracteres hexadecimais..."
              />
            </div>
          </div>
        </div>

        {/* REQUISITOS MÍNIMOS DE HARDWARE */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">Requisitos Mínimos do Sistema</span>
            <span className="rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Hardware</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Oriente os jogadores sobre as especificações de computador necessárias para rodar o jogo com fluidez.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="req-os" className="text-[11px] font-bold text-zinc-400">
                Sistema Operacional (SO)
              </label>
              <input
                id="req-os"
                type="text"
                value={systemRequirements?.os || ""}
                onChange={(e) => onUpdateRequirements("os", e.target.value)}
                className={`${inputClass} mt-1 text-xs`}
                placeholder="Windows 10/11 64-bit, Ubuntu 20.04..."
              />
            </div>

            <div>
              <label htmlFor="req-cpu" className="text-[11px] font-bold text-zinc-400">
                Processador (CPU)
              </label>
              <input
                id="req-cpu"
                type="text"
                value={systemRequirements?.cpu || ""}
                onChange={(e) => onUpdateRequirements("cpu", e.target.value)}
                className={`${inputClass} mt-1 text-xs`}
                placeholder="Intel Core i3 2.0 GHz ou AMD equivalente"
              />
            </div>

            <div>
              <label htmlFor="req-ram" className="text-[11px] font-bold text-zinc-400">
                Memória RAM
              </label>
              <input
                id="req-ram"
                type="text"
                value={systemRequirements?.ram || ""}
                onChange={(e) => onUpdateRequirements("ram", e.target.value)}
                className={`${inputClass} mt-1 text-xs`}
                placeholder="2 GB RAM (Recomendado: 4 GB)"
              />
            </div>

            <div>
              <label htmlFor="req-gpu" className="text-[11px] font-bold text-zinc-400">
                Placa de Vídeo (GPU)
              </label>
              <input
                id="req-gpu"
                type="text"
                value={systemRequirements?.gpu || ""}
                onChange={(e) => onUpdateRequirements("gpu", e.target.value)}
                className={`${inputClass} mt-1 text-xs`}
                placeholder="Compatível com DirectX 11 / OpenGL 2.0"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="req-storage" className="text-[11px] font-bold text-zinc-400">
                Armazenamento em Disco
              </label>
              <input
                id="req-storage"
                type="text"
                value={systemRequirements?.storage || ""}
                onChange={(e) => onUpdateRequirements("storage", e.target.value)}
                className={`${inputClass} mt-1 text-xs`}
                placeholder="1.5 GB de espaço livre disponível"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
