// Server-side only: lazy production PostgreSQL connection pool.

import { Pool } from "pg";

import type { SqlClient } from "@/lib/server/leads";
import type { TransactionalDb } from "@/lib/server/transaction";

let db: TransactionalDb | null | undefined;

export function getDb(): TransactionalDb | null {
  if (db !== undefined) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    db = null;
    return db;
  }
  const connectionPool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 10_000 });
  db = {
    query: (text: string, params?: unknown[]) => connectionPool.query(text, params),
    async transaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T> {
      const client = await connectionPool.connect();
      try {
        await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
        const result = await fn({ query: (text, params) => client.query(text, params) });
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
  return db;
}

export function getRazorpayWebhookSecret(): string | undefined {
  return process.env.RAZORPAY_WEBHOOK_SECRET;
}
