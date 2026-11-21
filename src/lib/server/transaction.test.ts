import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

import { transactionalPGlite } from "@/lib/server/test-db";
import { runSerializable, type TransactionalDb } from "@/lib/server/transaction";

describe("runSerializable", () => {
  it("retries serialization failures and leaves rolled-back writes absent", async () => {
    const database = new PGlite();
    await database.exec('CREATE TABLE "Test" ("value" integer NOT NULL)');
    const db = transactionalPGlite(database);
    let attempts = 0;
    const result = await runSerializable(db, async (tx) => {
      attempts += 1;
      await tx.query('INSERT INTO "Test" ("value") VALUES ($1)', [attempts]);
      if (attempts === 1) throw { code: "40001" };
      return "ok";
    });
    expect(result).toBe("ok");
    expect(attempts).toBe(2);
    expect((await database.query<{ value: number }>('SELECT "value" FROM "Test"')).rows).toEqual([{ value: 2 }]);
    await database.close();
  });

  it("gives up at the requested attempt limit and does not retry other errors", async () => {
    let attempts = 0;
    const db: TransactionalDb = {
      query: async () => ({ rows: [] }),
      transaction: async <T>(fn: (tx: TransactionalDb) => Promise<T>) => fn(db),
    };
    await expect(runSerializable(db, async () => { attempts += 1; throw { code: "40001" }; }, 2)).rejects.toEqual({ code: "40001" });
    expect(attempts).toBe(2);
    await expect(runSerializable(db, async () => { attempts += 1; throw new Error("no retry"); })).rejects.toThrow("no retry");
    expect(attempts).toBe(3);
  });
});
