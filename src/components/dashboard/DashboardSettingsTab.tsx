"use client";

import { useCallback, useEffect, useState } from "react";

interface DashboardSettingsTabProps { onSave: (message: string) => void }
type Level = 1 | 2 | 3;
type Plan = { name: string; monthlyPriceBRL: number; maxSaves: number; maxBytes: number };
type Plans = Record<Level, Plan>;
type PriceInputs = Record<Level, string>;
const levels: Level[] = [1, 2, 3];
const defaults: PriceInputs = { 1: "14.90", 2: "24.90", 3: "39.90" };

export default function DashboardSettingsTab({ onSave }: DashboardSettingsTabProps) {
  const [enabled, setEnabled] = useState(true);
  const [prices, setPrices] = useState<PriceInputs>(defaults);
  const [plans, setPlans] = useState<Plans | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/vip-store", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a VIP Store.");
      setEnabled(data.settings.enabled !== false); setPlans(data.plans);
      setPrices({ 1: (Number(data.settings.priceCents[1]) / 100).toFixed(2), 2: (Number(data.settings.priceCents[2]) / 100).toFixed(2), 3: (Number(data.settings.priceCents[3]) / 100).toFixed(2) });
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Falha ao carregar configurações."); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const priceCents = { 1: Math.round(Number(prices[1].replace(",", ".")) * 100), 2: Math.round(Number(prices[2].replace(",", ".")) * 100), 3: Math.round(Number(prices[3].replace(",", ".")) * 100) };
    if (Object.values(priceCents).some((value) => !Number.isInteger(value) || value < 100 || value > 1_000_000)) { setError("Informe valores entre R$ 1,00 e R$ 10.000,00."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/vip-store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled, priceCents }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar os preços.");
      setPlans(data.plans); onSave("Preços da VIP Store atualizados com sucesso!");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Falha ao salvar configurações."); }
    finally { setSaving(false); }
  };

  return <div className="max-w-5xl space-y-6 animate-fade-in-up">
    <section className="rounded-3xl border border-[#FFDE00]/20 bg-[linear-gradient(120deg,#191704,#12141D_55%)] p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#FFDE00]">Monetização</p><h2 className="mt-2 text-2xl font-black">Preços da VIP Store</h2><p className="mt-2 max-w-2xl text-sm text-zinc-400">Altere os valores exibidos no site e cobrados em novos checkouts Stripe.</p></div><label className="flex min-w-52 items-center justify-between gap-4 rounded-2xl border border-[#29292F] bg-[#090A0F]/70 p-4 text-xs font-bold"><span>Loja disponível</span><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4 accent-[#FFDE00]" /></label></div></section>
    {error && <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</div>}
    <section className="grid gap-4 md:grid-cols-3">{levels.map((level) => <div key={level} className={`rounded-2xl border bg-[#12141D] p-5 ${level === 2 ? "border-[#FFDE00]/50 shadow-lg shadow-amber-500/5" : "border-[#29292F]"}`}><div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Plano {level}</p><h3 className="mt-1 font-black text-white">{plans?.[level]?.name || ["", "RenPlay Plus", "RenPlay Pro", "RenPlay Ultra"][level]}</h3></div>{level === 2 && <span className="rounded-full bg-[#FFDE00] px-2 py-1 text-[8px] font-black uppercase text-black">Popular</span>}</div><label className="mt-6 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Preço mensal em reais<div className="mt-2 flex items-center rounded-xl border border-[#34343c] bg-[#090A0F] focus-within:border-[#FFDE00]"><span className="border-r border-[#29292F] px-3 text-sm font-black text-[#FFDE00]">R$</span><input aria-label={`Preço mensal ${plans?.[level]?.name || level}`} type="number" min="1" max="10000" step="0.01" value={prices[level]} onChange={(event) => setPrices((current) => ({ ...current, [level]: event.target.value }))} disabled={loading} className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-lg font-black text-white outline-none disabled:opacity-50" /></div></label><p className="mt-3 text-[10px] leading-relaxed text-zinc-600">{plans?.[level]?.maxSaves || 0} saves · renovação mensal</p></div>)}</section>
    <section className="rounded-2xl border border-[#29292F] bg-[#12141D] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black text-white">Aplicação do novo preço</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">A vitrine é atualizada imediatamente. Novos checkouts Stripe usam o valor salvo; assinaturas Stripe já existentes continuam com o preço contratado.</p></div><button type="button" onClick={()=>void save()} disabled={loading || saving} className="min-h-12 shrink-0 rounded-xl bg-[#FFDE00] px-6 text-xs font-black uppercase tracking-wide text-black transition hover:bg-[#ffe84d] disabled:opacity-50">{saving ? "Salvando…" : "Salvar preços"}</button></div></section>
  </div>;
}
