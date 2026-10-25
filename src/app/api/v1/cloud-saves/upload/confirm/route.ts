import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmCloudSaveUpload } from "@/lib/cloud-saves";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Faça login para confirmar o upload." } },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      uploadId?: string;
      upload_id?: string;
      sessionId?: string;
      session_id?: string;
      saveName?: string;
      save_name?: string;
      filename?: string;
      gameVersion?: string;
      game_version?: string;
      metadata?: Record<string, unknown>;
    };

    const uploadId = body.uploadId || body.upload_id || body.sessionId || body.session_id;
    if (!uploadId) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "uploadId é obrigatório." } },
        { status: 400 }
      );
    }

    const saveRecord = await confirmCloudSaveUpload({
      user,
      uploadId,
      saveName: body.saveName || body.save_name,
      filename: body.filename,
      gameVersion: body.gameVersion || body.game_version || "",
      metadata: body.metadata || {}
    });

    return NextResponse.json(
      {
        success: true,
        save: saveRecord,
        slot: saveRecord
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("[CloudSaves API] Erro ao confirmar upload:", error.message);
    const isForbidden = error.message?.includes("RenPlay Premium");
    return NextResponse.json(
      {
        error: {
          code: isForbidden ? "FORBIDDEN" : "BAD_REQUEST",
          message: error.message
        }
      },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
