import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cleanupExpiredLimits } from "@/lib/auth-rate-limit";
import { getDb } from "@/lib/db";

function safeCompareSecret(header: string, secret: string): boolean {
  if (!header.startsWith("Bearer ")) return false;
  const provided = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/**
 * RENPLAY — Guaranteed Scheduled Cleanup for rp_limits
 * 
 * Invoked by Vercel Cron Jobs (configured via vercel.json) or manual operations.
 * Requires Bearer token validation matching process.env.CRON_SECRET via timingSafeEqual.
 * Never trusts x-vercel-cron alone as it can be forged by external clients.
 * Awaits bounded batch deletion to guarantee cleanup without serverless termination loss.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  let isAuthorized = false;
  if (cronSecret && cronSecret.length > 0) {
    isAuthorized = safeCompareSecret(authHeader, cronSecret);
  } else if (!isProduction) {
    // In local development or automated testing, allow execution if CRON_SECRET is not yet configured
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Acesso não autorizado ao endpoint de manutenção." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const deletedCount = await cleanupExpiredLimits(db, 2000);

    return NextResponse.json({
      success: true,
      cleanedExpiredRows: deletedCount,
      timestamp: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Falha no cron de limpeza rp_limits:", err instanceof Error ? err.message : "");
    return NextResponse.json(
      { error: "Falha ao executar limpeza da tabela rp_limits." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
