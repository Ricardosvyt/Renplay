import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { validateUsername } from "@/lib/registration";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("username") || "";
    const check = validateUsername(raw);
    if (check.error) {
      return NextResponse.json({ available: false, error: { message: check.error } }, { status: 400 });
    }
    const result = await getDb().query<{ id: string }>(
      "SELECT id FROM rp_users WHERE lower(username) = $1 LIMIT 1",
      [check.username]
    );
    if (result.rows.length > 0) {
      return NextResponse.json({ available: false, error: { code: "USERNAME_EXISTS", message: "Este nome de usuário já está em uso." } }, { status: 409 });
    }
    return NextResponse.json({ available: true, username: check.username });
  } catch {
    return NextResponse.json({ available: false, error: { code: "CHECK_FAILED", message: "Não foi possível verificar o nome. Tente novamente." } }, { status: 500 });
  }
}
