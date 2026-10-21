import { Pool } from "pg";

declare global {
  var renplayPool: Pool | undefined;
}

export function getDb(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }

  if (!globalThis.renplayPool) {
    globalThis.renplayPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalThis.renplayPool;
}
