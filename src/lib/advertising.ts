import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, type AuthUser } from "@/lib/auth";
import { canManageAdvertising } from "@/lib/permissions";

export const AD_STATUSES = ["ACTIVE", "PAUSED", "SCHEDULED", "ENDED"] as const;
export const AD_TYPES = ["BANNER", "SPONSORED_CARD", "SPONSORED_GAME", "INTERNAL_PROMO", "EXTERNAL_PARTNER"] as const;
export const AD_PLATFORMS = ["LAUNCHER", "SITE", "BOTH"] as const;

export type AdvertisingSettings = {
  enabled: boolean;
  siteEnabled: boolean;
  launcherEnabled: boolean;
  internalCampaignsEnabled: boolean;
  refreshSeconds: number;
  maxPerPlacement: number;
  vipBehavior: "show_all" | "internal_only" | "hide_all";
};

export const DEFAULT_AD_SETTINGS: AdvertisingSettings = {
  enabled: true,
  siteEnabled: true,
  launcherEnabled: true,
  internalCampaignsEnabled: true,
  refreshSeconds: 300,
  maxPerPlacement: 2,
  vipBehavior: "internal_only",
};

export async function requireAdvertisingAdmin(request?: Request): Promise<{ user?: AuthUser; response?: NextResponse }> {
  const user = await getSessionUser(request).catch(() => null);
  if (!user) return { response: NextResponse.json({ error: "Autenticação necessária." }, { status: 401 }) };
  if (!canManageAdvertising(user)) return { response: NextResponse.json({ error: "Apenas administradores podem gerenciar publicidade." }, { status: 403 }) };
  return { user };
}

export function text(value: unknown, max: number, required = true) {
  const result = typeof value === "string" ? value.trim() : "";
  if ((required && !result) || result.length > max) throw new Error("Campo de texto inválido.");
  return result;
}

export function safeDestination(value: unknown) {
  const raw = text(value, 2048);
  const url = new URL(raw);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("Use uma URL HTTPS segura.");
  }
  return url.href;
}

export function safeImageUrl(value: unknown) {
  if (!value) return null;
  return safeDestination(value);
}

export function safeAdObjectKey(value: unknown) {
  if (!value) return null;
  const key = text(value, 500);
  if (!/^advertising\/\d{4}\/[a-f0-9-]+\.(?:webp|png|jpg)$/i.test(key)) throw new Error("Chave de imagem publicitária inválida.");
  return key;
}

export function stringList(value: unknown, maxItems = 40) {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value) || value.length > maxItems) throw new Error("Lista de segmentação inválida.");
  return [...new Set(value.map(item => text(item, 40)).filter(Boolean))];
}

export function integer(value: unknown, min: number, max: number, nullable = false) {
  if ((value === null || value === undefined || value === "") && nullable) return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error("Valor numérico inválido.");
  return number;
}

export function dateOrNull(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("Data inválida.");
  return date;
}

export function normalizeSettings(value: unknown): AdvertisingSettings {
  const input = value && typeof value === "object" ? value as Partial<AdvertisingSettings> : {};
  return {
    enabled: input.enabled !== false,
    siteEnabled: input.siteEnabled !== false,
    launcherEnabled: input.launcherEnabled !== false,
    internalCampaignsEnabled: input.internalCampaignsEnabled !== false,
    refreshSeconds: Math.min(3600, Math.max(60, Number(input.refreshSeconds) || 300)),
    maxPerPlacement: Math.min(10, Math.max(1, Number(input.maxPerPlacement) || 2)),
    vipBehavior: ["show_all", "internal_only", "hide_all"].includes(String(input.vipBehavior)) ? input.vipBehavior as AdvertisingSettings["vipBehavior"] : "internal_only",
  };
}

export function sessionHash(value: unknown) {
  const session = typeof value === "string" ? value.trim() : "";
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(session)) throw new Error("Sessão anônima inválida.");
  return createHash("sha256").update(session).digest("hex");
}

export function auditMetadata(value: Record<string, unknown>) {
  return JSON.stringify(value);
}
