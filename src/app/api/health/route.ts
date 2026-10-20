import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "renplay-platform",
    runtime: "nextjs",
    timestamp: new Date().toISOString(),
  });
}
