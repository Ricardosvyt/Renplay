"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function AccountLogin() {
  const params = useSearchParams();
  const desktop = params.get("desktop") === "1";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    if (desktop && (!params.get("challenge") || !params.get("state") || !params.get("redirectUri"))) { setError("A solicitação do launcher está incompleta."); setLoading(false); return; }
    const response = await fetch(desktop ? "/api/v1/auth/desktop/authorize" : "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(desktop ? { identifier, password, challenge: params.get("challenge"), state: params.get("state"), redirectUri: params.get("redirectUri") } : { identifier, password, rememberMe: true }),
    });
    const data = await response.json().catch(() => ({})); setLoading(false);
    if (!response.ok) { setError(data.error?.message || data.error || "Não foi possível entrar."); return; }
    if (desktop) { window.location.href = data.redirectUrl; return; }
    window.location.href = "/dashboard";
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#090A0F] px-4 text-white"><div className="w-full max-w-md rounded-3xl border border-[#29292F] bg-[#12141D] p-7 shadow-2xl"><div className="mb-8 flex items-center gap-3"><img src="/Logo.png" alt="RenPlay" className="h-9 w-auto" /><div><p className="text-sm font-black">RenPlay</p><p className="text-[10px] uppercase tracking-widest text-[#FFDE00]">{desktop ? "Conectar launcher" : "Conta profissional"}</p></div></div><h1 className="text-2xl font-black">{desktop ? "Entrar no launcher" : "Entrar na conta"}</h1><p className="mt-2 text-sm text-zinc-400">{desktop ? "Use a mesma conta do site para sincronizar sua biblioteca." : "Acesso seguro ao ecossistema RenPlay."}</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-xs font-bold text-zinc-400">Usuário ou e-mail<input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-[#29292F] bg-[#090A0F] px-4 py-3 text-sm outline-none focus:border-[#FFDE00]" /></label><label className="block text-xs font-bold text-zinc-400">Senha<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#29292F] bg-[#090A0F] px-4 py-3 text-sm outline-none focus:border-[#FFDE00]" /></label>{error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-xs font-bold text-red-300">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#FFDE00] px-4 py-3 text-xs font-black uppercase tracking-wide text-black hover:bg-[#ffe84d] disabled:opacity-60">{loading ? "Validando..." : desktop ? "Autorizar launcher" : "Entrar"}</button></form><p className="mt-6 text-center text-[11px] text-zinc-600">A conexão usa sessão protegida e não compartilha sua senha com o launcher.</p></div></main>;
}

export default function AccountPage() { return <Suspense fallback={<main className="min-h-screen bg-[#090A0F]" />}><AccountLogin /></Suspense>; }
