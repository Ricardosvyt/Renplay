import { getDb } from "@/lib/db";
import type { Pool, PoolClient } from "pg";

// The text key is retained as an internal foreign key and for existing R2
// object paths. Only public IDs cross the site/launcher API boundary.
export async function resolveGameId(publicOrLegacyId: string, db: Pool | PoolClient = getDb()): Promise<string | null> {
  const input = String(publicOrLegacyId || "").trim();
  if (!input) return null;
  const result = await db.query<{ id: string }>(
    `SELECT id FROM rp_games WHERE id = $1 OR public_id::text = $1 LIMIT 1`, [input]);
  return result.rows[0]?.id ?? null;
}

export async function publicGameId(internalId: string, db: Pool | PoolClient = getDb()): Promise<string> {
  const result = await db.query<{ public_id: string }>(
    `SELECT public_id::text AS public_id FROM rp_games WHERE id = $1`, [internalId]);
  return result.rows[0]?.public_id ?? internalId;
}
