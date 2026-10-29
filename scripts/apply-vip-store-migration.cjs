const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const sql = fs.readFileSync(path.join(__dirname, "..", "db", "migrations", "013_vip_store_settings.sql"), "utf8");
    await pool.query(sql);
    const result = await pool.query("SELECT value FROM rp_settings WHERE key='vip_store'");
    console.log(`Migration 013 aplicada; VIP Store configurada: ${result.rowCount === 1}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
