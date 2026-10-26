import React, { useState } from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, inputClass, panelClass } from "./FormControls";
import { SystemRequirements, DownloadMirror } from "./types";

interface Step3DownloadProps {
  version: string;
  platforms: string[];
  platformOptions: string[];
  downloadUrl: string;
  androidGameUrl: string;
  androidSha256: string;
  downloadMirrors: DownloadMirror[];
  mainFileName: string;
  fileSize: string;
  sha256: string;
  systemRequirements: SystemRequirements;
  onTogglePlatform: (platform: string) => void;
  onUpdate: (field: string, value: string) => void;
  onUpdateRequirements: (reqField: keyof SystemRequirements, value: string) => void;
  onAddMirror: (mirror: DownloadMirror) => void;
  onRemoveMirror: (id: string) => void;
}

export function detectDownloadProvider(url: string): { name: string; color: string; icon: string } {
  if (!url) return { name: "Link Direto", color: "bg-zinc-800 text-zinc-300 border-zinc-700", icon: "link" };
  const lower = url.toLowerCase();
  if (lower.includes("bzzhr.to") || lower.includes("buzzheavier.com")) {
    return { name: "Buzzheavier", color: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: "download" };
  }
  if (lower.includes("datanodes.to")) {
    return { name: "Datanodes", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", icon: "download" };
  }
  if (lower.includes("mega.nz") || lower.includes("mega.co.nz")) {
    return { name: "Mega.nz", color: "bg-red-500/15 text-red-300 border-red-500/30", icon: "download" };
  }
  if (lower.includes("pixeldrain.com")) {
    return { name: "Pixeldrain", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: "download" };
  }
  if (lower.includes("workupload.com")) {
    return { name: "Workupload", color: "bg-blue-500/15 text-blue-300 border-blue-500/30", icon: "download" };
  }
  if (lower.includes("drive.google.com")) {
    return { name: "Google Drive", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", icon: "download" };
  }
  return { name: "Servidor HTTPS", color: "bg-purple-500/15 text-purple-300 border-purple-500/30", icon: "link" };
}

export function Step5Files({
  version,
  platforms,
  platformOptions,
  downloadUrl,
  androidGameUrl,
  androidSha256,
  downloadMirrors,
  mainFileName,
  fileSize,
  sha256,
  systemRequirements,
  onTogglePlatform,
  onUpdate,
  onUpdateRequirements,
  onAddMirror,
  onRemoveMirror
}: Step3DownloadProps) {
  const [newMirrorUrl, setNewMirrorUrl] = useState("");
  const [newMirrorName, setNewMirrorName] = useState("");

  const handleAddMirrorClick = () => {
    if (!newMirrorUrl.trim()) return;
    const providerInfo = detectDownloadProvider(newMirrorUrl.trim());
    const newMirror: DownloadMirror = {
      id: `mirror-${Date.now().toString(36)}`,
      name: newMirrorName.trim() || `Espelho ${downloadMirrors.length + 1} (${providerInfo.name})`,
      url: newMirrorUrl.trim(),
      provider: providerInfo.name,
      priority: downloadMirrors.length + 2,
      status: "Ativo"
    };
    onAddMirror(newMirror);
    setNewMirrorUrl("");
    setNewMirrorName("");
  };

  const primaryProvider = detectDownloadProvider(downloadUrl);

  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 3: Download, Redundância & Requisitos do Sistema"
        description="Configure os links de download com redundância (failover automático), sistemas operacionais suportados e especificações técnicas de hardware."
      />

      <div className="space-y-6">
        {/* PLATAFORMAS SUPORTADAS */}
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

        {/* PROVEDORES DE DOWNLOAD SUPORTADOS */}
        <div className="rounded-2xl border border-[#FFDE00]/30 bg-[#FFDE00]/5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" className="h-5 w-5 text-[#FFDE00]" />
            <span className="text-sm font-black text-white">Hospedagens e Espelhos Aceitos com Failover Automático</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            O Launcher e o site aceitam e alternam automaticamente entre estes servidores de download caso um link fique offline:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              ✓ Pixeldrain <code className="text-[10px] text-zinc-400">pixeldrain.com</code>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              ✓ Buzzheavier <code className="text-[10px] text-zinc-400">bzzhr.to</code>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
              ✓ Datanodes <code className="text-[10px] text-zinc-400">datanodes.to</code>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
              ✓ Workupload <code className="text-[10px] text-zinc-400">workupload.com</code>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
              ✓ Mega <code className="text-[10px] text-zinc-400">mega.nz</code>
            </span>
          </div>
        </div>

        {/* LINK PRINCIPAL DE DOWNLOAD */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <label htmlFor="file-download-url" className="text-sm font-black text-white">
              Link de Download Principal (Servidor 1) <span className="text-[#FFDE00]">*</span>
            </label>
            {downloadUrl && (
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${primaryProvider.color}`}>
                Provedor Detectado: {primaryProvider.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Primeiro link utilizado para instalação. Se este link falhar ou cair, o sistema recorrerá aos espelhos cadastrados abaixo.
          </p>

          <input
            id="file-download-url"
            required
            type="url"
            value={downloadUrl}
            onChange={(e) => onUpdate("downloadUrl", e.target.value)}
            className={`${inputClass} mt-3 text-sm`}
            placeholder="https://pixeldrain.com/u/... ou https://bzzhr.to/... ou https://datanodes.to/..."
          />
        </div>

        {/* ESPELHOS DE DOWNLOAD (FAILOVER / REDUNDÂNCIA) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <label htmlFor="android-game-url" className="text-sm font-black text-white">ZIP da pasta game para Android</label>
          <p className="mt-1 text-xs text-zinc-400">Link HTTPS direto para um ZIP que contenha a pasta game. O app Android baixa e extrai somente essa pasta. Deixe vazio para jogos publicados apenas para PC.</p>
          <input id="android-game-url" type="url" value={androidGameUrl} onChange={(e) => onUpdate("androidGameUrl", e.target.value)} className={`${inputClass} mt-3 text-sm`} placeholder="https://servidor.exemplo/jogo-android.zip" />
          <label htmlFor="android-sha256" className="mt-4 block text-xs font-bold text-zinc-300">SHA-256 do ZIP Android (recomendado)</label>
          <input id="android-sha256" type="text" value={androidSha256} onChange={(e) => onUpdate("androidSha256", e.target.value)} className={`${inputClass} mt-2 font-mono text-xs`} placeholder="64 caracteres hexadecimais" />
        </div>

        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">Espelhos de Download Adicionais (Redundância)</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
              {downloadMirrors.length} configurado{downloadMirrors.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Adicione links alternativos (ex.: Pixeldrain + Buzzheavier + Datanodes + Mega). Se um servidor falhar, o Launcher tenta automaticamente o próximo da lista.
          </p>

          {/* Lista de espelhos cadastrados */}
          {downloadMirrors.length > 0 && (
            <div className="mt-4 space-y-2">
              {downloadMirrors.map((mirror, index) => {
                const info = detectDownloadProvider(mirror.url);
                return (
                  <div
                    key={mirror.id || index}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-[#29292F] bg-[#12141D] p-3 text-xs sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{mirror.name}</span>
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${info.color}`}>
                          {info.name}
                        </span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-400">
                          Prioridade #{index + 2}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">{mirror.url}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveMirror(mirror.id)}
                      className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                    >
                      Remover espelho
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Adicionar novo espelho */}
          <div className="mt-4 rounded-xl border border-dashed border-[#29292F] p-3.5 bg-[#090A0F]">
            <span className="text-xs font-bold text-zinc-300">Adicionar Novo Link de Espelho</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_200px_auto]">
              <input
                type="url"
                value={newMirrorUrl}
                onChange={(e) => setNewMirrorUrl(e.target.value)}
                placeholder="https://bzzhr.to/... ou https://mega.nz/... ou https://workupload.com/..."
                className={`${inputClass} text-xs`}
              />
              <input
                type="text"
                value={newMirrorName}
                onChange={(e) => setNewMirrorName(e.target.value)}
                placeholder="Rótulo (opcional)"
                className={`${inputClass} text-xs`}
              />
              <button
                type="button"
                onClick={handleAddMirrorClick}
                disabled={!newMirrorUrl.trim()}
                className="shrink-0 rounded-xl bg-[#FFDE00] px-4 py-2.5 text-xs font-black text-black hover:bg-[#ffe84d] disabled:opacity-40 cursor-pointer"
              >
                + Adicionar Espelho
              </button>
            </div>
          </div>
        </div>

        {/* METADADOS DO ARQUIVO: VERSÃO, TAMANHO, NOME E SHA-256 */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <span className="text-sm font-black text-white">Metadados da Build e Arquivo</span>
          <p className="mt-1 text-xs text-zinc-400">
            Informações sobre o pacote que será baixado pelos jogadores.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
