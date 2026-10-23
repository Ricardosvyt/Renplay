import React from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, inputClass, panelClass } from "./FormControls";
import { ImageInputMode } from "./types";

interface Step1IdentityProps {
  name: string;
  horizontalBanner: string;
  gameIcon: string;
  githubUrl: string;
  bannerMode: ImageInputMode;
  profileMode: ImageInputMode;
  isGithubValid: boolean;
  onUpdate: (field: string, value: string) => void;
  onSetBannerMode: (mode: ImageInputMode) => void;
  onSetProfileMode: (mode: ImageInputMode) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "horizontalBanner" | "gameIcon" | "mainCover") => void;
}

export function Step1Identity({
  name,
  horizontalBanner,
  gameIcon,
  githubUrl,
  bannerMode,
  profileMode,
  isGithubValid,
  onUpdate,
  onSetBannerMode,
  onSetProfileMode,
  onFileUpload
}: Step1IdentityProps) {
  return (
    <section className={panelClass}>
      <SectionTitle
        title="Categoria 1: Identidade Visual & GitHub"
        description="Esta é a marca principal da sua Visual Novel. O Nome, o Banner e o Perfil são os primeiros elementos vistos pelos jogadores."
      />

      <div className="space-y-6">
        {/* CAMPO: NOME DO JOGO */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="game-name" className="text-sm font-black text-white">
              Nome do jogo <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Título oficial que aparecerá nos destaques da vitrine, no cabeçalho e na busca do Launcher.
          </p>
          <input
            id="game-name"
            required
            type="text"
            value={name}
            onChange={(e) => onUpdate("name", e.target.value)}
            className={`${inputClass} mt-3 text-base font-semibold`}
            placeholder="Ex.: Tokyo Memories, Noite em Kyoto, Memórias de Verão..."
          />
        </div>

        {/* CAMPO: BANNER HORIZONTAL */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-black text-white">Banner Horizontal da Vitrine</span>
              <span className="ml-2 rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Hero & Carrossel</span>
            </div>
            {/* Alternador URL / Upload */}
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

          <div className="mt-2 rounded-xl bg-[#141620] p-3 text-xs text-zinc-400">
            <p className="leading-relaxed">
              <strong className="text-white">Onde é exibido:</strong> É a imagem panorâmica principal no topo da página do jogo no site e no grande carrossel animado da tela inicial do RenPlay Launcher.
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              💡 <strong className="text-zinc-300">Resolução recomendada:</strong> 1920 × 1080 px ou 16:9 widescreen (PNG, WEBP ou JPG de alta definição).
            </p>
          </div>

          {bannerMode === "url" ? (
            <div className="mt-3">
              <input
                type="url"
                value={horizontalBanner}
                onChange={(e) => onUpdate("horizontalBanner", e.target.value)}
                className={inputClass}
                placeholder="Cole o link da imagem (ex.: https://i.imgur.com/.../banner.png)"
              />
            </div>
          ) : (
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-5 text-center transition hover:border-[#FFDE00]/60">
                <Icon name="upload" className="h-6 w-6 text-[#FFDE00]" />
                <span className="mt-2 text-xs font-bold text-white">Clique para escolher a imagem do Banner</span>
                <span className="mt-1 text-[11px] text-zinc-500">PNG, WEBP ou JPG até 5 MB</span>
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
            <div className="relative mt-3 overflow-hidden rounded-xl border border-[#29292F] bg-black">
              <div className="aspect-[16/7] w-full">
                <img
                  src={horizontalBanner}
                  alt="Pré-visualização do Banner"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onUpdate("horizontalBanner", "")}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/75 px-2.5 py-1 text-[11px] font-bold text-red-400 backdrop-blur-md hover:bg-red-500/20 hover:text-red-300"
              >
                <Icon name="trash" className="h-3 w-3" /> Remover
              </button>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                ✓ Banner carregado
              </span>
            </div>
          )}
        </div>

        {/* CAMPO: PERFIL DO GAME */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-black text-white">Perfil do Game (Ícone / Avatar)</span>
              <span className="ml-2 rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Avatar Oficial</span>
            </div>
            <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onSetProfileMode("url")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  profileMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="link" className="h-3 w-3" /> Link / URL
              </button>
              <button
                type="button"
                onClick={() => onSetProfileMode("upload")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                  profileMode === "upload" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon name="upload" className="h-3 w-3" /> Enviar Imagem
              </button>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-[#141620] p-3 text-xs text-zinc-400">
            <p className="leading-relaxed">
              <strong className="text-white">Onde é exibido:</strong> É a foto de perfil/identidade do jogo. Ela aparece na lista rápida da barra lateral do Launcher, nas notificações, nos resultados de busca e como selo de apresentação.
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              💡 <strong className="text-zinc-300">Resolução recomendada:</strong> 512 × 512 px formato 1:1 quadrado (PNG com transparência ou WEBP/JPG).
            </p>
          </div>

          {profileMode === "url" ? (
            <div className="mt-3">
              <input
                type="url"
                value={gameIcon}
                onChange={(e) => onUpdate("gameIcon", e.target.value)}
                className={inputClass}
                placeholder="Cole o link do ícone/perfil (ex.: https://i.imgur.com/.../icone.png)"
              />
            </div>
          ) : (
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#343744] bg-[#090A0F] p-5 text-center transition hover:border-[#FFDE00]/60">
                <Icon name="upload" className="h-6 w-6 text-emerald-400" />
                <span className="mt-2 text-xs font-bold text-white">Clique para escolher a imagem de Perfil</span>
                <span className="mt-1 text-[11px] text-zinc-500">Quadrada (1:1), PNG ou WEBP até 5 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, "gameIcon")}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {gameIcon && (
            <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#29292F] bg-black p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFDE00]/80 bg-[#12141D]">
                <img
                  src={gameIcon}
                  alt="Pré-visualização do Perfil"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white">Perfil do Jogo Carregado</p>
                <p className="truncate text-[11px] text-zinc-400">Exibição perfeita em proporção 1:1</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate("gameIcon", "")}
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
              >
                <Icon name="trash" className="h-3.5 w-3.5" /> Remover
              </button>
            </div>
          )}
        </div>

        {/* CAMPO: REPOSITÓRIO GITHUB */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="game-github" className="flex items-center gap-2 text-sm font-black text-white">
              <Icon name="github" className="h-4 w-4 text-white" />
              Repositório ou Projeto no GitHub
            </label>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">Open Source / Código</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Vincule o repositório público do seu jogo no GitHub. Permite que jogadores e desenvolvedores acompanhem o código, releases e relatem sugestões e bugs.
          </p>
          <div className="relative mt-3">
            <input
              id="game-github"
              type="url"
              value={githubUrl}
              onChange={(e) => onUpdate("githubUrl", e.target.value)}
              className={`${inputClass} pr-24`}
              placeholder="https://github.com/usuario/meu-jogo-renpy"
            />
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-5 right-3 flex items-center gap-1 text-[11px] font-bold text-[#FFDE00] hover:underline"
              >
                Testar link <Icon name="external" className="h-3 w-3" />
              </a>
            )}
          </div>
          {githubUrl && (
            <div className="mt-2 flex items-center gap-2">
              {isGithubValid ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Icon name="check" className="h-3 w-3" /> Link válido do GitHub
                </span>
              ) : (
                <span className="text-[11px] text-amber-400">
                  ⚠️ Insira a URL completa (exemplo: https://github.com/seu-usuario/seu-jogo)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
