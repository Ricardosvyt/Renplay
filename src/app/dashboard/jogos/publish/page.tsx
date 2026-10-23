"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Step, ImageInputMode, Status, SystemRequirements } from "@/components/publish/types";
import { StepNav, stepsList } from "@/components/publish/StepNav";
import { Step1Identity } from "@/components/publish/Step1Identity";
import { Step4Gallery } from "@/components/publish/Step4Gallery";
import { Step5Files } from "@/components/publish/Step5Files";
import { Step3LanguagesTags } from "@/components/publish/Step3LanguagesTags";
import { Step2Information } from "@/components/publish/Step2Information";
import { Step6Launch, ReadinessItem } from "@/components/publish/Step6Launch";
import { PublishLivePreview } from "@/components/publish/PublishLivePreview";

const platformOptions = ["Windows", "Linux", "macOS", "Android", "Web Browser"];

export default function PublishGamePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const [bannerMode, setBannerMode] = useState<ImageInputMode>("url");
  const [profileMode, setProfileMode] = useState<ImageInputMode>("url");
  const [coverMode, setCoverMode] = useState<ImageInputMode>("url");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    developer: "",
    publisher: "",
    genre: "Visual Novel",
    category: "Visual Novel",
    classification: "18",
    engine: "Ren'Py",
    customEngine: "",
    shortDescription: "",
    fullDescription: "",
    gameIcon: "",
    horizontalBanner: "",
    mainCover: "",
    screenshots: "",
    trailerUrl: "",
    githubUrl: "",
    version: "1.0.0",
    mainFileName: "",
    fileSize: "",
    sha256: "",
    downloadUrl: "",
    systemRequirements: {
      os: "Windows 10 / 11 (64-bit)",
      cpu: "Intel Core i3 / AMD equivalente 2.0 GHz",
      ram: "2 GB",
      gpu: "Gráficos com suporte a OpenGL 2.0 / DirectX 11",
      storage: "1 GB de espaço livre"
    } as SystemRequirements,
    translationStatus: "Completa",
    translatedBy: "Equipe RenPlay Brasil",
    translationNotes: "",
    status: "DRAFT" as Status,
    originalReleaseDate: "",
    renplayPublishDate: new Date().toISOString().split("T")[0],
    featuredOrder: 0,
    releaseNotes: "",
    responsibleDev: "",
    responsibleTranslator: "",
    editPermissions: "admin_only",
    scheduledPublishDate: "",
    changeLog: ""
  });

  const [platforms, setPlatforms] = useState<string[]>(["Windows"]);
  const [tags, setTags] = useState<string[]>(["Visual Novel", "Romance", "Anime"]);
  const [languages, setLanguages] = useState<string[]>(["Português (Brasil)", "Inglês"]);

  const update = (field: string, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateRequirements = (reqField: keyof SystemRequirements, value: string) => {
    setForm((current) => ({
      ...current,
      systemRequirements: {
        ...current.systemRequirements,
        [reqField]: value
      }
    }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    field: "horizontalBanner" | "gameIcon" | "mainCover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem selecionada excede o limite máximo de 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        update(field, dataUrl);
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((current) =>
      current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform]
    );
  };

  const addTag = () => {
    const clean = tagInput.trim().replace(/^#/, "");
    if (!clean) return;
    if (!tags.includes(clean)) setTags([...tags, clean]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((t) => t !== tagToRemove));
  };

  const addLanguage = () => {
    const clean = languageInput.trim();
    if (!clean) return;
    if (!languages.includes(clean)) setLanguages([...languages, clean]);
    setLanguageInput("");
  };


  const screenshots = useMemo(
    () =>
      form.screenshots
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.screenshots]
  );

  const readiness: ReadinessItem[] = useMemo(
    () => [
      { label: "Nome do jogo", ready: Boolean(form.name.trim()), detail: form.name || "Pendente" },
      { label: "Desenvolvedor / Estúdio", ready: Boolean(form.developer.trim()), detail: form.developer || "Pendente" },
      { label: "Motor Gráfico (Engine)", ready: Boolean(form.engine), detail: form.engine === "Outra" ? form.customEngine || "Outro" : form.engine },
      { label: "Classificação Indicativa", ready: Boolean(form.classification), detail: `${form.classification} anos` },
      { label: "Resumo para Cards", ready: Boolean(form.shortDescription.trim()), detail: form.shortDescription ? "Preenchido" : "Pendente" },
      { label: "Banner Hero (16:9)", ready: Boolean(form.horizontalBanner.trim()), detail: form.horizontalBanner ? "Configurado" : "Pendente" },
      { label: "Capa Pôster ou Ícone", ready: Boolean(form.mainCover.trim() || form.gameIcon.trim()), detail: form.mainCover || form.gameIcon ? "Configurada" : "Pendente" },
      { label: "Link de Download", ready: Boolean(form.downloadUrl.trim()), detail: form.downloadUrl ? "Configurado" : "Pendente" },
      { label: "Plataformas", ready: platforms.length > 0, detail: platforms.join(", ") || "Nenhuma" },
      { label: "Status da Tradução", ready: Boolean(form.translationStatus), detail: form.translationStatus || "Completa" },
      { label: "Idiomas Suportados", ready: languages.length > 0, detail: languages.join(", ") || "Nenhum" }
    ],
    [form, platforms, languages]
  );

  const completedCount = readiness.filter((r) => r.ready).length;
  const progressPercent = Math.round((completedCount / readiness.length) * 100);

  const save = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      slug: form.slug,
      developer: form.developer,
      publisher: form.publisher,
      genre: form.genre,
      category: form.category,
      classification: form.classification,
      engine: form.engine,
      customEngine: form.customEngine,
      shortDescription: form.shortDescription,
      description: form.shortDescription,
      fullDescription: form.fullDescription,
      gameIcon: form.gameIcon,
      horizontalBanner: form.horizontalBanner,
      bannerImage: form.horizontalBanner,
      mainCover: form.mainCover,
      coverImage: form.mainCover || form.gameIcon,
      screenshots,
      trailerUrl: form.trailerUrl,
      githubUrl: form.githubUrl,
      version: form.version,
      mainFileName: form.mainFileName,
      fileSize: form.fileSize,
      sha256: form.sha256,
      downloadUrl: form.downloadUrl,
      platforms,
      systemRequirements: form.systemRequirements,
      languages,
      translationStatus: form.translationStatus,
      translatedBy: form.translatedBy,
      translationNotes: form.translationNotes,
      status: form.status,
      originalReleaseDate: form.originalReleaseDate,
      renplayPublishDate: form.renplayPublishDate,
      featuredOrder: Number(form.featuredOrder) || 0,
      versionNotes: form.releaseNotes,
      releaseNotes: form.releaseNotes,
      responsibleDev: form.responsibleDev,
      responsibleTranslator: form.responsibleTranslator,
      editPermissions: form.editPermissions,
      scheduledPublishDate: form.scheduledPublishDate,
      changeLog: form.changeLog || form.releaseNotes,
      tags
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

    setNotice(form.status === "PUBLISHED" ? "Jogo publicado com sucesso no catálogo e no Launcher!" : "Rascunho salvo com sucesso.");
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
              <span className="text-xs text-zinc-400">Prontidão da Loja:</span>
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
              03&nbsp;&nbsp; Cadastrar novo jogo
            </Link>
            <SideLink href="/dashboard/usuarios">04&nbsp;&nbsp; Equipe e acessos</SideLink>
          </nav>

          <div className="mt-8 hidden rounded-2xl border border-[#29292F] bg-[#12141D] p-4 md:block">
            <p className="text-xs font-black text-white">Loja & Launcher</p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              O formulário é estruturado em 6 etapas completas: Básico, Mídia, Download, Idiomas, Publicação e Comunidade.
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
                  RenPlay Admin &bull; Cadastro Oficial de Jogos
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {stepsList[step - 1].category}: {stepsList[step - 1].title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  {stepsList[step - 1].description}. Siga as etapas para sincronizar sua obra com o banco Neon e o Launcher.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#29292F] bg-[#12141D] px-4 py-2.5 text-xs text-zinc-400">
                  <span className="font-black text-[#FFDE00]">Etapa {step}</span> de 6
                </div>
              </div>
            </div>

            {/* Stepper das 6 Categorias */}
            <StepNav currentStep={step} onSelectStep={setStep} />

            {/* Formulário Principal */}
            <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                {/* ETAPA 1: INFORMAÇÕES BÁSICAS */}
                {step === 1 && (
                  <Step1Identity
                    name={form.name}
                    developer={form.developer}
                    genre={form.genre}
                    category={form.category}
                    classification={form.classification}
                    engine={form.engine}
                    customEngine={form.customEngine}
                    shortDescription={form.shortDescription}
                    fullDescription={form.fullDescription}
                    tags={tags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    onAddTag={addTag}
                    onRemoveTag={removeTag}
                    onUpdate={update}
                  />
                )}

                {/* ETAPA 2: IMAGENS E MÍDIA */}
                {step === 2 && (
                  <Step4Gallery
                    gameIcon={form.gameIcon}
                    horizontalBanner={form.horizontalBanner}
                    mainCover={form.mainCover}
                    trailerUrl={form.trailerUrl}
                    screenshots={form.screenshots}
                    bannerMode={bannerMode}
                    profileMode={profileMode}
                    coverMode={coverMode}
                    onSetBannerMode={setBannerMode}
                    onSetProfileMode={setProfileMode}
                    onSetCoverMode={setCoverMode}
                    onUpdate={update}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {/* ETAPA 3: DOWNLOAD E INSTALAÇÃO */}
                {step === 3 && (
                  <Step5Files
                    version={form.version}
                    platforms={platforms}
                    platformOptions={platformOptions}
                    downloadUrl={form.downloadUrl}
                    mainFileName={form.mainFileName}
                    fileSize={form.fileSize}
                    sha256={form.sha256}
                    systemRequirements={form.systemRequirements}
                    onTogglePlatform={togglePlatform}
                    onUpdate={update}
                    onUpdateRequirements={updateRequirements}
                  />
                )}

                {/* ETAPA 4: IDIOMAS E TRADUÇÕES */}
                {step === 4 && (
                  <Step3LanguagesTags
                    languages={languages}
                    setLanguages={setLanguages}
                    languageInput={languageInput}
                    setLanguageInput={setLanguageInput}
                    onAddLanguage={addLanguage}
                    translationStatus={form.translationStatus}
                    translatedBy={form.translatedBy}
                    translationNotes={form.translationNotes}
                    onUpdate={update}
                  />
                )}

                {/* ETAPA 5: PUBLICAÇÃO E DESTAQUE */}
                {step === 5 && (
                  <Step2Information
                    status={form.status}
                    originalReleaseDate={form.originalReleaseDate}
                    renplayPublishDate={form.renplayPublishDate}
                    featuredOrder={form.featuredOrder}
                    releaseNotes={form.releaseNotes}
                    responsibleDev={form.responsibleDev}
                    editPermissions={form.editPermissions}
                    onUpdate={update}
                  />
                )}

                {/* ETAPA 6: COMUNIDADE E PRÉ-VISUALIZAÇÃO */}
                {step === 6 && (
                  <Step6Launch
                    readiness={readiness}
                    completedCount={completedCount}
                    progressPercent={progressPercent}
                    status={form.status}
                    onUpdate={update}
                  />
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
                        Próxima etapa: {stepsList[step].title} <Icon name="arrow" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FFDE00] px-6 py-3 text-xs font-black text-black hover:bg-[#ffe84d] disabled:opacity-60"
                      >
                        <Icon name="rocket" />
                        {saving ? "Salvando..." : form.status === "PUBLISHED" ? "Concluir e publicar na loja" : "Salvar rascunho"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ASIDE: LIVE PREVIEW NA VITRINE */}
              <PublishLivePreview
                name={form.name}
                developer={form.developer}
                genre={form.genre}
                engine={form.engine === "Outra" ? form.customEngine || "Outro" : form.engine}
                classification={form.classification}
                version={form.version}
                fileSize={form.fileSize}
                platforms={platforms}
                languages={languages}
                translationStatus={form.translationStatus}
                tags={tags}
                status={form.status}
                shortDescription={form.shortDescription}
                horizontalBanner={form.horizontalBanner}
                gameIcon={form.gameIcon}
                mainCover={form.mainCover}
                screenshots={screenshots}
              />
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
