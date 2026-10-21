import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

if (process.argv[2] !== "--confirm-reset") {
  console.error("Este comando apaga todas as tabelas rp_* e recria o banco.");
  console.error("Para executar conscientemente, use: node scripts/reset-database.mjs --confirm-reset");
  process.exit(1);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.DATABASE_URL) {
  const envFile = await fs.readFile(path.join(projectRoot, ".env"), "utf8").catch(() => "");
  const databaseLine = envFile.split(/\r?\n/).find((line) => line.startsWith("DATABASE_URL="));
  if (databaseLine) {
    process.env.DATABASE_URL = databaseLine.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada.");
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
  await client.query("BEGIN");

  const tables = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'rp_%'
  `);

  for (const row of tables.rows) {
    await client.query(`DROP TABLE IF EXISTS public."${row.tablename}" CASCADE`);
  }

  for (const file of migrations) {
    const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
    await client.query(sql);
    console.log(`Aplicada: ${file}`);
  }

  await client.query("COMMIT");
  console.log("Banco RenPlay recriado com sucesso.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
