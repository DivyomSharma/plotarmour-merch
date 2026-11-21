// Server-side only: lazy production PostgreSQL connection pool.

import { Pool } from "pg";

import type { SqlClient } from "@/lib/server/leads";

let pool: Pool | null | undefined;

export function getDb(): SqlClient | null {
  if (pool !== undefined) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    pool = null;
    return null;
  }
  pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 10_000 });
  return pool;
}
