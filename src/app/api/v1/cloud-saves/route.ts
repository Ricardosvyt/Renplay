import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  listGameCloudSaves,
  deleteCloudSaveSlot
} from "@/lib/cloud-saves";
import { getSubscription } from "@/lib/subscriptions";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para acessar os saves na nuvem." } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Parâmetro gameId é obrigatório." } },
      { status: 400 }
    );
  }

  try {
    const subscription = await getSubscription(user.id);
    const data = await listGameCloudSaves(user, gameId);

    return NextResponse.json(
      {
        isPremium: subscription.canUpload,
        subscription,
        saves: data.saves,
        quota: data.quota
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("[CloudSaves API] Erro ao listar saves:", error.message);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: error.message || "Não foi possível carregar os saves na nuvem." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para excluir saves da nuvem." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      gameId?: string;
      game_id?: string;
      slot?: number;
      slotNumber?: number;
      slot_number?: number;
    };

    const gameId = body.gameId || body.game_id;
    const slot = body.slotNumber ?? body.slot ?? body.slot_number;

    if (!gameId || slot === undefined) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "gameId e slot são obrigatórios." } },
        { status: 400 }
      );
    }

    const result = await deleteCloudSaveSlot(user, gameId, slot);

    return NextResponse.json(
      { success: true, deleted: result.deleted },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("[CloudSaves API] Erro ao excluir save:", error.message);
    const isForbidden = error.message?.includes("RenPlay Premium");
    return NextResponse.json(
      { error: { code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST", message: error.message } },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
