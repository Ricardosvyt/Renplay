"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer para expiração (10 minutos = 600s)
  const [expiresIn, setExpiresIn] = useState(600);
  // Cooldown de reenvio (60s)
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Se digitou mais de um caractere (ex: colou ou autofill parcial)
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMessage("Informe o código de 6 dígitos.");
      return;
    }

    if (!email) {
      setErrorMessage("E-mail não informado. Volte à etapa anterior.");
      return;
    }

    if (expiresIn <= 0) {
      setErrorMessage("Código inválido ou expirado.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message || "Não foi possível concluir a verificação. Tente novamente.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Código verificado! Redirecionando para definir nova senha...");
      sessionStorage.setItem("renplay_reset_token", data.resetToken);

      setTimeout(() => {
        router.push(`/reset-password?token=${encodeURIComponent(data.resetToken)}`);
      }, 1200);
    } catch {
      setErrorMessage("Não foi possível concluir a verificação. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setErrorMessage("");
    setSuccessMessage("");
    setResending(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message || "Aguarde antes de solicitar um novo código.");
      } else {
        setSuccessMessage("Novo código enviado com sucesso para o seu e-mail.");
        setResendCooldown(60);
        setExpiresIn(600);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setErrorMessage("Não foi possível solicitar um novo código. Tente novamente.");
    } finally {
      setResending(false);
    }
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)]">
      {/* Barra superior dourada */}
      <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

      {/* Cabeçalho */}
      <div className="mb-7 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-[#FFDE00] mb-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Verificar código
        </h1>
        <p className="text-xs font-semibold text-zinc-400">
          Digite o código de 6 dígitos enviado para <br />
          <strong className="text-zinc-200">{email || "seu e-mail"}</strong>
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Dígitos Visuais */}
        <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading}
              className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-xl border-2 border-[#222533] bg-[#0D0E16] text-[#FFDE00] focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15 outline-none transition-all"
            />
          ))}
        </div>

        {/* Temporizador de Validade */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
          <span>Validade do código:</span>
          <span className={`font-mono font-bold ${expiresIn < 120 ? "text-red-400" : "text-[#FFDE00]"}`}>
            {formatTimer(expiresIn)}
          </span>
        </div>

        {/* Botão de Verificação */}
        <button
          type="submit"
          disabled={loading || digits.join("").length !== 6}
          className="w-full py-3.5 rounded-xl bg-[#FFDE00] hover:bg-[#FFE54D] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(255,222,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <span>Verificar código</span>
          )}
        </button>

        {/* Botão Reenviar Código */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="text-xs font-bold text-zinc-400 hover:text-[#FFDE00] transition-colors disabled:opacity-40 disabled:hover:text-zinc-400 cursor-pointer"
          >
            {resending
              ? "Reenviando..."
              : resendCooldown > 0
              ? `Reenviar código em ${resendCooldown}s`
              : "Reenviar código"}
          </button>

          <Link
            href="/forgot-password"
            className="text-[11px] font-medium text-zinc-500 hover:text-white transition-colors"
          >
            ← Alterar e-mail ou voltar
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function VerifyResetCodePage() {
  return (
    <div className="min-h-screen bg-[#090A10] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#151724_0%,#090A10_85%)] text-white flex flex-col justify-between relative overflow-hidden select-none">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FFDE00]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <header className="p-6 sm:p-8 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
            REN<span className="text-[#FFDE00]">PLAY</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          Voltar ao login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <Suspense fallback={<div className="text-zinc-500 text-xs">Carregando...</div>}>
          <VerifyResetCodeContent />
        </Suspense>
      </main>

      <footer className="py-4 text-center text-[11px] text-zinc-500 border-t border-zinc-800/80 bg-[#090A0F] z-10">
        © 2026, RenPlay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
