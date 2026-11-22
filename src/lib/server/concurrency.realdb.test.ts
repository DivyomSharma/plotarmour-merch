import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Client, Pool, type PoolConfig, type QueryResultRow } from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { readMigrationSql } from "@/lib/db/migrations";
import type { SqlClient } from "@/lib/server/leads";
import type { TransactionalDb } from "@/lib/server/transaction";

const realDatabaseUrl = process.env.REAL_DATABASE_URL;
const runs = 5;
const concurrency = 8;
const policies = readFileSync(resolve(process.cwd(), "prisma/rls/policies.sql"), "utf8");

type CountRow = QueryResultRow & { count: number };
type QuoteRow = QueryResultRow & { status: string; version: number };
type PaymentOrderRow = QueryResultRow & { paymentStatus: string; orderStatus: string };

let admin: Client | undefined;
let database: Client | undefined;
let databaseName = "";
let db: TransactionalDb;
let applicationPool: Pool | undefined;
let serializationRetries = 0;

function databaseUrl(base: string, name: string): string {
  const url = new URL(base);
  url.pathname = `/${name}`;
  return url.toString();
}

function quotedIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function trackApplicationPool(pool: Pool): void {
  applicationPool = pool;
}

function hook(event: "payment.captured" | "payment.failed", providerOrderId: string, paymentId: string): { rawBody: string; signature: string } {
  const rawBody = JSON.stringify({ event, payload: { payment: { entity: { id: paymentId, order_id: providerOrderId, amount: 10_000, currency: "INR" } } } });
  return { rawBody, signature: createHmac("sha256", "secret").update(rawBody).digest("hex") };
}

async function query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<T[]> {
  if (!database) throw new Error("Real database client is unavailable.");
  return (await database.query<T>(text, values)).rows;
}

async function count(table: string, where = "", values?: unknown[]): Promise<number> {
  const suffix = where ? ` WHERE ${where}` : "";
  return (await query<CountRow>(`SELECT count(*)::int AS count FROM ${quotedIdentifier(table)}${suffix}`, values))[0].count;
}

async function seedQuote(): Promise<{ organizationId: string; quoteId: string; versionId: string; actorId: string; hash: string; lines: number }> {
  const organizationId = randomUUID();
  const quoteId = randomUUID();
  const versionId = randomUUID();
  const actorId = randomUUID();
  const hash = "a".repeat(64);
  await query(`INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ($1, $2, now())`, [organizationId, `Concurrency ${organizationId}`]);
  await query(`INSERT INTO "Quote" ("id", "publicId", "organizationId", "status", "updatedAt") VALUES ($1, $2, $3, 'sent', now())`, [quoteId, `Q-${quoteId.slice(0, 8)}`, organizationId]);
  await query(`INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ($1, $2, $3, 1, '{"terms":"net 15"}', $4)`, [versionId, organizationId, quoteId, hash]);
  await query(`UPDATE "Quote" SET "activeVersionId" = $1 WHERE "id" = $2`, [versionId, quoteId]);
  for (const description of ["Tee", "Hoodie"]) {
    await query(`INSERT INTO "QuoteLine" ("id", "organizationId", "quoteVersionId", "description", "quantity", "unitAmount", "totalAmount") VALUES ($1, $2, $3, $4, 10, 1000, 10000)`, [randomUUID(), organizationId, versionId, description]);
  }
  return { organizationId, quoteId, versionId, actorId, hash, lines: 2 };
}

async function seedPayment(): Promise<{ organizationId: string; orderId: string; providerOrderId: string; providerPaymentId: string }> {
  const organizationId = randomUUID();
  const quoteId = randomUUID();
  const versionId = randomUUID();
  const orderId = randomUUID();
  const providerOrderId = `order_${randomUUID().replaceAll('-', '')}`;
  const providerPaymentId = `pay_${randomUUID().replaceAll('-', '')}`;
  await query(`INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ($1, $2, now())`, [organizationId, `Payment ${organizationId}`]);
  await query(`INSERT INTO "Quote" ("id", "publicId", "organizationId", "status", "updatedAt") VALUES ($1, $2, $3, 'accepted', now())`, [quoteId, `Q-${quoteId.slice(0, 8)}`, organizationId]);
  await query(`INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ($1, $2, $3, 1, '{}', $4)`, [versionId, organizationId, quoteId, "a".repeat(64)]);
  await query(`INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "snapshot", "updatedAt") VALUES ($1, $2, $3, $4, '{}', now())`, [orderId, `O-${orderId.slice(0, 8)}`, organizationId, versionId]);
  await query(`INSERT INTO "PaymentAttempt" ("id", "organizationId", "orderId", "provider", "providerOrderId", "amount", "currency", "updatedAt") VALUES ($1, $2, $3, 'razorpay', $4, 10000, 'INR', now())`, [randomUUID(), organizationId, orderId, providerOrderId]);
  return { organizationId, orderId, providerOrderId, providerPaymentId };
}

describe.skipIf(!realDatabaseUrl)("real PostgreSQL serializable concurrency", () => {
  beforeAll(async () => {
    if (!realDatabaseUrl) throw new Error("REAL_DATABASE_URL is required for this suite.");
    databaseName = `plotarmour_conc_${randomUUID().replaceAll('-', '')}`;
    admin = new Client({ connectionString: realDatabaseUrl });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${quotedIdentifier(databaseName)}`);
    const isolatedUrl = databaseUrl(realDatabaseUrl, databaseName);
    database = new Client({ connectionString: isolatedUrl });
    await database.connect();
    await database.query(`
      DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF; END $$;
      DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF; END $$;
      DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role BYPASSRLS; END IF; END $$;
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
    `);
    for (const migration of readMigrationSql()) await database.query(migration);
    await database.query(policies);
    process.env.DATABASE_URL = isolatedUrl;
    process.env.DB_POOL_MAX = "12";
    vi.resetModules();
    vi.doMock("pg", async () => {
      const actual = await vi.importActual<typeof import("pg")>("pg");
      class TrackingPool extends actual.Pool {
        constructor(config?: PoolConfig) {
          super(config);
          trackApplicationPool(this);
        }
      }
      return { ...actual, Pool: TrackingPool };
    });
    const dbModule = await import("@/lib/server/db");
    const realDb = dbModule.getDb();
    if (!realDb) throw new Error("Expected the real PostgreSQL pool.");
    db = {
      query: (text, params) => realDb.query(text, params),
      transaction: async <T>(fn: (tx: SqlClient) => Promise<T>): Promise<T> => {
        try {
          return await realDb.transaction(fn);
        } catch (error) {
          if (typeof error === "object" && error !== null && "code" in error && error.code === "40001") serializationRetries += 1;
          throw error;
        }
      },
    };
  });

  afterAll(async () => {
    console.info(`real PostgreSQL serialization retries: ${serializationRetries}`);
    if (applicationPool) await applicationPool.end();
    if (database) await database.end();
    if (admin && databaseName) {
      await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [databaseName]);
      await admin.query(`DROP DATABASE IF EXISTS ${quotedIdentifier(databaseName)}`);
    }
    if (admin) await admin.end();
  });

  it("allows only one acceptance with different keys", async () => {
    const { acceptQuote } = await import("@/lib/server/quote-service");
    for (let run = 0; run < runs; run += 1) {
      const seeded = await seedQuote();
      const results = await Promise.all(Array.from({ length: concurrency }, (_, index) => acceptQuote(db, { organizationId: seeded.organizationId, quoteId: seeded.quoteId, quoteVersionId: seeded.versionId, presentedContentHash: seeded.hash, idempotencyKey: `key-${run}-${index}`, actorId: seeded.actorId })));
      expect(results.filter((result) => result.outcome === "accepted")).toHaveLength(1);
      expect(results.filter((result) => result.outcome === "reject" && result.reason === "already_accepted")).toHaveLength(7);
      expect(await count("Order", "\"quoteVersionId\" = $1", [seeded.versionId])).toBe(1);
      expect(await count("QuoteApproval", "\"quoteVersionId\" = $1", [seeded.versionId])).toBe(1);
      expect(await count("OrderLine", "\"organizationId\" = $1", [seeded.organizationId])).toBe(seeded.lines);
      expect(await count("AuditEvent", "\"organizationId\" = $1 AND action = 'quote.accepted'", [seeded.organizationId])).toBe(1);
      expect(await count("OutboxEvent", "\"organizationId\" = $1 AND type = 'quote.accepted'", [seeded.organizationId])).toBe(1);
      expect(await query<QuoteRow>(`SELECT "status", "version" FROM "Quote" WHERE "id" = $1`, [seeded.quoteId])).toEqual([{ status: "accepted", version: 1 }]);
    }
  });

  it("replays one acceptance with the same key", async () => {
    const { acceptQuote } = await import("@/lib/server/quote-service");
    for (let run = 0; run < runs; run += 1) {
      const seeded = await seedQuote();
      const results = await Promise.all(Array.from({ length: concurrency }, () => acceptQuote(db, { organizationId: seeded.organizationId, quoteId: seeded.quoteId, quoteVersionId: seeded.versionId, presentedContentHash: seeded.hash, idempotencyKey: `key-${run}`, actorId: seeded.actorId })));
      const accepted = results.find((result) => result.outcome === "accepted");
      const replayed = results.filter((result) => result.outcome === "replay");
      expect(results.filter((result) => result.outcome === "accepted")).toHaveLength(1); expect(replayed).toHaveLength(7);
      if (!accepted || accepted.outcome !== "accepted") throw new Error("Expected accepted result.");
      expect(replayed.every((result) => result.outcome === "replay" && result.orderPublicId === accepted.orderPublicId)).toBe(true);
      expect(await count("Order", "\"quoteVersionId\" = $1", [seeded.versionId])).toBe(1);
      expect(await count("QuoteApproval", "\"quoteVersionId\" = $1", [seeded.versionId])).toBe(1);
      expect(await count("OrderLine", "\"organizationId\" = $1", [seeded.organizationId])).toBe(seeded.lines);
      expect(await count("AuditEvent", "\"organizationId\" = $1 AND action = 'quote.accepted'", [seeded.organizationId])).toBe(1);
      expect(await count("OutboxEvent", "\"organizationId\" = $1 AND type = 'quote.accepted'", [seeded.organizationId])).toBe(1);
    }
  });

  it("deduplicates identical captured webhook deliveries", async () => {
    const { processRazorpayEvent } = await import("@/lib/server/payment-service");
    for (let run = 0; run < runs; run += 1) {
      const seeded = await seedPayment(); const delivery = hook("payment.captured", seeded.providerOrderId, seeded.providerPaymentId);
      const results = await Promise.all(Array.from({ length: concurrency }, () => processRazorpayEvent(db, { ...delivery, secret: "secret", eventId: `evt-${run}` })));
      expect(results.filter((result) => result.outcome === "processed")).toHaveLength(1); expect(results.filter((result) => result.outcome === "duplicate")).toHaveLength(7);
      expect(await count("GatewayEvent", "\"eventId\" = $1", [`evt-${run}`])).toBe(1);
      expect(await count("Payment", "\"orderId\" = $1", [seeded.orderId])).toBe(1);
      expect(await query<PaymentOrderRow>(`SELECT p."status" AS "paymentStatus", o."status" AS "orderStatus" FROM "Payment" p JOIN "Order" o ON o."id" = p."orderId" WHERE p."orderId" = $1`, [seeded.orderId])).toEqual([{ paymentStatus: "paid", orderStatus: "confirmed" }]);
      expect(await count("OrderStatusEvent", "\"orderId\" = $1", [seeded.orderId])).toBe(1); expect(await count("OutboxEvent", "\"organizationId\" = $1 AND type = 'payment.captured'", [seeded.organizationId])).toBe(1);
    }
  });

  it("deduplicates captured webhook replays with distinct event ids", async () => {
    const { processRazorpayEvent } = await import("@/lib/server/payment-service");
    for (let run = 0; run < runs; run += 1) {
      const seeded = await seedPayment(); const delivery = hook("payment.captured", seeded.providerOrderId, seeded.providerPaymentId);
      const results = await Promise.all(Array.from({ length: concurrency }, (_, index) => processRazorpayEvent(db, { ...delivery, secret: "secret", eventId: `evt-${run}-${index}` })));
      expect(results.every((result) => result.outcome === "processed" || result.outcome === "duplicate")).toBe(true);
      expect(await count("GatewayEvent", "\"eventId\" LIKE $1", [`evt-${run}-%`])).toBe(8); expect(await count("Payment", "\"orderId\" = $1", [seeded.orderId])).toBe(1);
      expect(await count("OrderStatusEvent", "\"orderId\" = $1", [seeded.orderId])).toBe(1); expect(await count("OutboxEvent", "\"organizationId\" = $1 AND type = 'payment.captured'", [seeded.organizationId])).toBe(1);
    }
  });

  it("preserves invariants when captured and failed events race", async () => {
    const { processRazorpayEvent } = await import("@/lib/server/payment-service");
    for (let run = 0; run < runs; run += 1) {
      const seeded = await seedPayment(); const captured = hook("payment.captured", seeded.providerOrderId, seeded.providerPaymentId); const failed = hook("payment.failed", seeded.providerOrderId, seeded.providerPaymentId);
      await Promise.all(Array.from({ length: concurrency }, (_, index) => processRazorpayEvent(db, { ...(index < 4 ? captured : failed), secret: "secret", eventId: `race-${run}-${index}` })));
      const rows = await query<PaymentOrderRow>(`SELECT p."status" AS "paymentStatus", o."status" AS "orderStatus" FROM "Payment" p JOIN "Order" o ON o."id" = p."orderId" WHERE p."orderId" = $1`, [seeded.orderId]);
      expect(rows).toHaveLength(1); expect(["paid", "failed"]).toContain(rows[0].paymentStatus); expect(rows[0].orderStatus === "confirmed").toBe(rows[0].paymentStatus === "paid");
      expect(await count("OrderStatusEvent", "\"orderId\" = $1", [seeded.orderId])).toBe(rows[0].paymentStatus === "paid" ? 1 : 0);
      expect(await count("OutboxEvent", "\"organizationId\" = $1 AND type = 'payment.failed'", [seeded.organizationId])).toBe(rows[0].paymentStatus === "failed" ? 1 : 0);
    }
  });
});
