import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha ao consultar sessão:", error);
    const err = error as { code?: string; message?: string };
    const errorMessage = err.message?.includes("DATABASE_URL")
      ? "Banco de dados não configurado no servidor."
      : err.code === "42P01"
        ? "As tabelas de autenticação ainda não foram criadas. Execute as migrações do banco."
        : ["ECONNREFUSED", "ETIMEDOUT", "ENETUNREACH", "EHOSTUNREACH"].includes(err.code || "")
          ? "Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL e a rede do servidor."
          : "Não foi possível validar sua sessão agora.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
