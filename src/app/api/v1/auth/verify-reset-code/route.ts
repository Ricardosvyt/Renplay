import { NextResponse } from "next/server";
import { verifyRecoveryCode } from "@/lib/password-recovery";

async function readBodyWithLimit(request: Request, maxBytes = 4096): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new Error("Envie os dados no formato JSON.");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new Error("Dados da solicitação ausentes.");

  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Corpo da requisição muito grande.");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (err: any) {
    if (err.message === "Corpo da requisição muito grande." || err.message === "Envie os dados no formato JSON.") {
      throw err;
    }
    throw new Error("JSON inválido.");
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await readBodyWithLimit(request);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: parseError?.message || "Requisição inválida." } },
        { status: 400 }
      );
    }

    const { email, code } = body;
    const result = await verifyRecoveryCode(email, code);

    if (!result.success) {
      const isAttemptsExceeded = result.message.includes("excedeu o número de tentativas");
      return NextResponse.json(
        { error: { code: isAttemptsExceeded ? "ATTEMPTS_EXCEEDED" : "INVALID_CODE", message: result.message } },
        { status: isAttemptsExceeded ? 429 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resetToken: result.resetToken,
        message: result.message,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: any) {
    console.error("Erro no endpoint verify-reset-code:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Não foi possível concluir a verificação. Tente novamente." } },
      { status: 500 }
    );
  }
}
