import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL) {
  const envFile = await fs.readFile(path.join(projectRoot, ".env"), "utf8").catch(() => "");
  const databaseLine = envFile.split(/\r?\n/).find((line) => line.startsWith("DATABASE_URL="));
  if (databaseLine) {
    process.env.DATABASE_URL = databaseLine.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não configurada no ambiente.");
  process.exit(1);
}

const migrationDir = path.join(projectRoot, "db", "migrations");
const migrations = (await fs.readdir(migrationDir))
  .filter((file) => /^\d+_.*\.sql$/.test(file))
  .sort();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const client = await pool.connect();

try {
  // Ensure schema migrations tracker table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS rp_schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  // If rp_users already exists, mark baseline migrations 001-007 as applied
  const usersExist = await client.query(`
    SELECT to_regclass('public.rp_users') IS NOT NULL AS exists
  `);
  if (usersExist.rows[0]?.exists) {
    const baselines = [
      '001_platform.sql',
      '002_asset_validation.sql',
      '003_policies.sql',
      '004_auth_indexes.sql',
      '005_user_bans.sql',
      '006_username_case_insensitive_unique.sql',
      '007_password_resets.sql'
    ];
    for (const b of baselines) {
      await client.query(
        "INSERT INTO rp_schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
        [b]
      );
    }
  }

  const appliedRows = await client.query("SELECT filename FROM rp_schema_migrations");
  const appliedSet = new Set(appliedRows.rows.map((r) => r.filename));

  let appliedCount = 0;
  for (const file of migrations) {
    if (appliedSet.has(file)) {
      continue;
    }

    console.log(`Aplicando migração: ${file}...`);
    const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO rp_schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      appliedCount++;
      console.log(`✓ Concluída com sucesso: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      console.error(`✕ Erro na migração ${file}:`, err.message);
      throw err;
    }
  }

  if (appliedCount === 0) {
    console.log("Todas as migrações já foram aplicadas anteriormente.");
  } else {
    console.log(`Total de ${appliedCount} novas migrações aplicadas.`);
  }
} finally {
  client.release();
  await pool.end();
}
