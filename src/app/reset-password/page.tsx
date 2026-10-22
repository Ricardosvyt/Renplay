"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") || "";

  const [resetToken, setResetToken] = useState(queryToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryToken) {
      setResetToken(queryToken);
    } else if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("renplay_reset_token");
      if (stored) setResetToken(stored);
    }
  }, [queryToken]);

  const length = Array.from(password).length;
  const isMinLength = length >= 12;
  const isMaxLength = length <= 128 && length > 0;
  const isMatch = password.length > 0 && password === confirmPassword;

  // Cálculo básico visual de força (0 a 4)
  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Excelente"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#FFDE00"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!resetToken) {
      setErrorMessage("Autorização de redefinição ausente. Solicite um novo código de recuperação.");
      return;
    }

    if (length < 12) {
      setErrorMessage("Sua senha deve ter pelo menos 12 caracteres.");
      return;
    }

    if (length > 128) {
      setErrorMessage("Sua senha pode ter no máximo 128 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message || "Não foi possível alterar a senha. Tente novamente.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem("renplay_reset_token");
    } catch {
      setErrorMessage("Não foi possível conectar ao servidor. Tente novamente.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-white">Senha Redefinida!</h2>
          <p className="text-xs text-zinc-300 font-medium leading-relaxed">
            Sua senha foi atualizada com sucesso e todas as sessões anteriores foram encerradas por segurança.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full py-3.5 rounded-xl bg-[#FFDE00] hover:bg-[#FFE54D] text-black text-xs font-black uppercase tracking-wider transition-all justify-center items-center shadow-[0_4px_16px_rgba(255,222,0,0.3)]"
        >
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] rounded-3xl p-8 sm:p-10 relative backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,222,0,0.05)]">
      <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

      <div className="mb-7 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-[#FFDE00] mb-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Criar nova senha
        </h1>
        <p className="text-xs font-semibold text-zinc-400">
          Escolha uma senha forte com pelo menos 12 caracteres
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nova Senha */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-zinc-400">
            <label htmlFor="new-password">Nova Senha</label>
            <span className={`text-[10px] ${length > 128 ? "text-red-400" : "text-zinc-500"}`}>
              {length}/128 caracteres
            </span>
          </div>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              maxLength={128}
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full py-3.5 pl-4 pr-16 rounded-xl border-2 border-[#222533] bg-[#0D0E16] text-white placeholder-zinc-500 text-sm font-semibold focus:outline-none focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 hover:text-white uppercase transition-colors px-1 py-0.5 cursor-pointer"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Barra de Força da Senha */}
        {password.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="h-full flex-1 transition-all duration-300"
                  style={{
                    backgroundColor:
                      strength > step ? strengthColors[strength] : "transparent",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
              <span>Força: {strengthLabels[strength]}</span>
              {length < 12 && <span className="text-amber-400">Faltam {12 - length} caracteres</span>}
            </div>
          </div>
        )}

        {/* Confirmar Nova Senha */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-new-password" className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">
            Confirmar Nova Senha
          </label>
          <input
            id="confirm-new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={128}
            placeholder="Digite a nova senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-[#222533] bg-[#0D0E16] text-white placeholder-zinc-500 text-sm font-semibold focus:outline-none focus:border-[#FFDE00] focus:ring-4 focus:ring-[#FFDE00]/15 transition-all"
          />
        </div>

        {/* Checklist de Requisitos */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs">
          <div className={`flex items-center gap-2 font-medium ${isMinLength ? "text-emerald-400" : "text-zinc-500"}`}>
            <span>{isMinLength ? "✓" : "○"}</span>
            <span>Pelo menos 12 caracteres</span>
          </div>
          <div className={`flex items-center gap-2 font-medium ${isMaxLength ? "text-emerald-400" : "text-zinc-500"}`}>
            <span>{isMaxLength ? "✓" : "○"}</span>
            <span>No máximo 128 caracteres</span>
          </div>
          <div className={`flex items-center gap-2 font-medium ${isMatch ? "text-emerald-400" : "text-zinc-500"}`}>
            <span>{isMatch ? "✓" : "○"}</span>
            <span>Senhas iguais</span>
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading || !isMinLength || !isMaxLength || !isMatch}
          className="w-full py-3.5 mt-2 rounded-xl bg-[#FFDE00] hover:bg-[#FFE54D] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(255,222,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Redefinindo senha...</span>
            </>
          ) : (
            <span>Redefinir senha</span>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            ← Cancelar e voltar ao login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordContent />
        </Suspense>
      </main>

      <footer className="py-4 text-center text-[11px] text-zinc-500 border-t border-zinc-800/80 bg-[#090A0F] z-10">
        © 2026, RenPlay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
