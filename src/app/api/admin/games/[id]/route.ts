import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canManageGames } from "@/lib/permissions";

type Context = { params: Promise<{ id: string }> };

async function authorize() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!canManageGames(user)) return NextResponse.json({ error: "Permissão insuficiente para editar jogos." }, { status: 403 });
  return null;
}

export async function GET(_request: Request, context: Context) {
  const denied = await authorize();
  if (denied) return denied;
  const { id } = await context.params;
  const result = await getDb().query(
    "SELECT public_id::text AS id, name, status, metadata, updated_at FROM rp_games WHERE id = $1 OR public_id::text = $1 LIMIT 1",
    [id]
  );
  if (!result.rows[0]) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  return NextResponse.json({ game: result.rows[0] }, { headers: { "Cache-Control": "no-store" } });
}

const editableFields = [
  "slug", "developer", "publisher", "genre", "category", "classification", "engine", "customEngine",
  "shortDescription", "description", "fullDescription", "gameIcon", "horizontalBanner", "bannerImage",
  "mainCover", "coverImage", "screenshots", "trailerUrl", "githubUrl", "version", "mainFileName",
  "fileSize", "sha256", "downloadUrl", "androidGameUrl", "androidSha256", "downloadMirrors", "platforms", "systemRequirements",
  "languages", "translationStatus", "translatedBy", "translationNotes", "originalReleaseDate",
  "renplayPublishDate", "featuredOrder", "versionNotes", "releaseNotes", "responsibleDev",
  "responsibleTranslator", "editPermissions", "scheduledPublishDate", "changeLog", "tags",
] as const;

export async function PATCH(request: Request, context: Context) {
  const denied = await authorize();
  if (denied) return denied;
  const { id } = await context.params;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const developer = typeof body.developer === "string" ? body.developer.trim() : "";
    const description = typeof body.shortDescription === "string" ? body.shortDescription.trim() : "";
    const status = body.status;
    if (!name || !developer || !description || !["DRAFT", "PUBLISHED", "SUSPENDED"].includes(String(status))) {
      return NextResponse.json({ error: "Nome, desenvolvedor, descrição e status válidos são obrigatórios." }, { status: 400 });
    }
    if (body.androidGameUrl) {
      try {
        if (typeof body.androidGameUrl !== "string" || new URL(body.androidGameUrl).protocol !== "https:") throw new Error();
      } catch { return NextResponse.json({ error: "O ZIP Android precisa ter um link HTTPS válido." }, { status: 400 }); }
    }
    if (body.androidSha256 && (typeof body.androidSha256 !== "string" || !/^[a-f0-9]{64}$/i.test(body.androidSha256))) {
      return NextResponse.json({ error: "O SHA-256 Android deve ter 64 caracteres hexadecimais." }, { status: 400 });
    }
    const metadata: Record<string, unknown> = { name, developer, shortDescription: description, description, status };
    for (const field of editableFields) {
      if (Object.hasOwn(body, field)) metadata[field] = body[field];
    }
    const result = await getDb().query(
      `UPDATE rp_games
          SET name = $2, status = $3, metadata = metadata || $4::jsonb,
              distribution_authorized = ($3 = 'PUBLISHED'), updated_at = now()
        WHERE id = $1 OR public_id::text = $1
        RETURNING public_id::text AS id, name, status, metadata, updated_at`,
      [id, name, status, JSON.stringify(metadata)]
    );
    if (!result.rows[0]) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    return NextResponse.json({ game: result.rows[0], success: true });
  } catch (error) {
    console.error("Erro ao editar jogo:", error);
    return NextResponse.json({ error: "Falha ao salvar as alterações do jogo." }, { status: 500 });
  }
}
