import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

let pool: Pool | null = null;
function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function GET() {
  try {
    const p = getPool();
    if (p) {
      try {
        const query = `
          SELECT r.*, a.object_key, a.filename, a.sha256, a.size_bytes, a.signature 
          FROM rp_launcher_releases r 
          JOIN rp_assets a ON a.id = r.asset_id 
          WHERE r.status = 'PUBLISHED' 
            AND a.status = 'VERIFIED' 
            AND r.platform = 'win32' 
            AND r.architecture = 'x64' 
            AND r.channel = 'stable'
          ORDER BY r.created_at DESC 
          LIMIT 1
        `;
        const result = await p.query(query);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return NextResponse.json({
            apiVersion: "v1",
            version: row.version,
            channel: row.channel,
            downloadUrl: row.download_url || `https://pub-renplay.r2.dev/launcher/${row.filename}`,
            sha256: row.sha256,
            sizeBytes: Number(row.size_bytes),
            publisherName: row.publisher_name,
            notes: row.notes,
          });
        }
      } catch (dbErr) {
        console.warn("[Launcher API] DB query fallback to file:", (dbErr as Error).message);
      }
    }

    // Fallback: carregar de src/data/launcher.json
    const filePath = path.join(process.cwd(), "src", "data", "launcher.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return NextResponse.json({
        apiVersion: "v1",
        version: data.version || "1.0.0",
        channel: data.channel || "stable",
        downloadUrl: data.downloadUrl || "/downloads/RenPlay-Launcher-Setup.exe",
        notes: data.notes || "Launcher oficial para Windows.",
      });
    }

    return NextResponse.json({
      apiVersion: "v1",
      version: "1.0.0",
      channel: "stable",
      downloadUrl: "/downloads/RenPlay-Launcher-Setup.exe",
      notes: "Launcher oficial para Windows.",
    });
  } catch {
    return NextResponse.json(
      { error: { code: "RELEASE_UNAVAILABLE", message: "Informações do launcher indisponíveis." } },
      { status: 503 }
    );
  }
}
