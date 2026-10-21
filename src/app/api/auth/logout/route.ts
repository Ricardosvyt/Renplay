import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await revokeCurrentSession();
  } catch {
    // Mesmo com falha no banco, remove o cookie no cliente.
  }
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
