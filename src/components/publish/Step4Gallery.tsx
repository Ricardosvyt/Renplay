import React from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, inputClass, panelClass } from "./FormControls";
import { ImageInputMode } from "./types";

interface Step2MediaProps {
  gameIcon: string;
  horizontalBanner: string;
  mainCover: string;
  trailerUrl: string;
  screenshots: string;
  bannerMode: ImageInputMode;
  profileMode: ImageInputMode;
  coverMode: ImageInputMode;
  onSetBannerMode: (mode: ImageInputMode) => void;
  onSetProfileMode: (mode: ImageInputMode) => void;
  onSetCoverMode: (mode: ImageInputMode) => void;
  onUpdate: (field: string, value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "horizontalBanner" | "gameIcon" | "mainCover") => void;
}

export function Step4Gallery({
  gameIcon,
  horizontalBanner,
  mainCover,
  trailerUrl,
  screenshots,
  bannerMode,
  profileMode,
  coverMode,
  onSetBannerMode,
  onSetProfileMode,
  onSetCoverMode,
  onUpdate,
  onFileUpload
}: Step2MediaProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 2: Imagens, Mídia e Trailer"
        description="Apresentação visual completa para o site e o Launcher: ícone do aplicativo, banner panorâmico, capa vertical pôster, galeria de cenas e trailer."
      />

      <div className="space-y-6">
        {/* BANNER HORIZONTAL HERO (16:9) */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-black text-white">Banner Horizontal da Vitrine (Hero 16:9)</span>
              <span className="ml-2 rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Destaque & Carrossel</span>
            </div>
            <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onSetBannerMode("url")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  bannerMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="link" className="h-3 w-3" /> Link / URL
              </button>
              <button
                type="button"
                onClick={() => onSetBannerMode("upload")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  bannerMode === "upload" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="upload" className="h-3 w-3" /> Enviar Imagem
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Imagem panorâmica principal exibida no topo do site e no carrossel de lançamento do RenPlay Launcher (Recomendado: 1920 × 1080 px).
          </p>

          {bannerMode === "url" ? (
            <div className="mt-3">
              <input
                type="url"
                value={horizontalBanner}
                onChange={(e) => onUpdate("horizontalBanner", e.target.value)}
                className={inputClass}
                placeholder="https://.../banner-hero-1920x1080.webp"
              />
            </div>
          ) : (
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-5 text-center transition hover:border-[#FFDE00]/60">
                <Icon name="upload" className="h-6 w-6 text-[#FFDE00]" />
                <span className="mt-2 text-xs font-bold text-white">Clique para escolher o Banner Hero</span>
                <span className="mt-1 text-[11px] text-zinc-500">Formato panorâmico 16:9 até 5 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "horizontalBanner")}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {horizontalBanner && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#29292F]">
              <img src={horizontalBanner} alt="Preview Banner" className="h-36 w-full object-cover" />
            </div>
          )}
        </div>

        {/* ÍCONE DO JOGO (1:1) E CAPA PÔSTER VERTICAL (3:4) */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Ícone / Perfil Quadrado */}
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-sm font-black text-white">Ícone do Jogo (1:1)</span>
                <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">Avatar / App</span>
              </div>
              <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => onSetProfileMode("url")}
                  className={`px-2 py-1 transition ${profileMode === "url" ? "rounded bg-[#FFDE00] text-black" : "text-zinc-400"}`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => onSetProfileMode("upload")}
                  className={`px-2 py-1 transition ${profileMode === "upload" ? "rounded bg-[#FFDE00] text-black" : "text-zinc-400"}`}
                >
                  Upload
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Ícone para lista da biblioteca, atalhos e miniaturas (512 × 512 px).</p>

            {profileMode === "url" ? (
              <input
                type="url"
                value={gameIcon}
                onChange={(e) => onUpdate("gameIcon", e.target.value)}
                className={`${inputClass} mt-3 text-xs`}
                placeholder="https://.../icone-512x512.png"
              />
            ) : (
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-4 text-center">
                <Icon name="upload" className="h-5 w-5 text-[#FFDE00]" />
                <span className="mt-1 text-xs font-bold text-white">Upload do Ícone</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "gameIcon")}
                  className="hidden"
                />
              </label>
            )}

            {gameIcon && (
              <div className="mt-3 flex items-center gap-3">
                <img src={gameIcon} alt="Preview Ícone" className="h-16 w-16 rounded-xl border border-[#29292F] object-cover" />
                <span className="text-xs text-zinc-400">Pré-visualização do ícone</span>
              </div>
            )}
          </div>

          {/* Capa Pôster Vertical */}
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-sm font-black text-white">Capa Pôster (Vertical 3:4)</span>
                <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">Grade da Loja</span>
              </div>
              <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => onSetCoverMode("url")}
                  className={`px-2 py-1 transition ${coverMode === "url" ? "rounded bg-[#FFDE00] text-black" : "text-zinc-400"}`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => onSetCoverMode("upload")}
                  className={`px-2 py-1 transition ${coverMode === "upload" ? "rounded bg-[#FFDE00] text-black" : "text-zinc-400"}`}
                >
                  Upload
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Capa estilo cinema/Steam para os cards principais da vitrine (600 × 800 px).</p>

            {coverMode === "url" ? (
              <input
                type="url"
                value={mainCover}
                onChange={(e) => onUpdate("mainCover", e.target.value)}
                className={`${inputClass} mt-3 text-xs`}
                placeholder="https://.../poster-vertical.jpg"
              />
            ) : (
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-4 text-center">
                <Icon name="upload" className="h-5 w-5 text-[#FFDE00]" />
                <span className="mt-1 text-xs font-bold text-white">Upload da Capa Pôster</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "mainCover")}
                  className="hidden"
                />
              </label>
            )}

            {mainCover && (
              <div className="mt-3 flex items-center gap-3">
                <img src={mainCover} alt="Preview Capa" className="h-16 w-12 rounded-lg border border-[#29292F] object-cover" />
                <span className="text-xs text-zinc-400">Pré-visualização do pôster</span>
              </div>
            )}
          </div>
        </div>

        {/* GALERIA DE SCREENSHOTS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <label htmlFor="game-screenshots" className="text-sm font-black text-white">
            Galeria de Screenshots (uma URL por linha)
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            Adicione links diretos para capturas de tela do jogo que ilustrem cenas, personagens e diálogos.
          </p>
          <textarea
            id="game-screenshots"
            rows={4}
            value={screenshots}
            onChange={(e) => onUpdate("screenshots", e.target.value)}
            className={`${inputClass} mt-3 text-xs font-mono`}
            placeholder={"https://exemplo.com/cena-01.webp\nhttps://exemplo.com/cena-02.webp\nhttps://exemplo.com/cena-03.webp"}
          />
        </div>

        {/* TRAILER EM VÍDEO */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="game-trailer" className="text-sm font-black text-white">
              Trailer em Vídeo
            </label>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">Opcional</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Link do YouTube, Vimeo ou vídeo MP4.</p>
          <input
            id="game-trailer"
            type="url"
            value={trailerUrl || ""}
            onChange={(e) => onUpdate("trailerUrl", e.target.value)}
            className={`${inputClass} mt-3 text-sm`}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      </div>
    </section>
  );
}
