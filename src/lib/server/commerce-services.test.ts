import { createHmac, randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { readMigrationSql } from "@/lib/db/migrations";
import { processRazorpayEvent } from "@/lib/server/payment-service";
import { acceptQuote } from "@/lib/server/quote-service";
import { transactionalPGlite } from "@/lib/server/test-db";

const org = "00000000-0000-0000-0000-000000000001";
const otherOrg = "00000000-0000-0000-0000-000000000002";
const quote = "00000000-0000-0000-0000-000000000010";
const version = "00000000-0000-0000-0000-000000000011";
const order = "00000000-0000-0000-0000-000000000012";
const actor = "00000000-0000-0000-0000-000000000013";
const hash = "a".repeat(64);
let database: PGlite;

async function count(table: string): Promise<number> {
  return (await database.query<{ count: number }>(`SELECT count(*)::int AS count FROM "${table}"`)).rows[0].count;
}

async function seedQuote(status = "sent", activeVersion = version, validUntil: string | null = null): Promise<void> {
  await database.exec(`INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ('${org}', 'Org', now()), ('${otherOrg}', 'Other', now());
    INSERT INTO "Quote" ("id", "publicId", "organizationId", "status", "validUntil", "updatedAt") VALUES ('${quote}', 'Q1', '${org}', '${status}', ${validUntil ? `'${validUntil}'` : "NULL"}, now());
    INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ('${version}', '${org}', '${quote}', 1, '{"terms":"net 15"}', '${hash}');
    UPDATE "Quote" SET "activeVersionId" = '${activeVersion}' WHERE "id" = '${quote}';
    INSERT INTO "QuoteLine" ("id", "organizationId", "quoteVersionId", "description", "quantity", "unitAmount", "totalAmount") VALUES ('${randomUUID()}', '${org}', '${version}', 'Tee', 10, 1000, 10000);`);
}

async function seedPayment(): Promise<void> {
  await database.exec(`INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ('${org}', 'Org', now());
    INSERT INTO "Quote" ("id", "publicId", "organizationId", "status", "updatedAt") VALUES ('${quote}', 'Q1', '${org}', 'accepted', now());
    INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ('${version}', '${org}', '${quote}', 1, '{}', '${hash}');
    INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "snapshot", "updatedAt") VALUES ('${order}', 'O1', '${org}', '${version}', '{}', now());
    INSERT INTO "PaymentAttempt" ("id", "organizationId", "orderId", "provider", "providerOrderId", "amount", "currency", "updatedAt") VALUES ('${randomUUID()}', '${org}', '${order}', 'razorpay', 'order_rzp', 10000, 'INR', now());`);
}

function webhook(event: string, amount = 10000, orderId = "order_rzp"): { body: string; signature: string } {
  const body = JSON.stringify({ event, payload: { payment: { entity: { id: "pay_rzp", order_id: orderId, amount, currency: "INR" } } } });
  return { body, signature: createHmac("sha256", "secret").update(body).digest("hex") };
}

beforeEach(async () => { database = new PGlite(); for (const migration of readMigrationSql()) await database.exec(migration); });
afterEach(async () => { await database.close(); });

describe("acceptQuote", () => {
  it("creates immutable approval, order snapshot, copied lines, audit and outbox; replay writes nothing", async () => {
    await seedQuote(); const db = transactionalPGlite(database);
    const input = { organizationId: org, quoteId: quote, quoteVersionId: version, presentedContentHash: hash, idempotencyKey: "key", actorId: actor };
    const accepted = await acceptQuote(db, input); expect(accepted.outcome).toBe("accepted");
    if (accepted.outcome !== "accepted") throw new Error("Expected quote acceptance.");
    expect(await count("OrderLine")).toBe(1); expect(await count("AuditEvent")).toBe(1); expect(await count("OutboxEvent")).toBe(1);
    expect((await database.query<{ status: string; snapshot: { terms: string } }>('SELECT "status", "snapshot" FROM "Order"')).rows[0]).toMatchObject({ status: "pending_advance", snapshot: { terms: "net 15" } });
    const before = await count("Order"); const replay = await acceptQuote(db, input); expect(replay).toEqual({ outcome: "replay", orderPublicId: accepted.orderPublicId }); expect(await count("Order")).toBe(before);
    await expect(acceptQuote(db, { ...input, idempotencyKey: "other" })).resolves.toEqual({ outcome: "reject", reason: "already_accepted" });
  });
  it("enforces tenant, active-version, status and hash rejection without writes", async () => {
    await seedQuote("draft"); const db = transactionalPGlite(database); const base = { organizationId: org, quoteId: quote, quoteVersionId: version, presentedContentHash: hash, idempotencyKey: "key", actorId: actor };
    await expect(acceptQuote(db, base)).resolves.toEqual({ outcome: "reject", reason: "not_sent" });
    await expect(acceptQuote(db, { ...base, organizationId: otherOrg })).resolves.toEqual({ outcome: "reject", reason: "not_found" });
    await expect(acceptQuote(db, { ...base, presentedContentHash: "wrong" })).resolves.toEqual({ outcome: "reject", reason: "hash_mismatch" });
  });
  it("rejects an expired quote without writes but replays an existing acceptance after expiry", async () => {
    const now = new Date("2026-01-02T00:00:00.000Z");
    await seedQuote("sent", version, "2026-01-01T00:00:00.000Z");
    const db = transactionalPGlite(database);
    const input = { organizationId: org, quoteId: quote, quoteVersionId: version, presentedContentHash: hash, idempotencyKey: "key", actorId: actor, now };
    await expect(acceptQuote(db, input)).resolves.toEqual({ outcome: "reject", reason: "expired" });
    expect(await count("QuoteApproval")).toBe(0); expect(await count("Order")).toBe(0);

    await database.exec(`UPDATE "Quote" SET "validUntil" = '2026-01-03T00:00:00.000Z' WHERE "id" = '${quote}'`);
    const accepted = await acceptQuote(db, input);
    if (accepted.outcome !== "accepted") throw new Error("Expected quote acceptance.");
    await database.exec(`UPDATE "Quote" SET "validUntil" = '2026-01-01T00:00:00.000Z' WHERE "id" = '${quote}'`);
    await expect(acceptQuote(db, input)).resolves.toEqual({ outcome: "replay", orderPublicId: accepted.orderPublicId });
  });
  it("rolls every acceptance write back if order creation conflicts", async () => {
    await seedQuote(); const db = transactionalPGlite(database);
    await database.exec(`INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "snapshot", "updatedAt") VALUES ('${order}', 'existing', '${org}', '${version}', '{}', now())`);
    await expect(acceptQuote(db, { organizationId: org, quoteId: quote, quoteVersionId: version, presentedContentHash: hash, idempotencyKey: "key", actorId: actor })).rejects.toThrow();
    expect(await count("QuoteApproval")).toBe(0); expect(await count("AuditEvent")).toBe(0); expect((await database.query<{ status: string }>('SELECT "status" FROM "Quote"')).rows[0].status).toBe("sent");
  });
});

describe("processRazorpayEvent", () => {
  it("verifies, records and processes captured exactly once", async () => {
    await seedPayment(); const db = transactionalPGlite(database); const hook = webhook("payment.captured");
    await expect(processRazorpayEvent(db, { rawBody: hook.body, signature: hook.signature, secret: "secret", eventId: "evt1" })).resolves.toEqual({ outcome: "processed" });
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Payment"')).rows[0].status).toBe("paid"); expect((await database.query<{ status: string }>('SELECT "status" FROM "Order"')).rows[0].status).toBe("confirmed"); expect(await count("OrderStatusEvent")).toBe(1); expect(await count("OutboxEvent")).toBe(1);
    await expect(processRazorpayEvent(db, { rawBody: hook.body, signature: hook.signature, secret: "secret", eventId: "evt1" })).resolves.toEqual({ outcome: "duplicate" });
    const failed = webhook("payment.failed"); await expect(processRazorpayEvent(db, { rawBody: failed.body, signature: failed.signature, secret: "secret", eventId: "evt2" })).resolves.toEqual({ outcome: "processed" }); expect((await database.query<{ status: string }>('SELECT "status" FROM "Payment"')).rows[0].status).toBe("paid");
    // A blocked downgrade is audited but must not announce "payment failed" for a paid payment.
    expect(await count("OutboxEvent")).toBe(1); expect(await count("AuditEvent")).toBe(1);
    // Replaying the capture under a new event id is a no-op: no second notification.
    const again = webhook("payment.captured"); await expect(processRazorpayEvent(db, { rawBody: again.body, signature: again.signature, secret: "secret", eventId: "evt3" })).resolves.toEqual({ outcome: "processed" }); expect(await count("OutboxEvent")).toBe(1);
  });
  it("rejects invalid signatures and handles mismatch, unmatched, crash recovery and ignored events", async () => {
    await seedPayment(); const db = transactionalPGlite(database); const hook = webhook("payment.captured");
    await expect(processRazorpayEvent(db, { rawBody: hook.body, signature: "0".repeat(64), secret: "secret", eventId: "bad" })).resolves.toEqual({ outcome: "invalid_signature" }); expect(await count("GatewayEvent")).toBe(0);
    const mismatch = webhook("payment.captured", 1); await expect(processRazorpayEvent(db, { rawBody: mismatch.body, signature: mismatch.signature, secret: "secret", eventId: "mismatch" })).resolves.toEqual({ outcome: "amount_mismatch" });
    const unmatched = webhook("payment.captured", 10000, "missing"); await expect(processRazorpayEvent(db, { rawBody: unmatched.body, signature: unmatched.signature, secret: "secret", eventId: "unmatched" })).resolves.toEqual({ outcome: "unmatched" });
    const unknown = webhook("refund.created"); await expect(processRazorpayEvent(db, { rawBody: unknown.body, signature: unknown.signature, secret: "secret", eventId: "unknown" })).resolves.toEqual({ outcome: "ignored" });
  });
  it("recovers an unprocessed ledger event after a prior crash", async () => {
    await seedPayment(); const db = transactionalPGlite(database); const hook = webhook("payment.captured");
    await database.query(`INSERT INTO "GatewayEvent" ("id", "provider", "eventId", "rawBody", "rawBodyHash") VALUES ($1, 'razorpay', 'crash', $2, 'hash')`, [randomUUID(), hook.body]);
    await expect(processRazorpayEvent(db, { rawBody: hook.body, signature: hook.signature, secret: "secret", eventId: "crash" })).resolves.toEqual({ outcome: "processed" });
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Order"')).rows[0].status).toBe("confirmed");
  });
  it("keeps an event for an unknown payment attempt retryable instead of losing the payment", async () => {
    await seedPayment(); const db = transactionalPGlite(database);
    await database.exec(`DELETE FROM "PaymentAttempt"`);
    const hook = webhook("payment.captured");
    const input = { rawBody: hook.body, signature: hook.signature, secret: "secret", eventId: "early" };
    await expect(processRazorpayEvent(db, input)).resolves.toEqual({ outcome: "unmatched" });
    expect((await database.query<{ processedAt: Date | null }>('SELECT "processedAt" FROM "GatewayEvent"')).rows[0].processedAt).toBeNull();
    const unmatchedAudit = await database.query<{ organizationId: string | null; actorKind: string; action: string; entityType: string; reason: string }>('SELECT "organizationId", "actorKind", "action", "entityType", "reason" FROM "AuditEvent"');
    expect(unmatchedAudit.rows).toEqual([{ organizationId: null, actorKind: "webhook", action: "payment.unmatched", entityType: "GatewayEvent", reason: "No payment attempt matches this Razorpay order id." }]);
    await expect(processRazorpayEvent(db, input)).resolves.toEqual({ outcome: "unmatched" });
    expect(await count("AuditEvent")).toBe(1);
    // The webhook raced ahead of the attempt row; once it commits, Razorpay retries the SAME event.
    await database.exec(`INSERT INTO "PaymentAttempt" ("id", "organizationId", "orderId", "provider", "providerOrderId", "amount", "currency", "updatedAt") VALUES ('${randomUUID()}', '${org}', '${order}', 'razorpay', 'order_rzp', 10000, 'INR', now())`);
    await expect(processRazorpayEvent(db, input)).resolves.toEqual({ outcome: "processed" });
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Order"')).rows[0].status).toBe("confirmed");
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Payment"')).rows[0].status).toBe("paid");
    await expect(processRazorpayEvent(db, input)).resolves.toEqual({ outcome: "duplicate" });
  });
});
