import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { initCloudSaveDownload } from "@/lib/cloud-saves";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para baixar o save da nuvem." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      gameId?: string;
      game_id?: string;
      slot?: number;
      slot_number?: number;
    };

    const gameId = body.gameId || body.game_id;
    const slot = body.slot ?? body.slot_number;

    if (!gameId || slot === undefined) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "gameId e slot são obrigatórios." } },
        { status: 400 }
      );
    }

    const downloadInfo = await initCloudSaveDownload(user, gameId, slot);

    return NextResponse.json(downloadInfo, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error: any) {
    console.error("[CloudSaves API] Erro ao obter URL de download:", error.message);
    const isForbidden = error.message?.includes("RenPlay Premium");
    const isNotFound = error.message?.includes("não encontrado");
    return NextResponse.json(
      {
        error: {
          code: isForbidden ? "FORBIDDEN" : isNotFound ? "NOT_FOUND" : "BAD_REQUEST",
          message: error.message
        }
      },
      { status: isForbidden ? 403 : isNotFound ? 404 : 400 }
    );
  }
}
