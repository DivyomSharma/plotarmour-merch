import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { readMigrationSql } from "@/lib/db/migrations";
import { handleLeadRequest, InMemoryLeadRateLimiter } from "@/lib/server/lead-endpoint";
import type { SqlClient } from "@/lib/server/leads";

let db: PGlite;
let client: SqlClient;
const valid = { name: "Aman", phone: "9876543210", organization: "Org", selectedProduct: "Tee", expectedQuantity: "10" };
const request = (body: string, headers: HeadersInit = {}) => new Request("https://merch.test/api/leads", { method: "POST", headers: { "content-type": "application/json", ...headers }, body });

beforeAll(async () => {
  db = new PGlite();
  for (const migration of readMigrationSql()) await db.exec(migration);
  client = { query: (text, params) => db.query<Record<string, unknown>>(text, params as never) };
});
afterAll(async () => db.close());

describe("lead endpoint", () => {
  it("saves a valid same-origin request and accepts missing Origin", async () => {
    const sameOrigin = await handleLeadRequest(request(JSON.stringify(valid), { origin: "https://merch.test" }), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() });
    expect(sameOrigin.status).toBe(201);
    expect((await sameOrigin.json()) as { publicId: string }).toHaveProperty("publicId");
    const missingOrigin = await handleLeadRequest(request(JSON.stringify(valid)), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() });
    expect(missingOrigin.status).toBe(201);
    expect((await db.query('SELECT count(*) FROM "Lead"')).rows).toHaveLength(1);
  });

  it("handles honeypots and request failures without saving or leaking errors", async () => {
    const before = (await db.query<{ count: number }>('SELECT count(*)::int AS count FROM "Lead"')).rows[0].count;
    expect((await handleLeadRequest(request(JSON.stringify({ ...valid, website: "bot" })), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() })).status).toBe(201);
    expect((await db.query<{ count: number }>('SELECT count(*)::int AS count FROM "Lead"')).rows[0].count).toBe(before);
    expect((await handleLeadRequest(request("{"), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() })).status).toBe(400);
    expect((await handleLeadRequest(request("x".repeat(16 * 1024 + 1)), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() })).status).toBe(413);
    expect((await handleLeadRequest(request(JSON.stringify(valid), { origin: "https://evil.test" }), { getDb: () => client, rateLimiter: new InMemoryLeadRateLimiter() })).status).toBe(403);
    expect((await handleLeadRequest(request(JSON.stringify(valid)), { getDb: () => null, rateLimiter: new InMemoryLeadRateLimiter() })).status).toBe(503);
    const failed = await handleLeadRequest(request(JSON.stringify(valid)), { getDb: () => ({ query: async () => { throw new Error("database secret"); } }), rateLimiter: new InMemoryLeadRateLimiter() });
    expect(await failed.json()).toEqual({ ok: false, error: "save_failed" });
  });

  it("limits the sixth request with Retry-After", async () => {
    const limiter = new InMemoryLeadRateLimiter();
    const deps = { getDb: () => null, now: () => 1_000, rateLimiter: limiter };
    for (let index = 0; index < 5; index += 1) expect((await handleLeadRequest(request(JSON.stringify(valid), { "x-forwarded-for": "203.0.113.1" }), deps)).status).toBe(503);
    const response = await handleLeadRequest(request(JSON.stringify(valid), { "x-forwarded-for": "203.0.113.1" }), deps);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
