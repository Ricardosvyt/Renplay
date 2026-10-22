"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Informe seu endereço de e-mail.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message || "Não foi possível processar a solicitação. Tente novamente.");
        setLoading(false);
        return;
      }

      setInfoMessage(data.message || "Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.");

      // Redireciona para a tela de verificação após 1.5s
      setTimeout(() => {
        router.push(`/verify-reset-code?email=${encodeURIComponent(trimmed)}`);
      }, 1600);
    } catch {
      setErrorMessage("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090A10] bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,#151724_0%,#090A10_85%)] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Luzes decorativas */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FFDE00]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
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

      {/* Conteúdo Central */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)]">
          {/* Barra de destaque superior dourada */}
          <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

          {/* Cabeçalho */}
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-[#FFDE00] mb-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Recuperar sua conta
            </h1>
            <p className="text-xs font-semibold text-zinc-400">
              Informe seu e-mail para receber o código de 6 dígitos
            </p>
          </div>

          {infoMessage ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center space-y-2 animate-fade-in">
              <p>{infoMessage}</p>
              <p className="text-[11px] text-zinc-400">Redirecionando para a verificação do código...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full py-3.5 pl-11 pr-4 rounded-xl border-2 border-[#222533] bg-[#0D0E16] text-white placeholder-zinc-500 text-sm font-semibold focus:outline-none focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#FFDE00] hover:bg-[#FFE54D] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(255,222,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Enviando código...</span>
                  </>
                ) : (
                  <span>Enviar código</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  ← Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="py-4 text-center text-[11px] text-zinc-500 border-t border-zinc-800/80 bg-[#090A0F] z-10">
        © 2026, RenPlay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
