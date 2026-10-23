"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormCardProps {
  isDark: boolean;
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

function SparkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

export function LoginFormCard({ isDark }: LoginFormCardProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage("Por favor, preencha o e-mail/usuário e a senha.");
      return;
    }

    if (cleanIdentifier.length > 254) {
      setErrorMessage("O e-mail ou nome de usuário é muito longo.");
      return;
    }

    if (password.length > 128) {
      setErrorMessage("A senha informada excede o limite permitido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ identifier: cleanIdentifier, password, rememberMe }),
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
      setErrorMessage("Não foi possível conectar ao servidor. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`order-1 lg:order-2 w-full lg:w-[44%] flex items-center justify-center p-5 sm:p-12 z-20 relative animate-slide-in-right transition-colors duration-500 overflow-hidden lg:border-l ${
        isDark
          ? "bg-[#090A10] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#151724_0%,#090A10_85%)] lg:border-white/[0.05]"
          : "bg-[#F7F8FA] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#FFFFFF_0%,#EDF0F5_85%)] lg:border-black/[0.06]"
      }`}
    >
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
        className="absolute -top-32 -left-20 w-[680px] h-36 bg-gradient-to-r from-transparent via-[#FFDE00]/10 to-transparent transform -rotate-45 blur-2xl pointer-events-none animate-ray-scan"
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

      {/* CARD FLUTUANTE COM ALTO CONTRASTE E GLASSMORPHISM */}
      <div
        className={`w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative transition-all duration-300 backdrop-blur-2xl z-10 card-floating-element ${
          isDark
            ? "bg-[#12141D]/96 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)] hover:border-[#FFDE00]/35"
            : "bg-white/95 border-2 border-zinc-200/90 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.14),0_10px_30px_-10px_rgba(0,0,0,0.06)] hover:border-zinc-300"
        }`}
      >
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

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
                  maxLength={254}
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
                  maxLength={128}
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
                <Link
                  href="/forgot-password"
                  className={`text-[11px] font-extrabold cursor-pointer transition-colors ${
                    isDark
                      ? "text-[#FFDE00] hover:underline"
                      : "text-amber-600 hover:text-amber-700 underline"
                  }`}
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

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

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold pt-1">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ambiente Seguro • Renplay Network</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
