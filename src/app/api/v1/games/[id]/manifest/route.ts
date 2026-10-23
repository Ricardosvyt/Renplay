import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "node:crypto";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login no launcher para baixar e instalar jogos." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: { code: "INVALID_GAME", message: "Identificador do jogo não fornecido." } },
      { status: 400 }
    );
  }

  try {
    const gameResult = await getDb().query<{
      id: string;
      name: string;
      status: string;
      metadata: Record<string, unknown>;
    }>(
      "SELECT id, name, status, metadata FROM rp_games WHERE id = $1 LIMIT 1",
      [id]
    );

    if (gameResult.rowCount === 0) {
      return NextResponse.json(
        { error: { code: "GAME_NOT_FOUND", message: "Jogo não encontrado no catálogo." } },
        { status: 404 }
      );
    }

    const game = gameResult.rows[0];
    const meta = (game.metadata || {}) as Record<string, unknown>;

    // Verifica se o jogo está publicado ou se o usuário é moderador/admin
    const isStaff = user.roles?.some((r) => ["ADMIN", "DEVELOPER", "MODERATOR"].includes(r));
    if (game.status !== "PUBLISHED" && !isStaff) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Este jogo ainda não está disponível para instalação pública." } },
        { status: 403 }
      );
    }

    // Se houver manifesto completo pré-configurado
    if (meta.manifest && typeof meta.manifest === "object") {
      const customManifest = meta.manifest as Record<string, unknown>;
      return NextResponse.json({
        schemaVersion: 1,
        gameId: game.id,
        name: game.name,
        ...customManifest,
      });
    }

    // Se houver link de download direto nos metadados
    const downloadUrl = (meta.downloadUrl as string) || (meta.downloadLink as string) || "";
    if (!downloadUrl) {
      return NextResponse.json(
        {
          error: {
            code: "MANIFEST_UNAVAILABLE",
            message: "Nenhum pacote de instalação ou manifesto foi cadastrado para este jogo ainda.",
          },
        },
        { status: 404 }
      );
    }

    const version = (meta.version as string) || "1.0.0";
    const sizeBytes = Number(meta.sizeBytes) || 1024 * 1024 * 50; // fallback demonstrativo
    const safeExe = ((meta.executable as string) || `${game.id.replace(/[^a-z0-9]/g, "")}.exe`).replace(/^[/\\]+/, "");
    const sha256 = (meta.sha256 as string) || crypto.createHash("sha256").update(game.id + version).digest("hex");

    const files = Array.isArray(meta.files) && meta.files.length > 0
      ? meta.files
      : [
          {
            path: safeExe.endsWith(".exe") ? safeExe : `${safeExe}.exe`,
            size: sizeBytes,
            sha256: sha256,
          },
        ];

    const manifest = {
      schemaVersion: 1,
      gameId: game.id,
      name: game.name,
      buildId: (meta.buildId as string) || crypto.randomUUID(),
      version: version,
      downloadUrl: downloadUrl,
      sizeBytes: sizeBytes,
      sha256: sha256,
      executable: safeExe.endsWith(".exe") ? safeExe : `${safeExe}.exe`,
      files: files,
    };

    return NextResponse.json(manifest);
  } catch (error) {
    console.error("[Manifest API] Erro ao obter manifesto:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Erro interno ao processar manifesto de instalação." } },
      { status: 500 }
    );
  }
}
