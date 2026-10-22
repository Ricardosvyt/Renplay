"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RecuperarContent() {
  const searchParams = useSearchParams();
  const rawCode = (searchParams.get("code") || "").trim();
  const rawEmail = (searchParams.get("email") || "").trim();

  const isCodeValid = /^\d{6}$/.test(rawCode);
  const isEmailValid = rawEmail.includes("@") && rawEmail.length <= 254;

  const [hasAttemptedLaunch, setHasAttemptedLaunch] = useState(false);

  const deepLinkUrl = isCodeValid
    ? `renplay://reset-password?code=${rawCode}${isEmailValid ? `&email=${encodeURIComponent(rawEmail)}` : ""}`
    : "";

  const webVerifyUrl = isCodeValid
    ? `/verify-reset-code?code=${rawCode}${isEmailValid ? `&email=${encodeURIComponent(rawEmail)}` : ""}`
    : "/forgot-password";

  useEffect(() => {
    if (isCodeValid && !hasAttemptedLaunch) {
      setHasAttemptedLaunch(true);
      // Small delay to allow page render before triggering OS protocol prompt
      const timer = setTimeout(() => {
        try {
          window.location.href = deepLinkUrl;
        } catch {
          // Protocol launch ignored or blocked by browser settings
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isCodeValid, deepLinkUrl, hasAttemptedLaunch]);

  return (
    <main className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FFDE00]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#11131C] border border-[#202434] rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Gold Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FFE54D] via-[#FFDE00] to-[#D4A000]" />

        <div className="p-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/Logo.png"
                alt="RenPlay"
                width={170}
                height={58}
                priority
                className="h-auto w-[170px]"
              />
            </Link>
          </div>

          {isCodeValid ? (
            <>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-[#FFDE00] text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-[#FFDE00] animate-pulse" />
                Recuperação de Conta
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                Abrindo o Launcher…
              </h1>

              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Estamos iniciando o <strong>RenPlay Launcher</strong> no seu computador para redefinir sua senha com segurança.
              </p>

              {/* Code Highlight Box */}
              <div className="bg-gradient-to-b from-[#0A0C14] to-[#07080D] border border-[#FFDE00]/50 rounded-xl p-4 mb-6 shadow-inner">
                <span className="text-[10px] font-bold text-[#FFDE00] uppercase tracking-widest block mb-1">
                  Seu Código de 6 Dígitos
                </span>
                <span className="text-3xl font-black tracking-[0.25em] text-white font-mono pl-[0.25em]">
                  {rawCode}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <a
                  href={deepLinkUrl}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-b from-[#FFE54D] via-[#FFDE00] to-[#D4A000] text-[#080A0F] font-bold text-sm tracking-wide shadow-lg shadow-[#FFDE00]/20 hover:brightness-105 active:scale-[0.98] transition-all text-center"
                >
                  Abrir no Launcher RenPlay
                </a>

                <Link
                  href={webVerifyUrl}
                  className="w-full py-3 px-6 rounded-xl bg-[#171A27] hover:bg-[#1E2234] border border-[#262B3F] text-slate-300 font-semibold text-sm transition-all text-center"
                >
                  Continuar pelo Navegador
                </Link>
              </div>

              {/* Security Hint */}
              <div className="mt-6 pt-5 border-t border-[#1C1F2D] text-left">
                <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
                  <span className="text-[#FFDE00] text-sm">⏱</span>
                  <p>
                    Este código expira em <strong>10 minutos</strong>. Se você não solicitou a alteração, ignore este link com tranquilidade.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl">
                ✕
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Código Inválido ou Ausente</h1>
              <p className="text-sm text-slate-400 mb-6">
                O link de recuperação parece incompleto ou expirou. Solicite um novo código para continuar.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 px-6 rounded-xl bg-gradient-to-b from-[#FFE54D] via-[#FFDE00] to-[#D4A000] text-[#080A0F] font-bold text-sm shadow-md hover:brightness-105 transition-all text-center"
              >
                Solicitar Novo Código
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0A0C13] border-t border-[#1A1D2B] py-3.5 px-6 text-center text-xs text-slate-500">
          Equipe RenPlay •{" "}
          <Link href="/" className="text-[#FFDE00] hover:underline font-medium">
            renplay.site
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RecuperarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080B] flex items-center justify-center text-slate-400">
          Carregando…
        </div>
      }
    >
      <RecuperarContent />
    </Suspense>
  );
}
