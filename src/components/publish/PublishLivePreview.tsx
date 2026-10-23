import React from "react";
import { Icon } from "../ui/Icon";
import { panelClass } from "./FormControls";
import { Status } from "./types";

interface PublishLivePreviewProps {
  name: string;
  developer: string;
  genre: string;
  engine: string;
  classification: string;
  version: string;
  fileSize: string;
  platforms: string[];
  languages: string[];
  translationStatus: string;
  tags: string[];
  status: Status;
  shortDescription: string;
  horizontalBanner: string;
  gameIcon: string;
  mainCover: string;
  screenshots: string[];
}

export function PublishLivePreview({
  name,
  developer,
  genre,
  engine,
  classification,
  version,
  fileSize,
  platforms,
  languages,
  translationStatus,
  tags,
  status,
  shortDescription,
  horizontalBanner,
  gameIcon,
  mainCover,
  screenshots
}: PublishLivePreviewProps) {
  const fallbackCover = "/game-cover-default.jpg";
  const displayAvatar = gameIcon || mainCover || fallbackCover;

  const classificationColor =
    classification === "Livre" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
    classification === "12" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
    classification === "14" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
    classification === "16" ? "bg-red-500/20 text-red-400 border-red-500/30" :
    "bg-purple-500/20 text-purple-400 border-purple-500/30";

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className={panelClass}>
        <div className="mb-4 flex items-center justify-between border-b border-[#29292F] pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFDE00]">Pré-visualização</p>
            <h2 className="mt-1 text-sm font-black text-white">Vitrine do RenPlay</h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Ao vivo
          </span>
        </div>

        {/* Card do Jogo */}
        <div className="overflow-hidden rounded-2xl border border-[#29292F] bg-[#090A0F]">
          {/* Banner com gradiente */}
          <div className="relative aspect-video bg-zinc-950">
            {horizontalBanner ? (
              <img
                src={horizontalBanner}
                alt="Banner Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 text-center text-xs text-zinc-600">
                Sem banner horizontal
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-black/40 to-transparent" />

            {/* Badges superiores: Classificação e Engine */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <span className="rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
                {engine || "Ren'Py"}
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${classificationColor}`}>
                {classification || "18+"}
              </span>
            </div>

            {/* Avatar / Perfil do Jogo sobreposto */}
            <div className="absolute bottom-3 left-3 flex items-end gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFDE00] bg-black shadow-lg">
                <img
                  src={displayAvatar}
                  alt="Perfil / Ícone do Game"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 pr-2">
                <p className="truncate text-[10px] font-black uppercase text-[#FFDE00]">
                  {genre || "Visual Novel"}
                </p>
                <h3 className="truncate text-sm font-black text-white">
                  {name || "Nome do jogo"}
                </h3>
                <p className="truncate text-[10px] text-zinc-400">
                  {developer || "Desenvolvedor"}
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes do Card */}
          <div className="space-y-3 p-4">

            {/* Badge de Tradução */}
            {translationStatus && (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <span>✓</span> Tradução: {translationStatus}
              </div>
            )}


            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
              {shortDescription || "A descrição curta do seu jogo aparecerá aqui nos cards da vitrine."}
            </p>

            {/* Plataformas */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-zinc-500">Sistemas:</span>
              {platforms.length > 0 ? (
                platforms.map((p) => (
                  <span key={p} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-zinc-500">Nenhum</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#29292F] pt-3 text-[10px]">
              <span className="text-zinc-500">
                Versão <b className="block text-white">{version}</b>
              </span>
              <span className="text-zinc-500">
                Tamanho <b className="block text-white">{fileSize || "—"}</b>
              </span>
              <span className="text-zinc-500">
                Idiomas <b className="block truncate text-white">{languages.join(", ")}</b>
              </span>
              <span className="text-zinc-500">
                Status{" "}
                <b className={`block ${status === "PUBLISHED" ? "text-emerald-400" : "text-amber-400"}`}>
                  {status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                </b>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-md bg-[#181B26] px-2 py-0.5 text-[10px] text-zinc-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {screenshots.length > 0 && (
        <div className={panelClass}>
          <p className="mb-3 text-xs font-black text-white">Screenshots na Galeria ({screenshots.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {screenshots.slice(0, 4).map((shot) => (
              <img
                key={shot}
                src={shot}
                alt="Screenshot"
                className="aspect-video w-full rounded-lg object-cover border border-[#29292F]"
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#29292F] bg-[#12141D] p-4 text-xs leading-relaxed text-zinc-500">
        <p className="font-black text-zinc-300">Publicação Integrada</p>
        <p className="mt-1">
          Sincronizado automaticamente com o banco Neon PostgreSQL e consumido em tempo real pelo Launcher RenPlay.
        </p>
      </div>
    </aside>
  );
}
