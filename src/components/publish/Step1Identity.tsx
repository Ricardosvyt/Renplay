import React, { useEffect } from "react";
import { Icon } from "../ui/Icon";
import { SectionTitle, inputClass, panelClass } from "./FormControls";

interface Step1IdentityProps {
  name: string;
  slug: string;
  developer: string;
  publisher: string;
  genre: string;
  category: string;
  classification: string;
  engine: string;
  customEngine: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onUpdate: (field: string, value: string) => void;
}

const classificationOptions = [
  { value: "Livre", label: "Livre", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", desc: "Para todos os públicos" },
  { value: "12", label: "12 anos", color: "bg-amber-500/20 text-amber-400 border-amber-500/40", desc: "Violência leve ou linguagem moderada" },
  { value: "14", label: "14 anos", color: "bg-orange-500/20 text-orange-400 border-orange-500/40", desc: "Temas mais maduros" },
  { value: "16", label: "16 anos", color: "bg-red-500/20 text-red-400 border-red-500/40", desc: "Conteúdo denso ou violência acentuada" },
  { value: "18", label: "18+ anos", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", desc: "Conteúdo adulto explícito" }
];

const engineOptions = [
  { value: "Ren'Py", label: "Ren'Py", badge: "Nativo RenPlay", desc: "Suporte completo a patches de tradução e execução direta" },
  { value: "Unity", label: "Unity", badge: "Compatível", desc: "Executável Windows (.exe) gerenciado pelo Launcher" },
  { value: "RPG Maker", label: "RPG Maker", badge: "Compatível", desc: "MV, MZ, VX Ace e clássicos (.exe)" },
  { value: "Godot", label: "Godot Engine", badge: "Compatível", desc: "Binário otimizado para desktop" },
  { value: "Outra", label: "Outro Motor", badge: "Personalizado", desc: "Executável customizado para desktop" }
];

export function Step1Identity({
  name,
  slug,
  developer,
  publisher,
  genre,
  category,
  classification,
  engine,
  customEngine,
  shortDescription,
  fullDescription,
  tags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  onUpdate
}: Step1IdentityProps) {
  // Geração automática do slug a partir do nome se o slug ainda não foi editado manualmente
  useEffect(() => {
    if (name && (!slug || slug === generateSlug(name.slice(0, -1)))) {
      onUpdate("slug", generateSlug(name));
    }
  }, [name]);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  return (
    <section className={panelClass}>
      <SectionTitle
        title="Etapa 1: Informações Básicas do Jogo"
        description="Defina os metadados principais da sua obra: identificação, desenvolvedores, categorização, classificação e o motor gráfico utilizado."
      />

      <div className="space-y-6">
        {/* NOME DO JOGO E SLUG */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="game-name" className="text-sm font-black text-white">
                Nome do jogo <span className="text-[#FFDE00]">*</span>
              </label>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Nome oficial exibido no site, na loja e no Launcher.
            </p>
            <input
              id="game-name"
              required
              type="text"
              value={name}
              onChange={(e) => onUpdate("name", e.target.value)}
              className={`${inputClass} mt-3 text-base font-semibold`}
              placeholder="Ex.: Tokyo Memories, Noite em Kyoto, Being a DIK..."
            />
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="game-slug" className="text-sm font-black text-white">
                Slug (URL Amigável) <span className="text-[#FFDE00]">*</span>
              </label>
              <span className="rounded bg-[#FFDE00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFDE00]">Auto / URL</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Identificador da página: <span className="font-mono text-zinc-300">/jogo/{slug || "nome-do-jogo"}</span>
            </p>
            <div className="mt-3 flex items-center rounded-xl border border-[#29292F] bg-[#12141D] px-3 focus-within:border-[#FFDE00]">
              <span className="text-xs font-bold text-zinc-500 select-none">/jogo/</span>
              <input
                id="game-slug"
                type="text"
                value={slug}
                onChange={(e) => onUpdate("slug", generateSlug(e.target.value))}
                className="w-full bg-transparent px-1 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600"
                placeholder="nome-do-jogo"
              />
            </div>
          </div>
        </div>

        {/* DESENVOLVEDOR E ESTÚDIO */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="game-dev" className="text-sm font-black text-white">
                Desenvolvedor / Autor <span className="text-[#FFDE00]">*</span>
              </label>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Criador ou estúdio principal responsável pelo jogo.
            </p>
            <input
              id="game-dev"
              required
              type="text"
              value={developer}
              onChange={(e) => onUpdate("developer", e.target.value)}
              className={`${inputClass} mt-3 text-sm font-semibold`}
              placeholder="Ex.: Dr PinkCake, Key, Type-Moon, Estúdio Indie..."
            />
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="game-publisher" className="text-sm font-black text-white">
                Publicadora (Publisher)
              </label>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">Opcional</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Selo editorial ou distribuidora oficial (se houver).
            </p>
            <input
              id="game-publisher"
              type="text"
              value={publisher}
              onChange={(e) => onUpdate("publisher", e.target.value)}
              className={`${inputClass} mt-3 text-sm font-semibold`}
              placeholder="Ex.: RenPlay Studios, Sekai Project..."
            />
          </div>
        </div>

        {/* MOTOR GRÁFICO (ENGINE) */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">
              Tipo de Jogo / Motor Gráfico (Engine) <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Multi-Engine</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Selecione a tecnologia do jogo. O RenPlay possui suporte otimizado a traduções Ren'Py e compatibilidade com executáveis de outras engines.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {engineOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("engine", opt.value)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  (engine || "Ren'Py") === opt.value
                    ? "border-[#FFDE00] bg-[#FFDE00]/10 shadow-[0_0_15px_rgba(255,222,0,0.15)]"
                    : "border-[#29292F] bg-[#12141D] hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{opt.label}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    opt.value === "Ren'Py" ? "bg-[#FFDE00] text-black" : "bg-white/10 text-zinc-300"
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{opt.desc}</p>
              </button>
            ))}
          </div>

          {engine === "Outra" && (
            <div className="mt-3">
              <input
                type="text"
                value={customEngine}
                onChange={(e) => onUpdate("customEngine", e.target.value)}
                className={inputClass}
                placeholder="Informe o motor customizado (Ex.: Unreal Engine 5, Monogame, HTML5...)"
              />
            </div>
          )}
        </div>

        {/* CLASSIFICAÇÃO INDICATIVA */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-white">
              Classificação Indicativa Etária <span className="text-[#FFDE00]">*</span>
            </label>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">Obrigatório</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Define os alertas de conteúdo e o selo etário exibido no card do jogo.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {classificationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("classification", opt.value)}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                  (classification || "18") === opt.value
                    ? `border-[#FFDE00] bg-[#FFDE00]/15 ring-2 ring-[#FFDE00]/50`
                    : "border-[#29292F] bg-[#12141D] hover:border-zinc-600"
                }`}
              >
                <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-black uppercase tracking-wider ${opt.color}`}>
                  {opt.label}
                </span>
                <span className="mt-1.5 text-[10px] text-zinc-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORIA E GÊNERO */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="game-category" className="text-sm font-black text-white">
              Categoria Principal
            </label>
            <p className="mt-1 text-xs text-zinc-400">Seção onde o jogo será agrupado na vitrine.</p>
            <select
              id="game-category"
              value={category || "Visual Novel"}
              onChange={(e) => onUpdate("category", e.target.value)}
              className={`${inputClass} mt-3 text-sm font-semibold`}
            >
              <option value="Visual Novel">Visual Novel</option>
              <option value="Romance">Romance & Relacionamentos</option>
              <option value="Aventura">Aventura Interativa</option>
              <option value="Mistério">Mistério & Investigação</option>
              <option value="Fantasia">Fantasia & Sobrenatural</option>
              <option value="Vida Escolar">Vida Escolar & Comédia</option>
              <option value="Sci-Fi">Ficção Científica</option>
              <option value="Adulto / 18+">Adulto / 18+</option>
            </select>
          </div>

          <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
            <label htmlFor="game-genre" className="text-sm font-black text-white">
              Gênero Específico
            </label>
            <p className="mt-1 text-xs text-zinc-400">Subgênero de jogabilidade da obra.</p>
            <input
              id="game-genre"
              type="text"
              value={genre || "Visual Novel"}
              onChange={(e) => onUpdate("genre", e.target.value)}
              className={`${inputClass} mt-3 text-sm font-semibold`}
              placeholder="Ex.: Sandbox, Kinetic Novel, Dating Sim, Otome..."
            />
          </div>
        </div>

        {/* TAGS */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <label className="text-sm font-black text-white">Tags Temáticas</label>
          <p className="mt-1 text-xs text-zinc-400">Palavras-chave que ajudam os jogadores a encontrar sua obra.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddTag())}
              className={`${inputClass} text-sm`}
              placeholder="Digite uma tag (ex: escolhas importam, comédia, mistério) e pressione Adicionar"
            />
            <button
              type="button"
              onClick={onAddTag}
              className="shrink-0 rounded-xl bg-[#FFDE00] px-4 py-3 text-xs font-black text-black hover:bg-[#ffe84d]"
            >
              Adicionar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#29292F] bg-[#12141D] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => onRemoveTag(t)}
                  className="text-zinc-500 hover:text-red-400"
                  aria-label={`Remover tag ${t}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* DESCRIÇÃO CURTA (CARD RESUME) */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="game-short-desc" className="text-sm font-black text-white">
              Descrição Curta (Resumo para Cards) <span className="text-[#FFDE00]">*</span>
            </label>
            <span className={`text-[11px] font-bold ${shortDescription.length > 200 ? "text-amber-400" : "text-zinc-500"}`}>
              {shortDescription.length}/200 caracteres
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Resumo direto e atraente que aparecerá nos cards da loja, na busca e na biblioteca do Launcher.
          </p>
          <textarea
            id="game-short-desc"
            required
            rows={2}
            maxLength={220}
            value={shortDescription}
            onChange={(e) => onUpdate("shortDescription", e.target.value)}
            className={`${inputClass} mt-3 text-sm leading-relaxed`}
            placeholder="Ex.: Acompanhe a rotina em uma universidade cheia de escolhas, amizades e intrigas..."
          />
        </div>

        {/* DESCRIÇÃO COMPLETA (SINOPSE) */}
        <div className="rounded-2xl border border-[#29292F] bg-[#0E1017] p-5">
          <label htmlFor="game-full-desc" className="text-sm font-black text-white">
            Sinopse & Descrição Completa
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            Texto detalhado exibido na página dedicada do jogo, contando o enredo, mecânicas e advertências.
          </p>
          <textarea
            id="game-full-desc"
            rows={6}
            value={fullDescription}
            onChange={(e) => onUpdate("fullDescription", e.target.value)}
            className={`${inputClass} mt-3 text-sm leading-relaxed`}
            placeholder="Descreva a história completa, as personagens centrais, os múltiplos finais e informações de suporte..."
          />
        </div>
      </div>
    </section>
  );
}
