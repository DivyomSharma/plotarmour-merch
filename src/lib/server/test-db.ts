import type { PGlite } from "@electric-sql/pglite";

import type { SqlClient } from "@/lib/server/leads";
import type { TransactionalDb } from "@/lib/server/transaction";

export function transactionalPGlite(db: PGlite): TransactionalDb {
  const client: SqlClient = {
    query: (text, params) => db.query(text, params),
  };
  return {
    ...client,
    async transaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T> {
      await db.exec("BEGIN ISOLATION LEVEL SERIALIZABLE");
      try {
        const result = await fn(client);
        await db.exec("COMMIT");
        return result;
      } catch (error) {
        await db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
