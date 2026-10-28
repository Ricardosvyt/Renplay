import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createPresignedDownloadUrl } from "@/lib/cloud-storage";

type TranslationFile = { path: string; size: number; sha256: string };

function renpyLanguage(files: TranslationFile[], fallback: string) {
  for (const file of files) {
    const match = file.path.replaceAll("\\", "/").match(/^game\/tl\/([^/]+)\//i);
    if (match) return match[1];
  }
  return fallback;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getBearerUser(request).catch(() => null);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Entre no launcher para instalar traduções." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const gameVersion = new URL(request.url).searchParams.get("version") || "";
  const result = await getDb().query<{
    id: string;
    game_id: string;
    public_id: string;
    language: string;
    version: string;
    compatible_versions: string[];
    files: TranslationFile[];
    object_key: string;
    sha256: string;
    size_bytes: string;
  }>(
    `SELECT t.id::text, t.game_id, g.public_id::text AS public_id, t.language, t.version,
            t.compatible_versions, t.files, a.object_key, a.sha256, a.size_bytes
       FROM rp_translations t
       JOIN rp_assets a ON a.id = t.asset_id
       JOIN rp_games g ON g.id = t.game_id
       JOIN rp_library l ON l.game_id = t.game_id AND l.user_id = $2
      WHERE t.id::text = $1 AND t.status = 'PUBLISHED' AND t.distribution_authorized = true
        AND a.status = 'VERIFIED' AND g.status = 'PUBLISHED'
      LIMIT 1`,
    [id, user.id]
  );

  const translation = result.rows[0];
  if (!translation) {
    return NextResponse.json(
      { error: { code: "TRANSLATION_UNAVAILABLE", message: "Tradução indisponível para esta conta." } },
      { status: 404 }
    );
  }
  if (!translation.compatible_versions.includes(gameVersion)) {
    return NextResponse.json(
      { error: { code: "INCOMPATIBLE", message: "Tradução incompatível com a versão instalada." } },
      { status: 409 }
    );
  }

  const files = Array.isArray(translation.files) ? translation.files : [];
  return NextResponse.json({
    schemaVersion: 1,
    translationId: translation.id,
    gameId: translation.public_id || translation.game_id,
    version: translation.version,
    language: translation.language,
    renpyLanguage: renpyLanguage(files, translation.language),
    compatibleVersions: translation.compatible_versions,
    files,
    sha256: translation.sha256,
    sizeBytes: Number(translation.size_bytes),
    downloadUrl: await createPresignedDownloadUrl(translation.object_key, 300)
  }, { headers: { "Cache-Control": "private, no-store" } });
}
