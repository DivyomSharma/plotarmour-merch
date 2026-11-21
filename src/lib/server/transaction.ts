import type { SqlClient } from "@/lib/server/leads";

export type TransactionalDb = SqlClient & {
  transaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T>;
};

function isRetryable(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error
    && (error.code === "40001" || error.code === "40P01");
}

export async function runSerializable<T>(
  db: TransactionalDb,
  fn: (tx: SqlClient) => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError("maxAttempts must be a positive integer.");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await db.transaction(fn);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === maxAttempts - 1) throw error;
    }
  }
  throw lastError;
}
