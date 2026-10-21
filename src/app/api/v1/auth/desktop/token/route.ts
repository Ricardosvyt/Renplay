import { NextResponse } from "next/server";
import { consumeDesktopAuthorizationCode, createDesktopSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { code?: string; verifier?: string; redirectUri?: string };
    if (!body.code || !body.verifier || !body.redirectUri) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Código de autorização inválido." } }, { status: 400 });
    const authorization = consumeDesktopAuthorizationCode(body.code, body.verifier, body.redirectUri);
    if (!authorization) return NextResponse.json({ error: { code: "INVALID_CODE", message: "Autorização expirada ou inválida." } }, { status: 401 });
    return NextResponse.json(await createDesktopSession(authorization.userId), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: { code: "AUTH_UNAVAILABLE", message: "Serviço de autenticação indisponível." } }, { status: 503 });
  }
}
