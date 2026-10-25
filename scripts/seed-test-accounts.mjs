import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.DATABASE_URL) {
  const envFile = await fs.readFile(path.join(projectRoot, ".env"), "utf8").catch(() => "");
  const databaseLine = envFile.split(/\r?\n/).find((line) => line.startsWith("DATABASE_URL="));
  if (databaseLine) process.env.DATABASE_URL = databaseLine.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada.");

const accounts = [
  { username: "teste.admin", email: "teste.admin@renplay.local", displayName: "Administrador de Teste", password: "RenPlay-Admin-2026!", role: "ADMIN" },
  { username: "teste.moderador", email: "teste.moderador@renplay.local", displayName: "Moderador de Teste", password: "RenPlay-Moderador-2026!", role: "MODERATOR" },
  { username: "teste.desenvolvedor", email: "teste.desenvolvedor@renplay.local", displayName: "Desenvolvedor de Teste", password: "RenPlay-Dev-2026!", role: "DEVELOPER" },
  { username: "teste.tradutor", email: "teste.tradutor@renplay.local", displayName: "Tradutor de Teste", password: "RenPlay-Tradutor-2026!", role: "TRANSLATOR" },
  { username: "teste.vip", email: "teste.vip@renplay.local", displayName: "Membro VIP de Teste", password: "RenPlay-VIP-2026!", role: "VIP" },
  { username: "teste.membro", email: "teste.membro@renplay.local", displayName: "Membro de Teste", password: "RenPlay-Membro-2026!", role: "USER" },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const result = await client.query(
      `INSERT INTO rp_users (username, email, display_name, password_hash, active, email_verified)
       VALUES ($1, $2, $3, $4, true, true)
       ON CONFLICT (username) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             display_name = EXCLUDED.display_name,
             active = true,
             email_verified = true
       RETURNING id`,
      [account.username, account.email, account.displayName, passwordHash]
    );
    const userId = result.rows[0].id;
    await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, 'USER') ON CONFLICT DO NOTHING", [userId]);
    if (account.role !== "USER") {
      await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, account.role]);
    }

    if (account.role === "VIP" || account.username === "teste.vip") {
      await client.query(
        `INSERT INTO rp_subscriptions (
           user_id, vip_level, subscription_status, current_period_start, current_period_end,
           cancel_at_period_end, grace_started_at, grace_expires_at, cloud_deletion_status,
           last_payment_confirmed_at, updated_at
         ) VALUES (
           $1, 2, 'ACTIVE', now(), now() + interval '30 days',
           false, NULL, NULL, 'NONE',
           now(), now()
         )
         ON CONFLICT (user_id) DO UPDATE SET
           vip_level = 2,
           subscription_status = 'ACTIVE',
           current_period_start = now(),
           current_period_end = now() + interval '30 days',
           cancel_at_period_end = false,
           grace_started_at = NULL,
           grace_expires_at = NULL,
           cloud_deletion_status = 'NONE',
           last_payment_confirmed_at = now(),
           updated_at = now()`,
        [userId]
      );
    }
  }
  await client.query("COMMIT");
  console.log(`Contas criadas/atualizadas com sucesso (${accounts.length} contas). teste.vip provisionado com plano Pro ativo.`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
