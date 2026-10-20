"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ============================================================== */
/* ÍCONES VETORIAIS PROFISSIONAIS (SVG)                           */
/* ============================================================== */
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function InfoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ImageIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShieldCogIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  );
}

function WindowsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

function AndroidIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1s-3.5902.3116-5.1368.8497L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.152.5676l1.9972 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
    </svg>
  );
}

function LinuxIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M7 8l3 3-3 3" />
      <line x1="12" y1="14" x2="16" y2="14" />
    </svg>
  );
}

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-.93.04-2.07.63-2.73 1.4-.58.67-1.08 1.76-.94 2.83 1.04.08 2.1-.51 2.73-1.29z" />
    </svg>
  );
}

function SaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function RocketIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function LightbulbIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function TrashIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const STEPS = [
  { id: 1, key: "info", title: "1. Informações", subtitle: "Dados essenciais do jogo", icon: InfoIcon },
  { id: 2, key: "languages", title: "2. Idiomas", subtitle: "Tradução e localizações", icon: GlobeIcon },
  { id: 3, key: "media", title: "3. Imagens", subtitle: "Ícone, capas e screenshots", icon: ImageIcon },
  { id: 4, key: "files", title: "4. Arquivos", subtitle: "Arquivo para download", icon: DownloadIcon },
  { id: 5, key: "admin", title: "5. Publicação", subtitle: "Status, equipe e agendamento", icon: ShieldCogIcon },
];

const PLATFORMS_DATA = [
  { id: "Windows", name: "Windows", icon: WindowsIcon },
  { id: "Android", name: "Android", icon: AndroidIcon },
  { id: "Linux", name: "Linux", icon: LinuxIcon },
  { id: "macOS", name: "macOS", icon: AppleIcon },
  { id: "Web Browser", name: "Web Browser", icon: GlobeIcon },
];

export default function PublishGamePage() {
  const router = useRouter();

  // Etapa ativa do assistente (1 a 5)
  const [activeStep, setActiveStep] = useState(1);

  /* ============================================================== */
  /* 1. INFORMAÇÕES DO JOGO                                         */
  /* ============================================================== */
  const [name, setName] = useState("Tokyo Memories: Destino");
  const [shortDescription, setShortDescription] = useState(
    "Uma emocionante visual novel sobre escolhas do destino e reencontros em Tokyo."
  );
  const [fullDescription, setFullDescription] = useState(
    "Após 7 anos distante, Haruto retorna a Tokyo para reconstruir os laços com seus amigos de infância. Ao longo de 8 capítulos intensos com mais de 10 desfechos possíveis, cada escolha redefine o rumo da narrativa."
  );
  const [developer, setDeveloper] = useState("Studio Sakura");
  const [publisher, setPublisher] = useState("RenPlay Publishing");
  const [genre, setGenre] = useState("Visual Novel");
  const [category, setCategory] = useState("Romance / Drama");
  const [tags, setTags] = useState<string[]>(["Anime", "Múltiplos Finais", "História Rica", "Decisões Importantes"]);
  const [tagInput, setTagInput] = useState("");
  const [originalReleaseDate, setOriginalReleaseDate] = useState("2025-11-14");
  const [renplayPublishDate, setRenplayPublishDate] = useState("2026-02-20");
  const [lastUpdateDate, setLastUpdateDate] = useState("2026-03-01");
  const [currentVersion, setCurrentVersion] = useState("1.2.0");
  const [platforms, setPlatforms] = useState<string[]>(["Windows", "Android"]);

  /* ============================================================== */
  /* 2. IDIOMAS E TRADUÇÕES                                         */
  /* ============================================================== */
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    "Português (Brasil)",
    "Inglês",
    "Japonês",
  ]);
  const [newLanguageInput, setNewLanguageInput] = useState("");
  const [translatedBy, setTranslatedBy] = useState("Equipe Oficial RenPlay PT-BR");

  /* ============================================================== */
  /* 3. IMAGENS E MÍDIAS                                            */
  /* ============================================================== */
  const [gameIcon, setGameIcon] = useState("/images/so-much-to-love-cover.jpg");
  const [mainCover, setMainCover] = useState("/images/so-much-to-love-cover.jpg");
  const [horizontalBanner, setHorizontalBanner] = useState("/images/so-much-to-love-01.jpg");
  const [screenshots, setScreenshots] = useState<string[]>([
    "/images/so-much-to-love-01.jpg",
    "/images/so-much-to-love-02.webp",
    "/images/so-much-to-love-03.webp",
  ]);
  const [newScreenshotInput, setNewScreenshotInput] = useState("");
  const [activePreviewImage, setActivePreviewImage] = useState(0);

  /* ============================================================== */
  /* 4. ARQUIVOS E DOWNLOADS                                        */
  /* ============================================================== */
  const [mainFileName, setMainFileName] = useState("TokyoMemories_v1.2.0_PTBR.rar");
  const [fileSize, setFileSize] = useState("480 MB");
  const [fileVersion, setFileVersion] = useState("1.2.0");

  /* ============================================================== */
  /* 6. ADMINISTRAÇÃO E PUBLICAÇÃO                                  */
  /* ============================================================== */
  const [responsibleDev, setResponsibleDev] = useState("Renato Sakura");
  const [responsibleTranslator, setResponsibleTranslator] = useState("Thatty Hentai");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "publicado" | "oculto">("publicado");
  const [editPermissions, setEditPermissions] = useState<"admin_only" | "dev_trans" | "all_team">("dev_trans");
  const [changeLog, setChangeLog] = useState("Correções ortográficas no capítulo 4 e adição de novas ilustrações de fundo.");
  const [scheduledPublishDate, setScheduledPublishDate] = useState("2026-03-10T14:00");

  // Estado da UI
  const [previewTab, setPreviewTab] = useState<"store" | "launcher">("store");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  /* ============================================================== */
  /* HANDLERS & HELPERS                                             */
  /* ============================================================== */
  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleAddLanguage = () => {
    if (newLanguageInput.trim() && !availableLanguages.includes(newLanguageInput.trim())) {
      setAvailableLanguages([...availableLanguages, newLanguageInput.trim()]);
      setNewLanguageInput("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setAvailableLanguages(availableLanguages.filter((l) => l !== lang));
  };

  const handleAddScreenshot = () => {
    if (newScreenshotInput.trim()) {
      setScreenshots([...screenshots, newScreenshotInput.trim()]);
      setNewScreenshotInput("");
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
    if (activePreviewImage >= screenshots.length - 1) {
      setActivePreviewImage(Math.max(0, screenshots.length - 2));
    }
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);
    }
  };

  const handleSaveDraft = () => {
    setToastNotice("Rascunho salvo com sucesso no banco de dados!");
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setToastNotice("Visual Novel cadastrada e publicada com sucesso no RenPlay!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }, 800);
  };

  // Cálculo de progresso de preenchimento
  const calculateProgress = () => {
    let score = 0;
    if (name && shortDescription && developer) score += 20;
    if (availableLanguages.length > 0 && translatedBy) score += 20;
    if (mainCover && horizontalBanner) score += 20;
    if (mainFileName && fileSize) score += 20;
    if (responsibleDev && status) score += 20;
    return score;
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F5F5] font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-[#FFDE00] selection:text-black">
      {/* ============================================================== */}
      {/* CAMADAS DE AMBIENTAÇÃO CIBERNÉTICA ESTILO TELA DE LOGIN        */}
      {/* ============================================================== */}
      {/* 1. Grid Cibernético com Máscara Radial Suave */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 222, 0, 0.08) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255, 222, 0, 0.08) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
        }}
      />

      {/* 2. Orbs Luminosos Vivos com Derivação Orgânica */}
      <div className="fixed -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-[110px] pointer-events-none animate-ambient-drift-1 bg-gradient-to-br from-[#FFDE00]/15 via-amber-500/10 to-transparent z-0" />
      <div className="fixed -bottom-40 -left-28 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none animate-ambient-drift-2 bg-gradient-to-tr from-amber-600/14 via-[#FFDE00]/10 to-transparent z-0" />

      {/* 3. Feixe de Luz Angular Holográfico */}
      <div className="fixed -top-32 -left-20 w-[720px] h-36 bg-gradient-to-r from-transparent via-[#FFDE00]/8 to-transparent transform -rotate-45 blur-2xl pointer-events-none animate-ray-scan z-0" />

      {/* 4. Partículas Douradas e Brasas Flutuantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute left-[12%] bottom-[20%] w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_10px_#FFDE00] animate-ember-1" />
        <span className="absolute left-[38%] bottom-[35%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-ember-2" />
        <span className="absolute right-[14%] bottom-[25%] w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_12px_#FFDE00] animate-ember-3" />
        <span className="absolute right-[32%] top-[30%] w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#FFDE00] animate-ember-4" />
        <span className="absolute left-[8%] top-[35%] text-[#FFDE00] text-sm font-black select-none drop-shadow-[0_0_8px_rgba(255,222,0,0.85)] animate-pulse">✦</span>
        <span className="absolute right-[22%] top-[18%] text-amber-300 text-xs font-black select-none drop-shadow-[0_0_6px_rgba(255,222,0,0.7)] animate-pulse" style={{ animationDelay: "1.8s" }}>✦</span>
      </div>

      {/* ============================================================== */}
      {/* HEADER SUPERIOR COM ESTILO LOGIN                               */}
      {/* ============================================================== */}
      <header className="border-b border-[#1B1D27] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 transition-all cursor-pointer"
            >
              <ArrowLeftIcon />
              <span>Painel</span>
            </Link>

            <span className="text-zinc-700 font-mono hidden sm:inline">/</span>

            {/* Logo Oficial Renplay */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logoaccount.png"
                alt="Renplay"
                className="h-7 w-auto object-contain hidden md:inline"
              />
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30 shadow-[0_0_12px_rgba(255,222,0,0.15)]">
                ESTÚDIO DE CRIAÇÃO
              </span>
              <h1 className="text-sm font-black text-white uppercase tracking-tight hidden lg:inline">
                Cadastrar Visual Novel
              </h1>
            </div>
          </div>

          {/* Ações do Topo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 transition-all cursor-pointer flex items-center gap-2"
            >
              <SaveIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Salvar Rascunho</span>
            </button>

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="py-2 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe53b] text-black shadow-[0_4px_16px_rgba(255,222,0,0.25)] hover:shadow-[0_4px_22px_rgba(255,222,0,0.4)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <span>Publicar no RenPlay</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICAÇÃO TOAST FLUTUANTE */}
      {toastNotice && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#FFDE00] to-amber-400 text-black font-black text-xs shadow-[0_10px_35px_rgba(255,222,0,0.4)] animate-bounce flex items-center gap-2.5 border border-black/10">
          <CheckIcon className="w-4 h-4 text-black stroke-[3]" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* BARRA DE PASSOS DIVIDIDOS (STEPPER PROGRESSIVO WIZARD)         */}
      {/* ============================================================== */}
      <section className="relative z-20 max-w-[1720px] w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="rounded-2xl p-4 bg-[#12141D]/90 border border-[#262B3D] backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-800/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FFDE00]">
                  Etapa {activeStep} de 5
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-semibold text-zinc-300">
                  {STEPS.find((s) => s.id === activeStep)?.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Preencha por partes no seu próprio ritmo. As alterações são sincronizadas ao vivo no Preview.
              </p>
            </div>

            {/* Barra de Progresso Geral */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                Progresso: <strong className="text-[#FFDE00]">{calculateProgress()}%</strong>
              </span>
              <div className="w-32 sm:w-44 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#FFDE00] transition-all duration-500 rounded-full shadow-[0_0_10px_#FFDE00]"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Abas dos 5 Passos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isPast = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                    isActive
                      ? "bg-[#181B26] border-[#FFDE00] shadow-[0_0_20px_rgba(255,222,0,0.18)]"
                      : isPast
                      ? "bg-[#10121A]/80 border-emerald-500/30 hover:border-emerald-500/60"
                      : "bg-[#0E1017]/60 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {/* Linha dourada superior no ativo */}
                  {isActive && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-colors ${
                      isActive
                        ? "bg-[#FFDE00] text-black shadow-[0_0_10px_rgba(255,222,0,0.5)]"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    {isPast ? <CheckIcon className="w-3.5 h-3.5" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-black tracking-tight truncate ${
                        isActive ? "text-[#FFDE00]" : isPast ? "text-zinc-200" : "text-zinc-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate hidden sm:block">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CORPO PRINCIPAL COM 2 COLUNAS: PASSO ATUAL + LIVE PREVIEW      */}
      {/* ============================================================== */}
      <main className="max-w-[1720px] w-full mx-auto p-4 sm:p-8 flex-1 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============================================================ */}
          {/* COLUNA ESQUERDA: FORMULÁRIO DO PASSO ATIVO                    */}
          {/* ============================================================ */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-6 sm:p-9 relative transition-all duration-300 backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(255,222,0,0.04)]">
              {/* Linha de Destaque Dourada no Topo do Card com Glow Refinado */}
              <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

              {/* ======================================================== */}
              {/* PASSO 1: INFORMAÇÕES DO JOGO                             */}
              {/* ======================================================== */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        SEÇÃO 1 DE 5
                      </span>
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">
                        Informações do Jogo
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Identificação, descrições detalhadas, estúdio, tags e plataformas suportadas.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Nome do Jogo */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Nome do Jogo *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Tokyo Memories: Destino"
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      />
                    </div>

                    {/* Descrição Curta */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Descrição Curta (Vitrine e Cartões) *
                      </label>
                      <input
                        type="text"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Uma breve frase impactante para prender a atenção do jogador"
                        maxLength={160}
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 float-right mt-1">
                        {shortDescription.length}/160 caracteres
                      </span>
                    </div>

                    {/* Descrição Completa */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Descrição Completa (Sinopse e Enredo) *
                      </label>
                      <textarea
                        rows={4}
                        value={fullDescription}
                        onChange={(e) => setFullDescription(e.target.value)}
                        placeholder="Descreva a história, os personagens principais, temas e características marcantes da VN..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none resize-y"
                      />
                    </div>

                    {/* Desenvolvedora e Publicadora */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Desenvolvedora *
                        </label>
                        <input
                          type="text"
                          value={developer}
                          onChange={(e) => setDeveloper(e.target.value)}
                          placeholder="Ex: Studio Sakura"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Publicadora (Publisher) *
                        </label>
                        <input
                          type="text"
                          value={publisher}
                          onChange={(e) => setPublisher(e.target.value)}
                          placeholder="Ex: RenPlay Publishing"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Gênero e Categoria */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Gênero *
                        </label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white transition-all outline-none cursor-pointer"
                        >
                          <option value="Visual Novel">Visual Novel</option>
                          <option value="Otome Game">Otome Game</option>
                          <option value="Kinetic Novel">Kinetic Novel</option>
                          <option value="RPG / Visual Novel">RPG / Visual Novel</option>
                          <option value="Mistério / Investigação">Mistério / Investigação</option>
                          <option value="Terror Psicológico">Terror Psicológico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Categoria *
                        </label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Ex: Romance / Drama / Vida Escolar"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Tags de Busca
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Digite uma tag e pressione Adicionar"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-xs text-white placeholder-zinc-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#FFDE00] hover:text-black text-xs font-bold transition-colors cursor-pointer"
                        >
                          + Adicionar Tag
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-[#181B26] border border-[#2A2F45] text-zinc-300"
                          >
                            #{t}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="text-zinc-500 hover:text-red-400 font-bold ml-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Datas e Versão Atual */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Lançamento Original
                        </label>
                        <input
                          type="date"
                          value={originalReleaseDate}
                          onChange={(e) => setOriginalReleaseDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Publicação RenPlay
                        </label>
                        <input
                          type="date"
                          value={renplayPublishDate}
                          onChange={(e) => setRenplayPublishDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Última Atualização
                        </label>
                        <input
                          type="date"
                          value={lastUpdateDate}
                          onChange={(e) => setLastUpdateDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Versão Atual
                        </label>
                        <input
                          type="text"
                          value={currentVersion}
                          onChange={(e) => setCurrentVersion(e.target.value)}
                          placeholder="v1.0.0"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Plataformas Disponíveis com Ícones SVG */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Plataformas Disponíveis *
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {PLATFORMS_DATA.map((plat) => {
                          const active = platforms.includes(plat.id);
                          const IconComp = plat.icon;
                          return (
                            <button
                              key={plat.id}
                              type="button"
                              onClick={() => togglePlatform(plat.id)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2.5 ${
                                active
                                  ? "bg-[#FFDE00] text-black border-[#FFDE00] shadow-[0_0_12px_rgba(255,222,0,0.3)] font-black"
                                  : "bg-[#0C0D13] border-[#202538] text-zinc-400 hover:border-zinc-600 hover:text-white"
                              }`}
                            >
                              <IconComp className={`w-4 h-4 ${active ? "text-black" : "text-zinc-400"}`} />
                              <span>{plat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PASSO 2: IDIOMAS E TRADUÇÕES                            */}
              {/* ======================================================== */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        SEÇÃO 2 DE 5
                      </span>
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">
                        Idiomas & Traduções
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Configure os idiomas suportados pelo jogo e os créditos da equipe de tradução.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Idiomas Disponíveis */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Idiomas Disponíveis *
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newLanguageInput}
                          onChange={(e) => setNewLanguageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLanguage();
                            }
                          }}
                          placeholder="Ex: Espanhol, Francês, Alemão..."
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-xs text-white placeholder-zinc-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#FFDE00] hover:text-black text-xs font-bold transition-colors cursor-pointer"
                        >
                          + Adicionar Idioma
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181B26] border border-[#2A2F45] text-xs font-semibold text-zinc-200"
                          >
                            <GlobeIcon className="w-3.5 h-3.5 text-[#FFDE00]" />
                            <span>{lang}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(lang)}
                              className="text-zinc-500 hover:text-red-400 font-bold ml-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tradução Feita Por */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Tradução Feita Por *
                      </label>
                      <input
                        type="text"
                        value={translatedBy}
                        onChange={(e) => setTranslatedBy(e.target.value)}
                        placeholder="Nome da equipe, grupo de scan/fansub ou tradutor solo"
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] focus:ring-1 focus:ring-[#FFDE00] text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">
                        Este nome receberá o selo de verificação de tradução oficial na página da RenPlay.
                      </p>
                    </div>

                    {/* Banner Informativo com Ícone SVG */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                      <LightbulbIcon className="w-5 h-5 text-[#FFDE00] shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        No RenPlay, incentivamos o reconhecimento correto aos grupos de tradução parceiros. 
                        O nome configurado acima aparecerá em destaque ao lado da desenvolvedora original na loja.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PASSO 3: IMAGENS E MÍDIAS                                */}
              {/* ======================================================== */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        SEÇÃO 3 DE 5
                      </span>
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">
                        Imagens & Mídias
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Ícone quadrado, capa vertical (poster), banner de cabeçalho e galeria de screenshots.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Ícone, Capa e Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Ícone do Jogo (1:1) */}
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300">
                          Ícone do Jogo (1:1) *
                        </label>
                        <div className="relative aspect-square w-24 h-24 rounded-2xl overflow-hidden border border-[#2A2F45] bg-[#0C0D13]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gameIcon}
                            alt="Ícone"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          value={gameIcon}
                          onChange={(e) => setGameIcon(e.target.value)}
                          placeholder="URL do ícone ou /images/..."
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0D13] border border-[#202538] text-xs text-white outline-none"
                        />
                      </div>

                      {/* Capa Principal (Poster Vertical) */}
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300">
                          Capa Principal (Poster) *
                        </label>
                        <div className="relative aspect-[3/4] w-24 h-32 rounded-2xl overflow-hidden border border-[#2A2F45] bg-[#0C0D13]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mainCover}
                            alt="Capa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          value={mainCover}
                          onChange={(e) => setMainCover(e.target.value)}
                          placeholder="URL da capa vertical"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0D13] border border-[#202538] text-xs text-white outline-none"
                        />
                      </div>

                      {/* Banner Horizontal (16:9) */}
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300">
                          Banner Horizontal (16:9) *
                        </label>
                        <div className="relative aspect-video w-full h-24 rounded-2xl overflow-hidden border border-[#2A2F45] bg-[#0C0D13]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={horizontalBanner}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          value={horizontalBanner}
                          onChange={(e) => setHorizontalBanner(e.target.value)}
                          placeholder="URL do banner horizontal"
                          className="w-full px-3 py-2 rounded-xl bg-[#0C0D13] border border-[#202538] text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Galeria de Screenshots */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300">
                          Galeria de Screenshots ({screenshots.length})
                        </label>
                      </div>

                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newScreenshotInput}
                          onChange={(e) => setNewScreenshotInput(e.target.value)}
                          placeholder="Cole a URL de uma screenshot ou imagem de gameplay"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddScreenshot}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-[#FFDE00] hover:text-black text-xs font-bold transition-colors cursor-pointer"
                        >
                          + Adicionar Imagem
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {screenshots.map((shot, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-video rounded-xl overflow-hidden border border-[#2A2F45] bg-[#0C0D13]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot}
                              alt={`Screenshot ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveScreenshot(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-red-500"
                              title="Remover Screenshot"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PASSO 4: ARQUIVOS E DOWNLOADS                            */}
              {/* ======================================================== */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        SEÇÃO 4 DE 5
                      </span>
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">
                        Arquivos & Downloads
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Configure o pacote principal do jogo para distribuição aos jogadores.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Área de Seleção do Arquivo Principal */}
                    <div className="p-6 rounded-2xl border-2 border-dashed border-[#2A2F45] hover:border-[#FFDE00]/60 bg-[#0C0D13]/70 transition-colors text-center relative group">
                      <input
                        type="file"
                        onChange={handleFileUploadMock}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        id="game-file-upload"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-[#FFDE00]/10 text-[#FFDE00] flex items-center justify-center mx-auto mb-3 border border-[#FFDE00]/30 group-hover:scale-110 transition-transform">
                        <DownloadIcon className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        Selecione ou Arraste o Arquivo Principal (.zip / .rar / .7z / .exe)
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Arquivo atual detectado: <strong className="text-[#FFDE00]">{mainFileName}</strong>
                      </p>
                    </div>

                    {/* Especificação Manual de Tamanho e Versão */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Tamanho do Arquivo *
                        </label>
                        <input
                          type="text"
                          value={fileSize}
                          onChange={(e) => setFileSize(e.target.value)}
                          placeholder="Ex: 480 MB ou 1.2 GB"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Versão do Arquivo *
                        </label>
                        <input
                          type="text"
                          value={fileVersion}
                          onChange={(e) => setFileVersion(e.target.value)}
                          placeholder="Ex: 1.2.0"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PASSO 5: ADMINISTRAÇÃO E PUBLICAÇÃO                      */}
              {/* ======================================================== */}
              {activeStep === 5 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                        SEÇÃO 5 DE 5
                      </span>
                      <h2 className="text-xl font-black uppercase text-white tracking-tight">
                        Administração & Publicação
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Defina os responsáveis, visibilidade na loja, permissões e data de agendamento.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Desenvolvedor e Tradutor Responsável */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Desenvolvedor Responsável *
                        </label>
                        <input
                          type="text"
                          value={responsibleDev}
                          onChange={(e) => setResponsibleDev(e.target.value)}
                          placeholder="Responsável pelo build/código"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                          Tradutor Responsável *
                        </label>
                        <input
                          type="text"
                          value={responsibleTranslator}
                          onChange={(e) => setResponsibleTranslator(e.target.value)}
                          placeholder="Responsável pela revisão textual"
                          className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Status de Publicação */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                        Status de Publicação *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { id: "rascunho", label: "Rascunho", desc: "Apenas você vê", color: "border-zinc-700 text-zinc-300" },
                          { id: "revisao", label: "Em Revisão", desc: "Aguardando equipe", color: "border-amber-500 text-amber-400" },
                          { id: "publicado", label: "Publicado", desc: "Ao vivo na loja", color: "border-emerald-500 text-emerald-400" },
                          { id: "oculto", label: "Oculto", desc: "Inativo na vitrine", color: "border-red-500 text-red-400" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setStatus(item.id as typeof status)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              status === item.id
                                ? `bg-[#181B26] ${item.color} ring-1 ring-[#FFDE00] shadow-[0_0_15px_rgba(255,222,0,0.2)]`
                                : "bg-[#0C0D13] border-[#202538] text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            <span className="block text-xs font-black uppercase tracking-tight">
                              {item.label}
                            </span>
                            <span className="block text-[10px] text-zinc-500 mt-0.5">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Permissões de Edição */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Permissões de Edição *
                      </label>
                      <select
                        value={editPermissions}
                        onChange={(e) => setEditPermissions(e.target.value as typeof editPermissions)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white outline-none cursor-pointer"
                      >
                        <option value="admin_only">Apenas Administradores do RenPlay</option>
                        <option value="dev_trans">Desenvolvedor e Tradutor Responsáveis</option>
                        <option value="all_team">Toda a equipe do estúdio</option>
                      </select>
                    </div>

                    {/* Data de Publicação Agendada */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Data de Publicação Agendada
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledPublishDate}
                        onChange={(e) => setScheduledPublishDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white outline-none"
                      />
                    </div>

                    {/* Histórico de Alterações (Changelog) */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                        Histórico de Alterações (Changelog da Versão)
                      </label>
                      <textarea
                        rows={3}
                        value={changeLog}
                        onChange={(e) => setChangeLog(e.target.value)}
                        placeholder="Ex: Correção de bugs, novas opções de finais, otimização para Android..."
                        className="w-full px-4 py-3 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-sm text-white outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* BOTÕES DE NAVEGAÇÃO ENTRE PASSOS (ANTERIOR / PRÓXIMO)    */}
              {/* ======================================================== */}
              <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ArrowLeftIcon />
                    <span>Passo Anterior</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <SaveIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Salvar Rascunho</span>
                  </button>

                  {activeStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                      className="px-6 py-2.5 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black text-xs font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(255,222,0,0.25)] hover:shadow-[0_4px_22px_rgba(255,222,0,0.4)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Avançar para Passo {activeStep + 1}</span>
                      <ArrowRightIcon />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#FFDE00] hover:from-emerald-300 hover:to-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Finalizando...</span>
                        </>
                      ) : (
                        <>
                          <RocketIcon className="w-4 h-4 text-black" />
                          <span>Concluir & Publicar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUNA DIREITA: LIVE PREVIEW ESTILIZADO EM TEMPO REAL        */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="rounded-3xl p-6 relative transition-all duration-300 backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(255,222,0,0.04)]">
              {/* Linha Dourada de Topo */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

              {/* Cabeçalho do Preview */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Live Preview em Tempo Real
                  </h3>
                </div>

                <div className="flex bg-[#0C0D13] p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("store")}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      previewTab === "store"
                        ? "bg-[#FFDE00] text-black font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Página da Loja
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("launcher")}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      previewTab === "launcher"
                        ? "bg-[#FFDE00] text-black font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Card da Vitrine
                  </button>
                </div>
              </div>

              {/* PREVIEW: MODO PÁGINA DA LOJA */}
              {previewTab === "store" && (
                <div className="space-y-4">
                  {/* Banner de Topo com Efeito Glass e Capa Sobreposta */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#262B3D] bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={horizontalBanner}
                      alt="Banner Preview"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141D] via-[#12141D]/40 to-transparent" />

                    {/* Capa e Título Sobrepostos */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                      <div className="w-16 h-22 rounded-xl overflow-hidden border-2 border-[#FFDE00]/60 shrink-0 shadow-lg bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mainCover}
                          alt="Capa Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#FFDE00] px-1.5 py-0.5 rounded bg-black/60 border border-[#FFDE00]/30">
                          {genre}
                        </span>
                        <h4 className="text-sm font-black text-white truncate mt-1 drop-shadow">
                          {name || "Título da Visual Novel"}
                        </h4>
                        <p className="text-[10px] text-zinc-300 truncate">
                          Por {developer || "Desenvolvedor"} • {publisher}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Screenshots interativas */}
                  {screenshots.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshots[activePreviewImage] || screenshots[0]}
                          alt="Screenshot Principal"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {screenshots.map((shot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePreviewImage(idx)}
                            className={`w-14 h-9 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                              activePreviewImage === idx
                                ? "border-[#FFDE00] scale-105"
                                : "border-zinc-800 opacity-60 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Descrição Curta & Metadados */}
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {shortDescription || "Breve descrição do enredo aparecerá aqui..."}
                  </p>

                  {/* Metadados Técnicos em Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-[#0C0D13] border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block">Tradução:</span>
                      <span className="text-amber-400 font-bold truncate block">{translatedBy}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Tamanho:</span>
                      <span className="text-white font-mono font-bold block">{fileSize} ({fileVersion})</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Idiomas:</span>
                      <span className="text-zinc-300 truncate block">
                        {availableLanguages.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Status:</span>
                      <span className="text-emerald-400 font-bold uppercase block">{status}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#181B26] border border-zinc-800 text-zinc-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Botão de Download Simulado */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 rounded-xl bg-[#FFDE00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,222,0,0.25)]"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span>Baixar Jogo ({fileSize})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PREVIEW: MODO CARD DA VITRINE */}
              {previewTab === "launcher" && (
                <div className="max-w-[280px] mx-auto space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-[#262B3D] bg-[#0C0D13] shadow-xl group">
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainCover}
                        alt="Capa Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/80 text-[#FFDE00] border border-[#FFDE00]/40 backdrop-blur-md">
                        {genre}
                      </span>
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {platforms.map((p) => {
                          const IconComp =
                            p === "Windows"
                              ? WindowsIcon
                              : p === "Android"
                              ? AndroidIcon
                              : p === "Linux"
                              ? LinuxIcon
                              : p === "macOS"
                              ? AppleIcon
                              : GlobeIcon;

                          return (
                            <span
                              key={p}
                              className="p-1 rounded bg-black/80 text-zinc-300 border border-zinc-700 flex items-center justify-center"
                              title={p}
                            >
                              <IconComp className="w-3 h-3 text-[#FFDE00]" />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <h4 className="text-xs font-black text-white truncate">
                        {name || "Nome da VN"}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {developer || "Estúdio"} • {translatedBy}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px]">
                        <span className="font-mono text-zinc-400">{fileSize}</span>
                        <span className="text-[#FFDE00] font-black uppercase">Instalar</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 text-center">
                    Visualização de como o jogo aparecerá na grade de jogos do Launcher RenPlay.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
