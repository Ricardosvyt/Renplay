"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Step, ImageInputMode, Status } from "@/components/publish/types";
import { StepNav, stepsList } from "@/components/publish/StepNav";
import { Step1Identity } from "@/components/publish/Step1Identity";
import { Step2Information } from "@/components/publish/Step2Information";
import { Step3LanguagesTags } from "@/components/publish/Step3LanguagesTags";
import { Step4Gallery } from "@/components/publish/Step4Gallery";
import { Step5Files } from "@/components/publish/Step5Files";
import { Step6Launch, ReadinessItem } from "@/components/publish/Step6Launch";
import { PublishLivePreview } from "@/components/publish/PublishLivePreview";

const platformOptions = ["Windows", "Android", "Linux", "macOS", "Web Browser"];

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
    gameIcon: "",
    mainCover: "",
    horizontalBanner: "",
    githubUrl: "",
    screenshots: "",
    downloadUrl: "",
    mainFileName: "",
    fileSize: "",
    fileVersion: "1.0.0",
    responsibleDev: "",
    responsibleTranslator: "",
    editPermissions: "admin_only",
    scheduledPublishDate: "",
    changeLog: "",
    status: "DRAFT" as Status
  });

  const [platforms, setPlatforms] = useState<string[]>(["Windows"]);
  const [tags, setTags] = useState<string[]>(["Visual Novel", "Anime"]);
  const [languages, setLanguages] = useState<string[]>(["Português (Brasil)"]);

  const update = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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

  const addLanguage = () => {
    const clean = languageInput.trim();
    if (!clean) return;
    if (!languages.includes(clean)) setLanguages([...languages, clean]);
    setLanguageInput("");
  };

  const isGithubValid = useMemo(() => {
    if (!form.githubUrl) return false;
    return /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i.test(form.githubUrl.trim());
  }, [form.githubUrl]);

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
      { label: "Banner da Vitrine", ready: Boolean(form.horizontalBanner.trim()), detail: form.horizontalBanner ? "Configurado" : "Pendente" },
      { label: "Perfil do Game", ready: Boolean(form.gameIcon.trim()), detail: form.gameIcon ? "Configurado" : "Opcional" },
      { label: "Repositório GitHub", ready: Boolean(form.githubUrl.trim()), detail: form.githubUrl ? "Vinculado" : "Opcional" },
      { label: "Desenvolvedor", ready: Boolean(form.developer.trim()), detail: form.developer || "Pendente" },
      { label: "Gênero Principal", ready: Boolean(form.genre.trim()), detail: form.genre || "Pendente" },
      { label: "Resumo da Vitrine", ready: Boolean(form.shortDescription.trim()), detail: form.shortDescription ? "Preenchido" : "Pendente" },
      { label: "Capa Principal (Pôster)", ready: Boolean(form.mainCover.trim()), detail: form.mainCover ? "Configurada" : "Pendente" },
      { label: "URL de Download", ready: Boolean(form.downloadUrl.trim()), detail: form.downloadUrl ? "Configurada" : "Pendente" },
      { label: "Plataformas", ready: platforms.length > 0, detail: platforms.join(", ") || "Nenhuma" },
      { label: "Idiomas", ready: languages.length > 0, detail: languages.join(", ") || "Nenhum" },
      { label: "Tags", ready: tags.length > 0, detail: `${tags.length} selecionadas` }
    ],
    [form, platforms, languages, tags]
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
      description: form.shortDescription,
      fullDescription: form.fullDescription,
      developer: form.developer,
      publisher: form.publisher,
      genre: form.genre,
      category: form.category,
      version: form.version,
      originalReleaseDate: form.originalReleaseDate,
      renplayPublishDate: form.renplayPublishDate,
      lastUpdateDate: form.lastUpdateDate,
      translatedBy: form.translatedBy,
      coverImage: form.mainCover || form.gameIcon,
      bannerImage: form.horizontalBanner,
      gameIcon: form.gameIcon,
      githubUrl: form.githubUrl,
      downloadUrl: form.downloadUrl,
      screenshots,
      platforms,
      tags,
      languages,
      status: form.status,
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
                  {stepsList[step - 1].category}: {stepsList[step - 1].title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  {stepsList[step - 1].description}. Siga as etapas abaixo para cadastrar e publicar sua obra com qualidade máxima.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#29292F] bg-[#12141D] px-4 py-2.5 text-xs text-zinc-400">
                  <span className="font-black text-[#FFDE00]">Categoria {step}</span> de 6
                </div>
              </div>
            </div>

            {/* Stepper das 6 Categorias */}
            <StepNav currentStep={step} onSelectStep={setStep} />

            {/* Formulário Principal */}
            <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                {step === 1 && (
                  <Step1Identity
                    name={form.name}
                    horizontalBanner={form.horizontalBanner}
                    gameIcon={form.gameIcon}
                    githubUrl={form.githubUrl}
                    bannerMode={bannerMode}
                    profileMode={profileMode}
                    isGithubValid={isGithubValid}
                    onUpdate={update}
                    onSetBannerMode={setBannerMode}
                    onSetProfileMode={setProfileMode}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {step === 2 && (
                  <Step2Information
                    developer={form.developer}
                    publisher={form.publisher}
                    genre={form.genre}
                    category={form.category}
                    version={form.version}
                    originalReleaseDate={form.originalReleaseDate}
                    shortDescription={form.shortDescription}
                    fullDescription={form.fullDescription}
                    onUpdate={update}
                  />
                )}

                {step === 3 && (
                  <Step3LanguagesTags
                    languages={languages}
                    setLanguages={setLanguages}
                    languageInput={languageInput}
                    setLanguageInput={setLanguageInput}
                    onAddLanguage={addLanguage}
                    translatedBy={form.translatedBy}
                    tags={tags}
                    setTags={setTags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    onAddTag={addTag}
                    onUpdate={update}
                  />
                )}

                {step === 4 && (
                  <Step4Gallery
                    mainCover={form.mainCover}
                    coverMode={coverMode}
                    screenshots={form.screenshots}
                    onSetCoverMode={setCoverMode}
                    onUpdate={update}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {step === 5 && (
                  <Step5Files
                    downloadUrl={form.downloadUrl}
                    mainFileName={form.mainFileName}
                    fileSize={form.fileSize}
                    fileVersion={form.fileVersion}
                    platforms={platforms}
                    platformOptions={platformOptions}
                    onTogglePlatform={togglePlatform}
                    onUpdate={update}
                  />
                )}

                {step === 6 && (
                  <Step6Launch
                    readiness={readiness}
                    completedCount={completedCount}
                    progressPercent={progressPercent}
                    status={form.status}
                    responsibleDev={form.responsibleDev}
                    responsibleTranslator={form.responsibleTranslator}
                    editPermissions={form.editPermissions}
                    scheduledPublishDate={form.scheduledPublishDate}
                    changeLog={form.changeLog}
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
                        Próxima categoria: {stepsList[step].title} <Icon name="arrow" />
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
              <PublishLivePreview
                name={form.name}
                developer={form.developer}
                genre={form.genre}
                version={form.version}
                fileSize={form.fileSize}
                languages={languages}
                tags={tags}
                status={form.status}
                shortDescription={form.shortDescription}
                horizontalBanner={form.horizontalBanner}
                gameIcon={form.gameIcon}
                mainCover={form.mainCover}
                githubUrl={form.githubUrl}
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
