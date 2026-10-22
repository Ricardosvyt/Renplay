"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RecuperarContent() {
  const searchParams = useSearchParams();
  const rawCode = (searchParams.get("code") || "").trim();
  const rawEmail = (searchParams.get("email") || "").trim();

  const isCodeValid = /^\d{6}$/.test(rawCode);
  const isEmailValid = rawEmail.includes("@") && rawEmail.length <= 254;

  const deepLinkUrl = isCodeValid
    ? `renplay://reset-password?code=${rawCode}${isEmailValid ? `&email=${encodeURIComponent(rawEmail)}` : ""}`
    : "";

  const webVerifyUrl = isCodeValid
    ? `/verify-reset-code?code=${rawCode}${isEmailValid ? `&email=${encodeURIComponent(rawEmail)}` : ""}`
    : "/forgot-password";

  const [hasPrompted, setHasPrompted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function triggerLauncherOpen() {
    if (!deepLinkUrl) return;
    try {
      // Trigger via window.location.assign to provoke browser's "Abrir RenPlay?" permission modal
      window.location.assign(deepLinkUrl);
    } catch {
      // Fallback to iframe if blocked
      if (iframeRef.current) {
        iframeRef.current.src = deepLinkUrl;
      }
    }
  }

  useEffect(() => {
    if (isCodeValid && !hasPrompted) {
      setHasPrompted(true);
      // Immediate trigger on mount to invoke the browser's "Abrir RenPlay?" permission dialog
      const timer = setTimeout(() => {
        triggerLauncherOpen();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isCodeValid, hasPrompted, deepLinkUrl]);

  return (
    <main className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Hidden iframe for protocol invocation without navigation flash */}
      <iframe ref={iframeRef} className="hidden" aria-hidden="true" />

      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[320px] bg-[#FFDE00]/5 blur-[130px] pointer-events-none rounded-full" />

      {/* Card Container */}
      <div className="w-full max-w-md bg-[#11131C] border border-[#202434] rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Gold Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FFE54D] via-[#FFDE00] to-[#D4A000]" />

        <div className="p-8 text-center">
          {/* Official Site Logo */}
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
              {/* Animated Radar Icon */}
              <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#FFDE00]/10 border border-[#FFDE00]/30 animate-ping opacity-75" />
                <div className="relative w-14 h-14 rounded-full bg-[#181B27] border border-[#FFDE00]/40 flex items-center justify-center text-[#FFDE00] text-2xl shadow-lg shadow-[#FFDE00]/10">
                  <svg className="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                Abrindo o RenPlay…
              </h1>

              <p className="text-sm text-slate-300 mb-2 leading-relaxed">
                Clique em <strong className="text-[#FFDE00]">"Abrir RenPlay"</strong> na janela de permissão que o navegador exibiu no topo.
              </p>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                O aplicativo abrirá diretamente na tela para criar sua nova senha.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={triggerLauncherOpen}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-b from-[#FFE54D] via-[#FFDE00] to-[#D4A000] text-[#080A0F] font-bold text-sm tracking-wide shadow-lg shadow-[#FFDE00]/25 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Abrir Launcher Novamente
                </button>

                <Link
                  href={webVerifyUrl}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors text-center"
                >
                  Não tem o launcher ou está no celular? Redefinir pelo navegador
                </Link>
              </div>

              {/* Expiration Hint */}
              <div className="mt-6 pt-4 border-t border-[#1C1F2D] text-center">
                <span className="text-[11px] text-slate-500">
                  ⏱ Este link é seguro e expira em 10 minutos.
                </span>
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
