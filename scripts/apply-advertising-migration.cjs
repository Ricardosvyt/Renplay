const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '012_advertising.sql'), 'utf8');
    await pool.query(sql);
    const result = await pool.query('SELECT count(*)::int AS placements FROM rp_ad_placements');
    console.log(`Migration 012 aplicada; posicionamentos: ${result.rows[0].placements}`);
  } finally {
    await pool.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
