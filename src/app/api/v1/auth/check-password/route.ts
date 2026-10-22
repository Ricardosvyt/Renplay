import { NextResponse } from "next/server";
import { validatePasswordFormat, checkPwnedPassword } from "@/lib/registration";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ valid: false, error: "Dados inválidos." }, { status: 400 });
    }
    const { password, username } = body as { password?: unknown; username?: unknown };
    const formatCheck = validatePasswordFormat(password, {
      username: typeof username === "string" ? username : undefined,
    });
    if (!formatCheck.valid) {
      return NextResponse.json({ valid: false, error: formatCheck.error }, { status: 200 });
    }

    const pwnedResult = await checkPwnedPassword(password as string);
    if (pwnedResult.pwned) {
      return NextResponse.json({
        valid: false,
        error: "Esta senha foi encontrada em vazamentos de dados. Escolha outra.",
      }, { status: 200 });
    }
    if (pwnedResult.error) {
      return NextResponse.json({
        valid: false,
        error: "Não foi possível verificar a segurança da senha. Tente novamente.",
      }, { status: 200 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch {
    return NextResponse.json({
      valid: false,
      error: "Não foi possível verificar a segurança da senha. Tente novamente.",
    }, { status: 500 });
  }
}
