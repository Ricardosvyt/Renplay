"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ============================================================== */
/* ÍCONES VETORIAIS PROFISSIONAIS (SVG)                           */
/* ============================================================== */
function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function ShieldCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CloudIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function SparkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("renplay_theme") !== "light";
    }
    return true;
  });
  const closedEyeRef = useRef<HTMLImageElement>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Piscada natural usando as duas PNGs originais, sem alterar suas cores ou transparência.
  useEffect(() => {
    const preload = new Image();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let active = true;

    const wait = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const setClosed = (closed: boolean) => {
      if (closedEyeRef.current) {
        closedEyeRef.current.style.opacity = closed ? "1" : "0";
      }
    };

    const blink = (doubleBlink = false) => {
      if (!active) return;

      // Fechamento rápido, pequena pausa e abertura gradual.
      setClosed(true);
      wait(() => {
        if (!active) return;
        setClosed(false);

        if (doubleBlink) {
          wait(() => blink(false), 170);
        } else {
          scheduleNextBlink();
        }
      }, 105);
    };

    const scheduleNextBlink = () => {
      if (!active) return;
      // Pessoas piscam em intervalos irregulares, geralmente entre 2,8 e 6,8 segundos.
      const delay = 2800 + Math.random() * 4000;
      wait(() => blink(Math.random() < 0.16), delay);
    };

    preload.onload = () => {
      if (!active) return;
      const decoded = preload.decode ? preload.decode() : Promise.resolve();
      void decoded.catch(() => undefined).finally(() => {
        if (active) scheduleNextBlink();
      });
    };
    preload.src = "/Rina_closed_eyes.png";

    return () => {
      active = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  // Sincroniza tema com localStorage e classe .dark
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("renplay_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("renplay_theme", "light");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha o e-mail/usuário e a senha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setErrorMessage(data.error || "Não foi possível iniciar a sessão.");
        return;
      }

      setSuccess(true);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Não foi possível conectar ao servidor. Verifique se o banco de dados está configurado e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 select-none overflow-x-hidden ${
        isDark ? "bg-[#090A0F] text-[#F5F5F5]" : "bg-[#F7F8FA] text-[#121212]"
      }`}
    >
      {/* Top Header */}
      <header
        className={`border-b px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark ? "bg-[#090A0F]/90 border-[#1B1D27]" : "bg-white/95 border-zinc-200/80 shadow-xs"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Oficial Renplay Account */}
            <Link href="/" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logoaccount.png"
                alt="Renplay Account"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Link Rápido de Retorno */}
            <Link
              href="/"
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                isDark
                  ? "text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                  : "text-zinc-600 hover:text-black border-zinc-200 hover:border-zinc-300 bg-zinc-100/60"
              }`}
            >
              <ArrowLeftIcon />
              <span>Início</span>
            </Link>
          </div>

          {/* Botão Modo Escuro / Claro (Amarelo & Preto) */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            aria-pressed={!isDark}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-[#141620] text-[#FFDE00] border-[#FFDE00]/40 hover:border-[#FFDE00] shadow-[0_2px_8px_rgba(255,222,0,0.15)]"
                : "bg-[#FFD200] text-black border-black/80 hover:bg-[#FFE033] shadow-sm"
            }`}
            title="Alternar Modo Escuro / Claro"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">{isDark ? "Modo Claro" : "Modo Escuro"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CORPO PRINCIPAL COM DIVISÃO DIAGONAL                           */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* ============================================================ */}
        {/* LADO ESQUERDO: IMAGEM COM CORTE DIAGONAL E STUDIO LIGHTING   */}
        {/* ============================================================ */}
        <div
          className={`order-2 lg:order-1 relative w-full lg:w-[56%] min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden flex flex-col justify-center p-6 sm:p-14 z-10 animate-fade-in-up select-none transition-colors duration-300 ${
            isDark
              ? "bg-[#07070A] bg-[radial-gradient(ellipse_at_35%_40%,rgba(255,222,0,0.08),transparent_65%)]"
              : "bg-[#EAECEF] bg-[radial-gradient(ellipse_at_40%_40%,#FFFFFF,#DEE2E8_80%)]"
          }`}
        >
          {/* Grid de Pontos Amarelos Oficiais Renplay (#FFDE00) - ATRÁS DA PERSONAGEM com Dissipação Suave */}
          <div
            className={`absolute inset-0 [background-size:22px_22px] pointer-events-none z-0 transition-all duration-300 ${
              isDark
                ? "bg-[radial-gradient(#FFDE00_1.5px,transparent_1.5px)] opacity-25"
                : "bg-[radial-gradient(#FFDE00_2px,transparent_2px)] opacity-70"
            }`}
            style={{
              maskImage: "linear-gradient(to right, black 72%, transparent 97%)",
              WebkitMaskImage: "linear-gradient(to right, black 72%, transparent 97%)",
            }}
          />

          {/* Sombreamento Natural nas Extremidades */}
          <div
            className={`absolute inset-0 pointer-events-none z-[1] transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-t from-[#07070A]/95 via-transparent to-transparent"
                : "bg-gradient-to-t from-[#EAECEF]/85 via-transparent to-transparent"
            }`}
          />
          <div
            className={`absolute inset-0 pointer-events-none z-[1] transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-r from-[#07070A]/85 via-transparent to-transparent"
                : "bg-gradient-to-r from-[#FFFFFF]/70 via-transparent to-transparent"
            }`}
          />
          {/* Fade Suave na Margem Direita para Integração Perfeita */}
          <div
            className={`absolute inset-y-0 right-0 w-32 pointer-events-none z-[2] transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-r from-transparent via-[#090A10]/60 to-[#090A10]"
                : "bg-gradient-to-r from-transparent via-[#F7F8FA]/60 to-[#F7F8FA]"
            }`}
          />

          {/* Luz Ambiente Dinâmica / Aura Centralizada Atrás da Personagem (Rina) */}
          <div
            className={`absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none z-[2] animate-character-glow transition-colors duration-500 ${
              isDark
                ? "bg-[#FFDE00]/10 right-4 sm:right-16 top-1/4"
                : "bg-amber-400/18 right-4 sm:right-16 top-1/4"
            }`}
          />

          {/* Personagem Anime (Rina) Posicionada à Direita para Deixar Espaço Limpo para o Texto */}
          <div className="absolute inset-x-0 top-3 sm:top-6 -bottom-6 z-10 pointer-events-none overflow-hidden flex items-center justify-end rina-floating-element">
            <div
              aria-hidden="true"
              className="absolute right-[12%] top-[18%] w-[42%] h-[58%] rounded-full bg-[#FFDE00]/10 blur-[80px]"
            />
            {/* PNG base: personagem com os olhos abertos */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Rina_open.png"
              alt="Renplay Visual Artwork - Personagem Anime Rina"
              className="w-full h-full object-cover object-[78%_center] lg:object-[82%_18px] lg:translate-x-12 xl:translate-x-20 pointer-events-none select-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)] drop-shadow-[0_0_35px_rgba(255,222,0,0.22)]"
            />
            {/* PNG sobreposta: apenas os olhos fechados mudam de opacidade */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={closedEyeRef}
              src="/Rina_closed_eyes.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-[78%_center] lg:object-[82%_18px] lg:translate-x-12 xl:translate-x-20 pointer-events-none select-none opacity-0 transition-opacity duration-75"
            />
          </div>

          {/* Conteúdo Textual e Badges com Tipografia Refinada e Largura Controlada (Sem Sobrepor a Rina) */}
          <div className="relative z-20 my-auto py-8 text-center sm:text-left max-w-sm xl:max-w-md">
            {/* Badge de Status */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md border ${
                isDark
                  ? "bg-amber-400/10 text-[#FFDE00] border-[#FFDE00]/30 shadow-[0_0_12px_rgba(255,222,0,0.15)]"
                  : "bg-amber-500/10 text-amber-800 border-amber-500/30 shadow-xs"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FFDE00] animate-pulse" />
              <span>Renplay Account • Ecossistema Oficial</span>
            </div>

            {/* Título Principal de Impacto */}
            <h2
              className={`text-2xl sm:text-4xl xl:text-[42px] font-black uppercase tracking-tight leading-[1.08] transition-colors duration-300 ${
                isDark
                  ? "text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                  : "text-zinc-950 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]"
              }`}
            >
              Sua próxima história <br />
              <span className="bg-gradient-to-r from-[#FFDE00] via-[#FFE54D] to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,222,0,0.3)]">
                começa aqui.
              </span>
            </h2>

            <p
              className={`text-xs sm:text-sm font-medium mt-4 leading-relaxed max-w-[340px] xl:max-w-[380px] transition-colors duration-300 ${
                isDark
                  ? "text-zinc-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                  : "text-zinc-700 drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
              }`}
            >
              Entre para explorar jogos, sincronizar seus saves e acompanhar seus projetos no ecossistema Ren&apos;Py.
            </p>

            {/* Destaques Rápidos em Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-5">
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-1.5 ${
                  isDark
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                    : "bg-white/80 border-zinc-200/80 text-zinc-800 shadow-xs"
                }`}
              >
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#FFDE00]" /> Instalação rápida
              </span>
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-1.5 ${
                  isDark
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                    : "bg-white/80 border-zinc-200/80 text-zinc-800 shadow-xs"
                }`}
              >
                <CloudIcon className="text-[#FFDE00]" /> Saves sincronizados
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LADO DIREITO: FORMULÁRIO COM DESTAQUE TOTAL E ELEGÂNCIA       */}
        {/* ============================================================ */}
        <div
          className={`order-1 lg:order-2 w-full lg:w-[44%] flex items-center justify-center p-5 sm:p-12 z-20 relative animate-slide-in-right transition-colors duration-500 overflow-hidden lg:border-l ${
            isDark
              ? "bg-[#090A10] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#151724_0%,#090A10_85%)] lg:border-white/[0.05]"
              : "bg-[#F7F8FA] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#FFFFFF_0%,#EDF0F5_85%)] lg:border-black/[0.06]"
          }`}
        >
          {/* ========================================================== */}
          {/* CAMADAS DE AMBIENTAÇÃO VISUAL PREMIUM                      */}
          {/* ========================================================== */}

          {/* 1. Grid Cibernético Tecnológico com Máscara Radial Suave */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              isDark ? "opacity-35" : "opacity-45"
            }`}
            style={{
              backgroundImage: isDark
                ? `linear-gradient(to right, rgba(255, 222, 0, 0.08) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(255, 222, 0, 0.08) 1px, transparent 1px)`
                : `linear-gradient(to right, rgba(255, 210, 0, 0.16) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(255, 210, 0, 0.16) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 85%)",
            }}
          />

          {/* 2. Orbs Luminosos Vivos com Derivação Orgânica */}
          <div
            className={`absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full blur-[105px] pointer-events-none animate-ambient-drift-1 transition-colors duration-700 ${
              isDark
                ? "bg-gradient-to-br from-[#FFDE00]/20 via-amber-500/12 to-transparent"
                : "bg-gradient-to-br from-amber-300/40 via-yellow-200/30 to-transparent"
            }`}
          />
          <div
            className={`absolute -bottom-24 -left-20 w-[440px] h-[440px] rounded-full blur-[95px] pointer-events-none animate-ambient-drift-2 transition-colors duration-700 ${
              isDark
                ? "bg-gradient-to-tr from-amber-600/18 via-[#FFDE00]/12 to-transparent"
                : "bg-gradient-to-tr from-yellow-300/35 via-amber-200/25 to-transparent"
            }`}
          />

          {/* 3. Halo de Iluminação Dourada Direta Atrás do Card */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[520px] rounded-full blur-[70px] pointer-events-none animate-pulse-glow transition-colors duration-500 ${
              isDark
                ? "bg-gradient-to-tr from-[#FFDE00]/15 via-amber-500/10 to-[#FFE033]/12"
                : "bg-gradient-to-tr from-amber-400/25 via-yellow-200/25 to-amber-300/20"
            }`}
          />

          {/* 4. Anéis Orbitais Geométricos de Precisão Centralizados */}
          <div
            className={`absolute w-[560px] h-[560px] rounded-full border border-dashed pointer-events-none animate-slow-spin hidden sm:block ${
              isDark ? "border-[#FFDE00]/15" : "border-amber-400/25"
            }`}
          />
          <div
            className={`absolute w-[460px] h-[460px] rounded-full border pointer-events-none animate-reverse-spin hidden sm:block ${
              isDark ? "border-[#FFDE00]/12" : "border-amber-400/20"
            }`}
          />

          {/* 5. Feixe de Luz Angular Holográfico */}
          <div
            className={`absolute -top-32 -left-20 w-[680px] h-36 bg-gradient-to-r from-transparent via-[#FFDE00]/10 to-transparent transform -rotate-45 blur-2xl pointer-events-none animate-ray-scan`}
          />

          {/* 6. Partículas Douradas e Brasas Flutuantes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
            <span className="absolute left-[15%] bottom-[18%] w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_10px_#FFDE00] animate-ember-1" />
            <span className="absolute left-[32%] bottom-[28%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-ember-2" />
            <span className="absolute right-[18%] bottom-[22%] w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_12px_#FFDE00] animate-ember-3" />
            <span className="absolute right-[28%] bottom-[35%] w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#FFDE00] animate-ember-4" />
            <span className="absolute left-[45%] bottom-[12%] w-1.5 h-1.5 rounded-full bg-[#FFDE00] shadow-[0_0_8px_#FFDE00] animate-ember-2" />
            <span className="absolute right-[12%] bottom-[50%] w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_#F59E0B] animate-ember-1" />
            <SparkIcon className="absolute left-[72%] top-[22%] w-3.5 h-3.5 text-[#FFDE00] drop-shadow-[0_0_8px_rgba(255,222,0,0.85)] animate-pulse" />
            <SparkIcon className="absolute left-[20%] top-[28%] w-3 h-3 text-amber-300 drop-shadow-[0_0_6px_rgba(255,222,0,0.7)] animate-pulse" />
          </div>

          {/* ========================================================== */}
          {/* CARD FLUTUANTE COM ALTO CONTRASTE E GLASSMORPHISM          */}
          {/* ========================================================== */}
          <div
            className={`w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative transition-all duration-300 backdrop-blur-2xl z-10 card-floating-element ${
              isDark
                ? "bg-[#12141D]/96 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)] hover:border-[#FFDE00]/35"
                : "bg-white/95 border-2 border-zinc-200/90 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.14),0_10px_30px_-10px_rgba(0,0,0,0.06)] hover:border-zinc-300"
            }`}
          >
            {/* Linha de Destaque Dourada no Topo do Card com Glow Refinado */}
            <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

            {/* Cabeçalho do Card Centralizado */}
            <div className="mb-7 space-y-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logoaccount.png"
                alt="Renplay Account"
                className="h-11 sm:h-12 w-auto mx-auto object-contain drop-shadow-sm mb-3"
              />
              <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
                Iniciar Sessão
              </h1>
              <p className={`text-xs font-semibold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Acesse sua biblioteca de jogos e preferências da conta
              </p>
            </div>

            {success ? (
              <div className="space-y-4 text-center py-6 animate-fade-in-up">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-emerald-400">
                    Sessão Iniciada com Sucesso
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600 font-medium"}`}>
                    Conectado como <strong>{identifier}</strong>.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  <Link
                    href="/"
                    className="btn-epic-primary w-full text-center cursor-pointer font-black"
                  >
                    Ir para o Launcher
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`w-full text-center py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isDark
                        ? "border-[#FFDE00]/40 text-[#FFDE00] hover:bg-[#FFDE00]/10"
                        : "border-black/30 text-black hover:bg-black/5"
                    }`}
                  >
                    Acessar Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                  <div role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
                    {errorMessage}
                  </div>
                )}

                {/* Campo Identificador com Ícone Vetorial */}
                <div className="space-y-1.5 text-center">
                  <label
                    htmlFor="identifier"
                    className={`block text-center text-[11px] font-black uppercase tracking-wider ${
                      isDark ? "text-zinc-400" : "text-zinc-800"
                    }`}
                  >
                    E-mail ou Usuário
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <UserIcon />
                    </span>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="nome@exemplo.com ou usuario"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      className={`w-full py-3.5 pl-11 pr-11 rounded-xl border-2 text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-[#0D0E16] border-[#222533] text-white placeholder-zinc-500 focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15"
                          : "bg-zinc-50 border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-amber-400/20 shadow-xs"
                      }`}
                    />
                  </div>
                </div>

                {/* Campo Senha com Ícone Vetorial & Toggle */}
                <div className="space-y-1.5 text-center">
                  <label
                    htmlFor="password"
                    className={`block text-center text-[11px] font-black uppercase tracking-wider ${
                      isDark ? "text-zinc-400" : "text-zinc-800"
                    }`}
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className={`w-full py-3.5 pl-11 pr-14 rounded-xl border-2 text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        isDark
                          ? "bg-[#0D0E16] border-[#222533] text-white placeholder-zinc-500 focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15"
                          : "bg-zinc-50 border-zinc-300 text-zinc-950 placeholder-zinc-400 focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-amber-400/20 shadow-xs"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold cursor-pointer px-1 py-0.5 rounded transition-colors ${
                        isDark ? "text-zinc-400 hover:text-white" : "text-zinc-700 hover:text-black"
                      }`}
                    >
                      {showPassword ? "OCULTAR" : "VER"}
                    </button>
                  </div>
                  <div className="flex justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => alert("O fluxo de recuperação de senha será disponibilizado em breve.")}
                      className={`text-[11px] font-extrabold cursor-pointer transition-colors ${
                        isDark
                          ? "text-[#FFDE00] hover:underline"
                          : "text-amber-600 hover:text-amber-700 underline"
                      }`}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>

                {/* Lembrar-me Centralizado */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#FFDE00] cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className={`text-xs font-bold cursor-pointer select-none ${
                      isDark ? "text-zinc-400" : "text-zinc-800"
                    }`}
                  >
                    Manter sessão ativa neste dispositivo
                  </label>
                </div>

                {/* Botão de Entrar Oficial com Micro-Animação */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-epic-primary w-full mt-3 py-4 rounded-xl cursor-pointer disabled:opacity-60 text-xs tracking-wider flex items-center justify-center gap-2 font-black shadow-md hover:shadow-xl transition-all group ${
                    !isDark ? "border-2 border-black/80" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Iniciando sessão...
                    </span>
                  ) : (
                    <>
                      <span>Entrar Agora</span>
                      <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Selo de Segurança do Card */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold pt-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ambiente Seguro • Renplay Network</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer
        className={`py-4 text-center text-[11px] border-t transition-colors ${
          isDark ? "text-zinc-500 border-zinc-800/80 bg-[#090A0F]" : "text-zinc-600 border-zinc-200/80 bg-white"
        }`}
      >
        © 2026, Renplay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
