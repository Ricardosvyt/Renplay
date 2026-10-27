import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "@/lib/db";
import type { LauncherInfo } from "@/types/game";

type Platform = "windows" | "linux" | "macos" | "android";
const platformNames: Record<string, Platform> = { win32: "windows", windows: "windows", linux: "linux", darwin: "macos", macos: "macos", android: "android" };

// A local download is available only when its file really exists in public/.
function downloadUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const candidate = value.trim();
  if (/^\/downloads\/[a-zA-Z0-9_./-]+$/.test(candidate) && !candidate.includes("..")) {
    const filename = path.join(process.cwd(), "public", candidate);
    return fs.existsSync(filename) && fs.statSync(filename).isFile() ? candidate : null;
  }
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export async function GET() {
  const info: LauncherInfo & { apiVersion: string; sha256?: string; sizeBytes?: number; publisherName?: string } = {
    apiVersion: "v1", version: "", channel: "stable", downloadUrl: null,
    notes: "Consulte as versões disponíveis para seu dispositivo.", downloads: {},
  };
  const downloads: NonNullable<LauncherInfo["downloads"]> = {};
  try {
    const filename = path.join(process.cwd(), "src", "data", "launcher.json");
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, "utf8"));
      info.version = typeof data.version === "string" ? data.version : "";
      info.notes = typeof data.notes === "string" ? data.notes : info.notes;
      for (const platform of ["windows", "linux", "macos", "android"] as const) {
        const release = data.downloads?.[platform];
        downloads[platform] = {
          url: downloadUrl(release?.url ?? (platform === "windows" ? data.downloadUrl : null)),
          version: typeof release?.version === "string" ? release.version : undefined,
          architecture: typeof release?.architecture === "string" ? release.architecture : undefined,
        };
      }
    }
  } catch { /* A malformed optional config must not break the homepage. */ }

  if (process.env.DATABASE_URL) {
    try {
      const result = await getDb().query<{ platform: string; architecture: string; version: string; download_url?: string; notes: string; sha256: string; size_bytes: string; publisher_name: string }>(
        `SELECT r.*, a.sha256, a.size_bytes FROM rp_launcher_releases r JOIN rp_assets a ON a.id = r.asset_id
         WHERE r.status = 'PUBLISHED' AND a.status = 'VERIFIED' AND r.channel = 'stable'
           AND r.platform IN ('win32', 'windows', 'linux', 'darwin', 'macos', 'android')
         ORDER BY r.created_at DESC LIMIT 50`
      );
      const selected = new Set<Platform>();
      for (const row of result.rows) {
        const platform = platformNames[row.platform];
        const url = downloadUrl(row.download_url);
        if (!platform || selected.has(platform) || !url) continue;
        selected.add(platform);
        downloads[platform] = { url, version: row.version, architecture: row.architecture };
        if (platform === "windows") {
          info.version = row.version;
          info.notes = row.notes;
          info.sha256 = row.sha256;
          info.sizeBytes = Number(row.size_bytes);
          info.publisherName = row.publisher_name;
        }
      }
    } catch { /* Use explicitly configured downloads while the database is unavailable. */ }
  }

  for (const platform of ["windows", "linux", "macos", "android"] as const) {
    const configured = downloadUrl(process.env[`RENPLAY_DOWNLOAD_${platform.toUpperCase()}_URL`]);
    if (configured) {
      downloads[platform] = { url: configured };
      if (platform === "windows") {
        delete info.sha256;
        delete info.sizeBytes;
        delete info.publisherName;
      }
    }
    downloads[platform] ??= { url: null };
  }
  info.downloads = downloads;
  info.downloadUrl = downloads.windows?.url ?? null;
  return NextResponse.json(info, { headers: { "Cache-Control": "no-store" } });
}
