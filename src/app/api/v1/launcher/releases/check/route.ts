import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function authorized(request: Request) {
  const configured = process.env.LAUNCHER_API_KEY?.trim();
  if (!configured) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-renplay-api-key") === configured;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: { code: "INVALID_API_KEY", message: "Chave do launcher inválida." } }, { status: 401 });
  const version = request.nextUrl.searchParams.get("version") || "0.0.0";
  const channel = request.nextUrl.searchParams.get("channel") || "stable";
  try {
    const result = await getDb().query<{ version: string; channel: string; notes: string; publisher_name: string; download_url: string | null; sha256: string; size_bytes: string }>(
      `SELECT r.version, r.channel, r.notes, r.publisher_name, r.download_url, a.sha256, a.size_bytes::text
         FROM rp_launcher_releases r JOIN rp_assets a ON a.id = r.asset_id
        WHERE r.status = 'PUBLISHED' AND a.status = 'VERIFIED' AND r.channel = $1
        ORDER BY r.created_at DESC LIMIT 1`, [channel]
    );
    const release = result.rows[0];
    if (!release) return NextResponse.json({ updateAvailable: false, currentVersion: version });
    const updateAvailable = release.version !== version;
    return NextResponse.json({ updateAvailable, currentVersion: version, release: updateAvailable ? { version: release.version, channel: release.channel, notes: release.notes, publisherName: release.publisher_name, downloadUrl: release.download_url, sha256: release.sha256, sizeBytes: Number(release.size_bytes) } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: { code: "RELEASE_UNAVAILABLE", message: "Não foi possível consultar atualizações." } }, { status: 503 }); }
}
