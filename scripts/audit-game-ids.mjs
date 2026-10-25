import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não configurada.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  const migrations = await pool.query(
    "SELECT filename FROM rp_schema_migrations ORDER BY filename"
  );
  const games = await pool.query(
    "SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE id !~ '^[a-z0-9][a-z0-9-]{2,63}$')::int AS invalid_ids FROM rp_games"
  );
  const uploads = await pool.query(
    "SELECT COUNT(*)::int AS orphan_sessions FROM rp_cloud_upload_sessions s LEFT JOIN rp_games g ON g.id = s.game_id WHERE g.id IS NULL"
  );
  const protections = await pool.query(
    `SELECT c.conname, c.contype, c.confdeltype
       FROM pg_constraint c
      WHERE c.conrelid IN ('rp_cloud_saves'::regclass, 'rp_cloud_upload_sessions'::regclass)
        AND c.conname IN ('rp_cloud_saves_game_id_fkey', 'rp_cloud_upload_sessions_game_id_fkey')
      ORDER BY c.conname`
  );
  const trigger = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = 'rp_games'::regclass AND tgname = 'rp_games_stable_id' AND NOT tgisinternal) AS stable_id"
  );
  console.log(JSON.stringify({
    migrations: migrations.rows.map((row) => row.filename),
    games: games.rows[0],
    uploads: uploads.rows[0],
    protections: protections.rows,
    stableIdTrigger: trigger.rows[0]?.stable_id,
  }, null, 2));
} finally {
  await pool.end();
}
