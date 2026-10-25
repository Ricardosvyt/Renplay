import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente.');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const tables = await pool.query(`SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND (table_name ILIKE '%subscription%' OR table_name ILIKE '%payment%') ORDER BY table_name`);
  const counts = await pool.query(`SELECT
    (SELECT count(*) FROM rp_user_roles WHERE role = 'VIP')::int AS legacy_vip_users,
    (SELECT count(DISTINCT user_id) FROM rp_cloud_saves)::int AS save_owners,
    (SELECT count(*) FROM rp_games WHERE public_id IS NOT NULL)::int AS numeric_games,
    (SELECT count(*) FROM rp_games)::int AS total_games,
    (SELECT count(*) FROM rp_subscriptions WHERE subscription_status = 'LEGACY_REVIEW')::int AS legacy_review,
    (SELECT count(*) FROM rp_cloud_saves s LEFT JOIN rp_games g ON g.id = s.game_id WHERE g.id IS NULL)::int AS orphan_saves`);
  console.log(JSON.stringify({ tables: tables.rows.map(row => row.table_name), counts: counts.rows[0] }, null, 2));
} finally { await pool.end(); }
