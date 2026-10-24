import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { initCloudSaveUpload } from "@/lib/cloud-saves";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para utilizar o Cloud Save." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      game_id?: string;
      gameId?: string;
      slot?: number;
      slot_number?: number;
      filename?: string;
      file_size?: number;
      fileSizeBytes?: number;
      sha256?: string;
      game_version?: string;
      gameVersion?: string;
      metadata?: Record<string, unknown>;
    };

    const gameId = body.game_id || body.gameId;
    const slot = body.slot ?? body.slot_number;
    const filename = body.filename;
    const size = body.file_size ?? body.fileSizeBytes;
    const sha256 = body.sha256;

    if (!gameId || slot === undefined || !filename || size === undefined || !sha256) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Campos obrigatórios: game_id, slot, filename, file_size e sha256."
          }
        },
        { status: 400 }
      );
    }

    const result = await initCloudSaveUpload({
      user,
      gameId,
      slotNumber: slot,
      filename,
      fileSizeBytes: size,
      sha256,
      gameVersion: body.game_version || body.gameVersion || "",
      metadata: body.metadata || {}
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error: any) {
    console.error("[CloudSaves API] Erro ao iniciar upload:", error.message);
    const isForbidden = error.message?.includes("RenPlay Premium");
    const isLimit = error.message?.includes("Limite") || error.message?.includes("Capacidade");
    return NextResponse.json(
      {
        error: {
          code: isForbidden ? "FORBIDDEN" : isLimit ? "QUOTA_EXCEEDED" : "BAD_REQUEST",
          message: error.message
        }
      },
      { status: isForbidden ? 403 : isLimit ? 429 : 400 }
    );
  }
}
