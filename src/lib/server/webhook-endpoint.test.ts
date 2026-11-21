import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionalDb } from "@/lib/server/transaction";
import { transactionalPGlite } from "@/lib/server/test-db";
import { handleRazorpayWebhook } from "@/lib/server/webhook-endpoint";

const org = "00000000-0000-0000-0000-000000000001";
const quote = "00000000-0000-0000-0000-000000000010";
const version = "00000000-0000-0000-0000-000000000011";
const order = "00000000-0000-0000-0000-000000000012";
let database: PGlite;

function hook(body: string, eventId = "evt_1"): Request {
  const signature = createHmac("sha256", "secret").update(body).digest("hex");
  return new Request("https://merch.test/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": signature,
      "x-razorpay-event-id": eventId,
    },
    body,
  });
}

function capturedBody(orderId = "order_rzp", amount = 10000): string {
  return `{ "payload" : { "payment" : { "entity" : { "currency" : "INR", "amount" : ${amount}, "order_id" : "${orderId}", "id" : "pay_rzp" } } }, "event" : "payment.captured" }`;
}

async function seedAttempt(): Promise<void> {
  await database.exec(`INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ('${org}', 'Org', now());
    INSERT INTO "Quote" ("id", "publicId", "organizationId", "status", "updatedAt") VALUES ('${quote}', 'Q1', '${org}', 'accepted', now());
    INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ('${version}', '${org}', '${quote}', 1, '{}', '${"a".repeat(64)}');
    INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "snapshot", "updatedAt") VALUES ('${order}', 'O1', '${org}', '${version}', '{}', now());
    INSERT INTO "PaymentAttempt" ("id", "organizationId", "orderId", "provider", "providerOrderId", "amount", "currency", "updatedAt") VALUES ('${randomUUID()}', '${org}', '${order}', 'razorpay', 'order_rzp', 10000, 'INR', now());`);
}

function deps(): { getDb: () => TransactionalDb; getSecret: () => string } {
  const db = transactionalPGlite(database);
  return { getDb: () => db, getSecret: () => "secret" };
}

beforeEach(async () => {
  database = new PGlite();
  await database.exec(readFileSync(resolve(process.cwd(), "prisma/migrations/0001_init/migration.sql"), "utf8"));
});
afterEach(async () => database.close());

describe("Razorpay webhook endpoint", () => {
  it("uses the exact irregular raw body and maps processed, duplicate, ignored, and amount mismatch", async () => {
    await seedAttempt();
    const processed = await handleRazorpayWebhook(hook(capturedBody()), deps());
    expect(processed.status).toBe(200);
    expect(await processed.json()).toEqual({ ok: true, outcome: "processed" });
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Order"')).rows[0].status).toBe("confirmed");

    const duplicate = await handleRazorpayWebhook(hook(capturedBody(), "evt_1"), deps());
    expect(await duplicate.json()).toEqual({ ok: true, outcome: "duplicate" });

    const ignored = await handleRazorpayWebhook(hook('{ "event": "refund.created" }', "evt_2"), deps());
    expect(await ignored.json()).toEqual({ ok: true, outcome: "ignored" });

    const mismatch = await handleRazorpayWebhook(hook(capturedBody("order_rzp", 1), "evt_3"), deps());
    expect(await mismatch.json()).toEqual({ ok: true, outcome: "amount_mismatch" });
  });

  it("rejects a one-byte tamper without writing a ledger row", async () => {
    const body = capturedBody();
    const signed = hook(body);
    const response = await handleRazorpayWebhook(new Request("https://merch.test/api/webhooks/razorpay", {
      method: "POST",
      headers: {
        "x-razorpay-signature": signed.headers.get("x-razorpay-signature") ?? "",
        "x-razorpay-event-id": "evt_1",
      },
      body: `${body.slice(0, -1)} `,
    }), deps());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_signature" });
    expect((await database.query('SELECT * FROM "GatewayEvent"')).rows).toHaveLength(0);
  });

  it("returns 400 for each missing required header", async () => {
    const body = capturedBody();
    const headerCases: Array<Record<string, string>> = [
      { "x-razorpay-event-id": "evt" },
      { "x-razorpay-signature": "a".repeat(64) },
    ];
    for (const headers of headerCases) {
      const response = await handleRazorpayWebhook(new Request("https://merch.test/hook", { method: "POST", headers, body }), deps());
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ ok: false, error: "missing_headers" });
    }
  });

  it("enforces the byte limit and configuration prerequisites", async () => {
    const huge = new Request("https://merch.test/hook", { method: "POST", headers: { "content-length": String(256 * 1024 + 1) }, body: "{}" });
    expect((await handleRazorpayWebhook(huge, deps())).status).toBe(413);
    const actualHuge = new Request("https://merch.test/hook", { method: "POST", body: "x".repeat(256 * 1024 + 1) });
    expect((await handleRazorpayWebhook(actualHuge, deps())).status).toBe(413);
    const noSecret = await handleRazorpayWebhook(hook(capturedBody()), { getDb: deps().getDb, getSecret: () => undefined });
    expect(noSecret.status).toBe(503);
    const noDb = await handleRazorpayWebhook(hook(capturedBody()), { getDb: () => null, getSecret: () => "secret" });
    expect(noDb.status).toBe(503);
  });

  it("returns 409 until an unmatched event can be retried after its attempt exists", async () => {
    const body = capturedBody();
    const early = await handleRazorpayWebhook(hook(body, "early"), deps());
    expect(early.status).toBe(409);
    expect((await database.query<{ processedAt: Date | null }>('SELECT "processedAt" FROM "GatewayEvent"')).rows[0].processedAt).toBeNull();
    await seedAttempt();
    const retried = await handleRazorpayWebhook(hook(body, "early"), deps());
    expect(await retried.json()).toEqual({ ok: true, outcome: "processed" });
    expect((await database.query<{ status: string }>('SELECT "status" FROM "Order"')).rows[0].status).toBe("confirmed");
  });

  it("returns a retryable failure without logging the body", async () => {
    const body = capturedBody();
    const failingDb: TransactionalDb = {
      query: async () => ({ rows: [] }),
      transaction: async <T>() => { throw new Error("database unavailable") as T; },
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await handleRazorpayWebhook(hook(body), { getDb: () => failingDb, getSecret: () => "secret" });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "processing_failed" });
    expect(spy).toHaveBeenCalledWith("Razorpay webhook processing failed", { message: "database unavailable" });
    expect(JSON.stringify(spy.mock.calls)).not.toContain(body);
    spy.mockRestore();
  });
});
