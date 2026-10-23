"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type Status = "DRAFT" | "PUBLISHED";
type ImageInputMode = "url" | "upload";

const input = "mt-2 w-full rounded-xl border border-[#29292F] bg-[#090A0F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10";
const panel = "rounded-3xl border border-[#29292F] bg-[#12141D] p-5 shadow-xl sm:p-7";

function Icon({
  name,
  className = "h-4 w-4"
}: {
  name:
    | "info"
    | "globe"
    | "image"
    | "download"
    | "shield"
    | "check"
    | "arrow"
    | "save"
    | "rocket"
    | "github"
    | "upload"
    | "link"
    | "trash"
    | "external"
    | "book"
    | "sparkles"
    | "check-circle";
  className?: string;
}) {
  const paths = {
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></>,
    shield: <><path d="M12 21s7-3.5 7-9V5l-7-2-7 2v7c0 5.5 7 9 7 9Z" /><path d="m9 12 2 2 4-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    save: <><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
    rocket: <><path d="M14 4c2-1 5-1 6-1 0 1 0 4-1 6l-7 7-4-4 6-8Z" /><path d="m8 12-4 1-1 4 4-1M12 16l-1 4 4-1 1-4" /></>,
    github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    sparkles: <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />,
    "check-circle": <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const steps: {
  id: Step;
  title: string;
  category: string;
  description: string;
  icon: Parameters<typeof Icon>[0]["name"];
}[] = [
  { id: 1, title: "Identidade", category: "Visual & GitHub", description: "Nome, banner, perfil e repo", icon: "sparkles" },
  { id: 2, title: "Informações", category: "Sobre & Sinopse", description: "História, estúdio e gênero", icon: "book" },
  { id: 3, title: "Idiomas", category: "Localização & Tags", description: "Idiomas e palavras-chave", icon: "globe" },
  { id: 4, title: "Galeria", category: "Capa & Mídia", description: "Pôster e screenshots", icon: "image" },
  { id: 5, title: "Arquivos", category: "Download & Sistemas", description: "Links e plataformas", icon: "download" },
  { id: 6, title: "Lançamento", category: "Revisão & Status", description: "Checklist e publicação", icon: "shield" }
];

const platformOptions = ["Windows", "Android", "Linux", "macOS", "Web Browser"];

export default function PublishGamePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  // Modos de entrada de imagem (URL ou Upload local)
  const [bannerMode, setBannerMode] = useState<ImageInputMode>("url");
  const [profileMode, setProfileMode] = useState<ImageInputMode>("url");
  const [coverMode, setCoverMode] = useState<ImageInputMode>("url");

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    developer: "",
    publisher: "",
    genre: "Visual Novel",
    category: "",
    version: "1.0.0",
    originalReleaseDate: "",
    renplayPublishDate: "",
    lastUpdateDate: "",
    translatedBy: "",
    gameIcon: "", // Perfil / Ícone do Game
    mainCover: "", // Capa vertical principal
    horizontalBanner: "", // Imagem de Banner da vitrine
    githubUrl: "", // Repositório / Link GitHub
    screenshots: "",
    mainFileName: "",
    fileSize: "",
    fileVersion: "1.0.0",
    downloadUrl: "",
    responsibleDev: "",
    responsibleTranslator: "",
    status: "DRAFT" as Status,
    editPermissions: "admin_only",
    scheduledPublishDate: "",
    changeLog: ""
  });

  const [tags, setTags] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["Português (Brasil)"]);
  const [platforms, setPlatforms] = useState<string[]>(["Windows"]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const screenshots = useMemo(
    () => form.screenshots.split("\n").map((value) => value.trim()).filter(Boolean),
    [form.screenshots]
  );
  const cover = form.mainCover || form.gameIcon || "/images/so-much-to-love-cover.jpg";

  // Leitura de arquivo local (Upload com conversão para base64)
  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    field: "horizontalBanner" | "gameIcon" | "mainCover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido (.png, .webp, .jpg).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem é muito pesada (máximo 5 MB). Otimize a imagem ou utilize um link externo de imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update(field, reader.result);
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) setTags((current) => [...current, value]);
    setTagInput("");
  };

  const addLanguage = () => {
    const value = languageInput.trim();
    if (value && !languages.includes(value)) setLanguages((current) => [...current, value]);
    setLanguageInput("");
  };

  const togglePlatform = (platform: string) =>
    setPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]
    );

  const isGithubValid =
    form.githubUrl.trim().length > 0 &&
    /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(form.githubUrl.trim());

  // Checklist de prontidão para a etapa 6
  const readiness = useMemo(() => {
    return [
      { label: "Nome do jogo", ready: Boolean(form.name.trim()), detail: form.name.trim() || "Pendente" },
      { label: "Banner horizontal", ready: Boolean(form.horizontalBanner.trim()), detail: form.horizontalBanner ? "Carregado" : "Recomendado" },
      { label: "Perfil / Ícone", ready: Boolean(form.gameIcon.trim()), detail: form.gameIcon ? "Carregado" : "Recomendado" },
      { label: "Desenvolvedor", ready: Boolean(form.developer.trim()), detail: form.developer.trim() || "Pendente" },
      { label: "Descrição curta", ready: Boolean(form.shortDescription.trim()), detail: form.shortDescription ? "Preenchida" : "Pendente" },
      { label: "Link de download", ready: Boolean(form.downloadUrl.trim()), detail: form.downloadUrl ? "Configurado" : "Pendente" },
      { label: "Plataformas", ready: platforms.length > 0, detail: platforms.join(", ") || "Nenhuma selecionada" },
      { label: "GitHub oficial", ready: Boolean(form.githubUrl.trim()), detail: form.githubUrl ? "Vinculado" : "Opcional" }
    ];
  }, [form, platforms]);

  const completedCount = readiness.filter((r) => r.ready).length;
  const progressPercent = Math.round((completedCount / readiness.length) * 100);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      description: form.shortDescription,
      fullDescription: form.fullDescription,
      developer: form.developer,
      genre: form.genre,
      category: form.category,
      version: form.version,
      coverImage: cover,
      downloadUrl: form.downloadUrl,
      platforms,
      languages,
      status: form.status,
      publisher: form.publisher,
      tags,
      originalReleaseDate: form.originalReleaseDate,
      renplayPublishDate: form.renplayPublishDate,
      lastUpdateDate: form.lastUpdateDate,
      translatedBy: form.translatedBy,
      gameIcon: form.gameIcon,
      mainCover: form.mainCover,
      horizontalBanner: form.horizontalBanner,
      githubUrl: form.githubUrl.trim(),
      screenshots,
      mainFileName: form.mainFileName,
      fileSize: form.fileSize,
      fileVersion: form.fileVersion,
      responsibleDev: form.responsibleDev,
      responsibleTranslator: form.responsibleTranslator,
      editPermissions: form.editPermissions,
      scheduledPublishDate: form.scheduledPublishDate,
      changeLog: form.changeLog
    };

    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Não foi possível salvar o jogo.");
      return;
    }

    setNotice(form.status === "PUBLISHED" ? "Jogo publicado com sucesso no catálogo!" : "Rascunho salvo com sucesso.");
    window.setTimeout(() => router.push("/dashboard/jogos"), 700);
  };

  const next = () => setStep((current) => Math.min(6, current + 1) as Step);
  const previous = () => setStep((current) => Math.max(1, current - 1) as Step);

  return (
    <div className="min-h-screen bg-[#090A0F] font-sans text-[#F5F5F5]">
      {/* Header Superior */}
      <header className="sticky top-0 z-40 border-b border-[#29292F] bg-[#090A0F]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto" />
            <span className="hidden rounded border border-[#FFDE00]/30 bg-[#FFDE00]/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#FFDE00] sm:inline">
              Painel de Controle
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-zinc-400">Progresso geral:</span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-[#FFDE00] to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white">{progressPercent}%</span>
            </div>
            <Link href="/dashboard/jogos" className="text-xs font-bold text-zinc-400 transition hover:text-[#FFDE00]">
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col md:flex-row">
        {/* Barra Lateral de Navegação */}
        <aside className="w-full shrink-0 border-b border-[#29292F] bg-[#0D0E14]/70 p-4 md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r md:p-5">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">Navegação</p>
          <nav className="mt-2 space-y-1">
            <SideLink href="/dashboard">01&nbsp;&nbsp; Visão geral</SideLink>
            <SideLink href="/dashboard/jogos">02&nbsp;&nbsp; Catálogo de jogos</SideLink>
            <Link
              href="/dashboard/jogos/publish"
              className="block min-h-11 rounded-xl bg-[#FFDE00] px-3.5 py-3 text-xs font-black text-black"
            >
              03&nbsp;&nbsp; Publicar jogo
            </Link>
            <SideLink href="/dashboard/usuarios">04&nbsp;&nbsp; Equipe e acessos</SideLink>
          </nav>

          <div className="mt-8 hidden rounded-2xl border border-[#29292F] bg-[#12141D] p-4 md:block">
            <p className="text-xs font-black text-white">Passo a Passo</p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              O formulário agora é dividido em 6 categorias lógicas para uma experiência de publicação clara, organizada e completa.
            </p>
          </div>
        </aside>

        {/* Área Central */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-6xl">
            {/* Cabeçalho da Página */}
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE00]">
                  Editor de catálogo &bull; Passo a Passo por Categorias
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {steps[step - 1].category}: {steps[step - 1].title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  {steps[step - 1].description}. Siga as etapas abaixo para cadastrar e publicar sua obra com qualidade máxima.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#29292F] bg-[#12141D] px-4 py-2.5 text-xs text-zinc-400">
                  <span className="font-black text-[#FFDE00]">Categoria {step}</span> de 6
                </div>
              </div>
            </div>

            {/* Stepper das 6 Categorias */}
            <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {steps.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`group rounded-2xl border p-3 text-left transition ${
                    step === item.id
                      ? "border-[#FFDE00] bg-[#FFDE00]/10 shadow-[0_0_20px_rgba(255,222,0,0.12)]"
                      : item.id < step
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-[#29292F] bg-[#12141D] hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      name={item.icon}
                      className={`h-4 w-4 ${
                        step === item.id
                          ? "text-[#FFDE00]"
                          : item.id < step
                          ? "text-emerald-400"
                          : "text-zinc-500"
                      }`}
                    />
                    {item.id < step && <Icon name="check" className="h-3.5 w-3.5 text-emerald-400" />}
                    <span className="text-[10px] font-black text-zinc-500">0{item.id}</span>
                  </div>
                  <p className="mt-2 text-xs font-black text-white">{item.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.category}</p>
                </button>
              ))}
            </div>

            {/* Formulário Principal */}
            <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                {/* CATEGORIA 1: IDENTIDADE VISUAL & GITHUB */}
                {step === 1 && (
                  <section className={panel}>
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
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          className={`${input} mt-3 text-base font-semibold`}
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
                              onClick={() => setBannerMode("url")}
                              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                                bannerMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon name="link" className="h-3 w-3" /> Link / URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setBannerMode("upload")}
                              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                                bannerMode === "upload" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon name="upload" className="h-3 w-3" /> Enviar Imagem
                            </button>
                          </div>
                        </div>

                        {/* Explicação detalhada */}
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
                              value={form.horizontalBanner}
                              onChange={(e) => update("horizontalBanner", e.target.value)}
                              className={input}
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
                                onChange={(e) => handleFileUpload(e, "horizontalBanner")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        {/* Preview do banner */}
                        {form.horizontalBanner && (
                          <div className="relative mt-3 overflow-hidden rounded-xl border border-[#29292F] bg-black">
                            <div className="aspect-[16/7] w-full">
                              <img
                                src={form.horizontalBanner}
                                alt="Pré-visualização do Banner"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => update("horizontalBanner", "")}
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
                          {/* Alternador URL / Upload */}
                          <div className="flex rounded-lg border border-[#29292F] bg-[#090A0F] p-0.5 text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => setProfileMode("url")}
                              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                                profileMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon name="link" className="h-3 w-3" /> Link / URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfileMode("upload")}
                              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                                profileMode === "upload" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon name="upload" className="h-3 w-3" /> Enviar Imagem
                            </button>
                          </div>
                        </div>

                        {/* Explicação detalhada */}
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
                              value={form.gameIcon}
                              onChange={(e) => update("gameIcon", e.target.value)}
                              className={input}
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
                                onChange={(e) => handleFileUpload(e, "gameIcon")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        {/* Preview do perfil */}
                        {form.gameIcon && (
                          <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#29292F] bg-black p-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFDE00]/80 bg-[#12141D]">
                              <img
                                src={form.gameIcon}
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
                              onClick={() => update("gameIcon", "")}
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
                            value={form.githubUrl}
                            onChange={(e) => update("githubUrl", e.target.value)}
                            className={`${input} pr-24`}
                            placeholder="https://github.com/usuario/meu-jogo-renpy"
                          />
                          {form.githubUrl && (
                            <a
                              href={form.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute top-5 right-3 flex items-center gap-1 text-[11px] font-bold text-[#FFDE00] hover:underline"
                            >
                              Testar link <Icon name="external" className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {form.githubUrl && (
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
                )}

                {/* CATEGORIA 2: SOBRE O JOGO & SINOPSE */}
                {step === 2 && (
                  <section className={panel}>
                    <SectionTitle
                      title="Categoria 2: Informações & Sinopse"
                      description="Apresente quem criou o jogo, em qual gênero ele se encaixa e a história que vai encantar os jogadores."
                    />

                    <div className="space-y-6">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Desenvolvedor(a) ou Estúdio *"
                          required
                          value={form.developer}
                          onChange={(e) => update("developer", e.target.value)}
                          placeholder="Ex.: Moonlight Studio, Sakura Devs..."
                        />
                        <Field
                          label="Publicadora (Publisher)"
                          value={form.publisher}
                          onChange={(e) => update("publisher", e.target.value)}
                          placeholder="Opcional (se diferente do desenvolvedor)"
                        />
                        <Field
                          label="Gênero Principal *"
                          required
                          value={form.genre}
                          onChange={(e) => update("genre", e.target.value)}
                          placeholder="Visual Novel, Romance, Mistério, Ficção..."
                        />
                        <Field
                          label="Categoria / Subgênero"
                          value={form.category}
                          onChange={(e) => update("category", e.target.value)}
                          placeholder="Ex.: Sobrenatural / Drama / Fantasia"
                        />
                        <Field
                          label="Versão Atual do Jogo"
                          value={form.version}
                          onChange={(e) => update("version", e.target.value)}
                          placeholder="1.0.0"
                        />
                        <Field
                          label="Data de Lançamento Original"
                          type="date"
                          value={form.originalReleaseDate}
                          onChange={(e) => update("originalReleaseDate", e.target.value)}
                        />
                        <TextArea
                          label="Descrição Curta (Resumo da Vitrine) *"
                          required
                          rows={3}
                          value={form.shortDescription}
                          onChange={(e) => update("shortDescription", e.target.value)}
                          placeholder="Breve resumo (1 a 3 frases) exibido nos cards do catálogo, buscas e carrossel."
                          wide
                        />
                        <TextArea
                          label="Descrição Completa / Sinopse Detalhada"
                          rows={7}
                          value={form.fullDescription}
                          onChange={(e) => update("fullDescription", e.target.value)}
                          placeholder="Conte a história, os personagens, as rotas disponíveis e os diferenciais da sua obra."
                          wide
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* CATEGORIA 3: IDIOMAS & TAGS */}
                {step === 3 && (
                  <section className={panel}>
                    <SectionTitle
                      title="Categoria 3: Idiomas e Localização"
                      description="Informe em quais línguas a visual novel pode ser lida e adicione tags temáticas para ajudar na descoberta."
                    />
                    <div className="space-y-6">
                      <ChipEditor
                        title="Idiomas disponíveis"
                        values={languages}
                        setValues={setLanguages}
                        input={languageInput}
                        setInput={setLanguageInput}
                        add={addLanguage}
                        placeholder="Ex.: Inglês, Japonês, Espanhol..."
                      />
                      <Field
                        label="Responsável pelas traduções"
                        value={form.translatedBy}
                        onChange={(e) => update("translatedBy", e.target.value)}
                        placeholder="Ex.: Equipe Oficial RenPlay PT-BR"
                      />
                      <ChipEditor
                        title="Tags do jogo"
                        values={tags}
                        setValues={setTags}
                        input={tagInput}
                        setInput={setTagInput}
                        add={addTag}
                        placeholder="Ex.: Múltiplos finais, Escolhas importam, Dublado..."
                      />
                    </div>
                  </section>
                )}

                {/* CATEGORIA 4: GALERIA DE FOTOS & CAPA PÔSTER */}
                {step === 4 && (
                  <section className={panel}>
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
                              onClick={() => setCoverMode("url")}
                              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                                coverMode === "url" ? "bg-[#FFDE00] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon name="link" className="h-3 w-3" /> Link / URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setCoverMode("upload")}
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
                              value={form.mainCover}
                              onChange={(e) => update("mainCover", e.target.value)}
                              className={input}
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
                                onChange={(e) => handleFileUpload(e, "mainCover")}
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
                        value={form.screenshots}
                        onChange={(e) => update("screenshots", e.target.value)}
                        placeholder={"https://.../screenshot-01.jpg\nhttps://.../screenshot-02.jpg\nhttps://.../screenshot-03.jpg"}
                        wide
                      />
                    </div>
                  </section>
                )}

                {/* CATEGORIA 5: ARQUIVOS & DOWNLOAD */}
                {step === 5 && (
                  <section className={panel}>
                    <SectionTitle
                      title="Categoria 5: Arquivos & Download"
                      description="Configure os links de download e os sistemas operacionais suportados para os jogadores baixarem a visual novel."
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="URL do download (Pixeldrain, Drive ou direto) *"
                        type="url"
                        value={form.downloadUrl}
                        onChange={(e) => update("downloadUrl", e.target.value)}
                        placeholder="https://pixeldrain.com/u/... ou https://.../jogo.zip"
                        wide
                      />
                      <Field
                        label="Nome do arquivo"
                        value={form.mainFileName}
                        onChange={(e) => update("mainFileName", e.target.value)}
                        placeholder="MeuJogo_v1.0.0.zip"
                      />
                      <Field
                        label="Tamanho aproximado do arquivo"
                        value={form.fileSize}
                        onChange={(e) => update("fileSize", e.target.value)}
                        placeholder="Ex.: 450 MB ou 1.2 GB"
                      />
                      <Field
                        label="Versão do arquivo"
                        value={form.fileVersion}
                        onChange={(e) => update("fileVersion", e.target.value)}
                      />
                      <div className="sm:col-span-2">
                        <p className="text-xs font-bold text-zinc-400">Plataformas suportadas</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {platformOptions.map((platform) => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => togglePlatform(platform)}
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
                )}

                {/* CATEGORIA 6: LANÇAMENTO & REVISÃO */}
                {step === 6 && (
                  <section className={panel}>
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
                            active={form.status === "DRAFT"}
                            title="Rascunho"
                            description="Salvo com segurança; visível apenas para você e equipe"
                            onClick={() => update("status", "DRAFT")}
                          />
                          <StatusButton
                            active={form.status === "PUBLISHED"}
                            title="Publicado"
                            description="Disponibilizado imediatamente na vitrine e no Launcher"
                            onClick={() => update("status", "PUBLISHED")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Responsável pelo desenvolvimento"
                          value={form.responsibleDev}
                          onChange={(e) => update("responsibleDev", e.target.value)}
                          placeholder="Nome do responsável"
                        />
                        <Field
                          label="Responsável pela tradução"
                          value={form.responsibleTranslator}
                          onChange={(e) => update("responsibleTranslator", e.target.value)}
                          placeholder="Nome do tradutor"
                        />
                      </div>

                      <label className="block text-xs font-bold text-zinc-400">
                        Permissões de edição
                        <select
                          value={form.editPermissions}
                          onChange={(e) => update("editPermissions", e.target.value)}
                          className={input}
                        >
                          <option value="admin_only">Apenas administradores</option>
                          <option value="dev_trans">Desenvolvedor e tradutor responsáveis</option>
                          <option value="all_team">Toda a equipe</option>
                        </select>
                      </label>

                      <Field
                        label="Data de publicação agendada"
                        type="datetime-local"
                        value={form.scheduledPublishDate}
                        onChange={(e) => update("scheduledPublishDate", e.target.value)}
                      />

                      <TextArea
                        label="Changelog da versão"
                        rows={5}
                        value={form.changeLog}
                        onChange={(e) => update("changeLog", e.target.value)}
                        placeholder="Correções, novos capítulos, melhorias e novidades desta versão..."
                      />
                    </div>
                  </section>
                )}

                {/* Mensagens de erro e feedback */}
                {error && (
                  <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-300">
                    {notice}
                  </p>
                )}

                {/* Botões de Navegação Inferiores */}
                <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#29292F] pt-5 sm:flex-row">
                  <div>
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={previous}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#29292F] px-5 py-3 text-xs font-bold text-zinc-300 hover:border-zinc-600 hover:text-white"
                      >
                        <span className="rotate-180">
                          <Icon name="arrow" />
                        </span>
                        Etapa anterior
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => save()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50"
                    >
                      <Icon name="save" /> Salvar rascunho
                    </button>
                    {step < 6 ? (
                      <button
                        type="button"
                        onClick={next}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FFDE00] px-6 py-3 text-xs font-black text-black hover:bg-[#ffe84d]"
                      >
                        Próxima categoria: {steps[step].title} <Icon name="arrow" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FFDE00] px-6 py-3 text-xs font-black text-black hover:bg-[#ffe84d] disabled:opacity-60"
                      >
                        <Icon name="rocket" />
                        {saving ? "Salvando..." : form.status === "PUBLISHED" ? "Concluir e publicar" : "Salvar rascunho"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ASIDE: LIVE PREVIEW NA VITRINE */}
              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className={panel}>
                  <div className="mb-4 flex items-center justify-between border-b border-[#29292F] pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FFDE00]">Pré-visualização</p>
                      <h2 className="mt-1 text-sm font-black text-white">Vitrine do RenPlay</h2>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                  </div>

                  {/* Card do Jogo */}
                  <div className="overflow-hidden rounded-2xl border border-[#29292F] bg-[#090A0F]">
                    {/* Banner com gradiente */}
                    <div className="relative aspect-video bg-zinc-950">
                      {form.horizontalBanner ? (
                        <img
                          src={form.horizontalBanner}
                          alt="Banner Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 text-center text-xs text-zinc-600">
                          Sem banner horizontal
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-black/40 to-transparent" />

                      {/* Avatar / Perfil do Jogo sobreposto */}
                      <div className="absolute bottom-3 left-3 flex items-end gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFDE00] bg-black shadow-lg">
                          <img
                            src={form.gameIcon || cover}
                            alt="Perfil / Ícone do Game"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-[10px] font-black uppercase text-[#FFDE00]">
                            {form.genre || "Visual Novel"}
                          </p>
                          <h3 className="truncate text-sm font-black text-white">
                            {form.name || "Nome do jogo"}
                          </h3>
                          <p className="truncate text-[10px] text-zinc-400">
                            {form.developer || "Desenvolvedor"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes do Card */}
                    <div className="space-y-3 p-4">
                      {/* Badge GitHub no Preview */}
                      {form.githubUrl && (
                        <a
                          href={form.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg border border-[#29292F] bg-[#12141D] px-3 py-1.5 text-[11px] font-bold text-zinc-300 transition hover:border-[#FFDE00]/40 hover:text-white"
                        >
                          <span className="flex items-center gap-1.5">
                            <Icon name="github" className="h-3.5 w-3.5" />
                            GitHub oficial
                          </span>
                          <Icon name="external" className="h-3 w-3 text-zinc-500" />
                        </a>
                      )}

                      <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
                        {form.shortDescription || "A descrição curta do seu jogo aparecerá aqui nos cards da vitrine."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 border-t border-[#29292F] pt-3 text-[10px]">
                        <span className="text-zinc-500">
                          Versão <b className="block text-white">{form.version}</b>
                        </span>
                        <span className="text-zinc-500">
                          Tamanho <b className="block text-white">{form.fileSize || "—"}</b>
                        </span>
                        <span className="text-zinc-500">
                          Idiomas <b className="block truncate text-white">{languages.join(", ")}</b>
                        </span>
                        <span className="text-zinc-500">
                          Status{" "}
                          <b className="block text-[#FFDE00]">
                            {form.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                          </b>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-[#181B26] px-2 py-1 text-[10px] text-zinc-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {screenshots.length > 0 && (
                  <div className={panel}>
                    <p className="mb-3 text-xs font-black text-white">Screenshots adicionadas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {screenshots.slice(0, 4).map((shot) => (
                        <img
                          key={shot}
                          src={shot}
                          alt="Screenshot"
                          className="aspect-video w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-[#29292F] bg-[#12141D] p-4 text-xs leading-relaxed text-zinc-500">
                  <p className="font-black text-zinc-300">Publicação Segura</p>
                  <p className="mt-1">
                    Os dados serão salvos no banco de dados e vinculados à sua conta de desenvolvedor no RenPlay.
                  </p>
                </div>
              </aside>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function SideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block min-h-11 rounded-xl px-3.5 py-3 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-[#29292F] pb-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </div>
  );
}

function Field({
  label,
  wide,
  required,
  type = "text",
  value,
  onChange,
  placeholder
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className={`block text-xs font-bold text-zinc-400 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        className={input}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  wide,
  required,
  rows,
  value,
  onChange,
  placeholder
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  rows: number;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className={`block text-xs font-bold text-zinc-400 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`${input} resize-y`}
        placeholder={placeholder}
      />
    </label>
  );
}

function ChipEditor({
  title,
  values,
  setValues,
  input: value,
  setInput,
  add,
  placeholder
}: {
  title: string;
  values: string[];
  setValues: (values: string[]) => void;
  input: string;
  setInput: (value: string) => void;
  add: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-zinc-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setValues(values.filter((current) => current !== item))}
            className="rounded-lg border border-[#FFDE00]/30 bg-[#FFDE00]/10 px-3 py-2 text-xs font-bold text-[#FFDE00]"
          >
            {item} ×
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), add())}
          className={input.replace("mt-2 ", "flex-1 ")}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="mt-2 rounded-xl border border-[#29292F] px-4 text-xs font-black text-white hover:border-[#FFDE00]"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

function StatusButton({
  active,
  title,
  description,
  onClick
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active ? "border-[#FFDE00] bg-[#FFDE00]/10" : "border-[#29292F] bg-[#090A0F] hover:border-zinc-600"
      }`}
    >
      <span className={`block text-xs font-black ${active ? "text-[#FFDE00]" : "text-zinc-300"}`}>{title}</span>
      <span className="mt-1 block text-[11px] text-zinc-500">{description}</span>
    </button>
  );
}
