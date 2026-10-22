import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { validateEmail } from "@/lib/registration";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("email") || "";
    const check = await validateEmail(raw, { checkMx: true });
    if (!check.valid) {
      return NextResponse.json({ available: false, error: { message: check.error } }, { status: 400 });
    }
    const result = await getDb().query<{ id: string }>(
      "SELECT id FROM rp_users WHERE lower(email) = $1 LIMIT 1",
      [check.email]
    );
    if (result.rows.length > 0) {
      return NextResponse.json({ available: false, error: { code: "EMAIL_EXISTS", message: "Não foi possível cadastrar este e-mail." } }, { status: 409 });
    }
    return NextResponse.json({ available: true, email: check.email });
  } catch {
    return NextResponse.json({ available: false, error: { code: "CHECK_FAILED", message: "Não foi possível validar o e-mail. Tente novamente." } }, { status: 500 });
  }
}
