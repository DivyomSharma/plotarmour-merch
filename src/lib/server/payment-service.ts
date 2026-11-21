import { createHash, randomUUID } from "node:crypto";

import { assertTransition, type State } from "@/lib/domain/state-machines";
import { verifyRazorpaySignature } from "@/lib/domain/razorpay-signature";
import type { SqlClient } from "@/lib/server/leads";
import { runSerializable, type TransactionalDb } from "@/lib/server/transaction";

type GatewayRow = { id: string; "processedAt": Date | null };
type AttemptRow = { id: string; "organizationId": string; "orderId": string; amount: number; currency: string };
type PaymentRow = { id: string; status: State<"payment"> };
type OrderRow = { id: string; status: State<"order">; version: number };
type RazorpayPayment = { id: string; order_id: string; amount: number; currency: string };

export type ProcessRazorpayEventInput = { rawBody: string; signature: string; secret: string; eventId: string; now?: Date };
export type ProcessRazorpayEventResult = { outcome: "invalid_signature" | "duplicate" | "ignored" | "unmatched" | "amount_mismatch" | "processed" };

function json(value: unknown): string { return JSON.stringify(value); }

function paymentFromPayload(body: unknown): { event: string; payment: RazorpayPayment | null } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { event: "", payment: null };
  const record = body as Record<string, unknown>;
  const event = typeof record.event === "string" ? record.event : "";
  const payload = record.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { event, payment: null };
  const payment = (payload as Record<string, unknown>).payment;
  if (!payment || typeof payment !== "object" || Array.isArray(payment)) return { event, payment: null };
  const entity = (payment as Record<string, unknown>).entity;
  if (!entity || typeof entity !== "object" || Array.isArray(entity)) return { event, payment: null };
  const value = entity as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.order_id !== "string" || typeof value.amount !== "number" || typeof value.currency !== "string") return { event, payment: null };
  return { event, payment: { id: value.id, order_id: value.order_id, amount: value.amount, currency: value.currency } };
}

async function audit(tx: SqlClient, organizationId: string, action: string, entityType: string, entityId: string, reason: string): Promise<void> {
  await tx.query(`INSERT INTO "AuditEvent" ("id", "organizationId", "actorKind", "action", "entityType", "entityId", "reason") VALUES ($1, $2, 'webhook', $3, $4, $5, $6)`, [randomUUID(), organizationId, action, entityType, entityId, reason]);
}

async function markProcessed(tx: SqlClient, gatewayId: string, now: Date): Promise<void> {
  await tx.query(`UPDATE "GatewayEvent" SET "processedAt" = $1 WHERE "id" = $2`, [now, gatewayId]);
}

export async function processRazorpayEvent(db: TransactionalDb, input: ProcessRazorpayEventInput): Promise<ProcessRazorpayEventResult> {
  if (!verifyRazorpaySignature(input.rawBody, input.signature, input.secret)) return { outcome: "invalid_signature" };
  let parsed: unknown;
  try { parsed = JSON.parse(input.rawBody); } catch { return { outcome: "ignored" }; }
  const { event, payment } = paymentFromPayload(parsed);
  const now = input.now ?? new Date();
  const known = event === "payment.captured" || event === "payment.failed";
  return runSerializable(db, async (tx) => {
    const inserted = await tx.query(`INSERT INTO "GatewayEvent" ("id", "provider", "eventId", "rawBody", "rawBodyHash", "receivedAt") VALUES ($1, 'razorpay', $2, $3, $4, $5) ON CONFLICT ("provider", "eventId") DO NOTHING RETURNING "id", "processedAt"`, [randomUUID(), input.eventId, input.rawBody, createHash("sha256").update(input.rawBody).digest("hex"), now]);
    let gateway = inserted.rows[0] as GatewayRow | undefined;
    if (!gateway) {
      const existing = await tx.query(`SELECT "id", "processedAt" FROM "GatewayEvent" WHERE "provider" = 'razorpay' AND "eventId" = $1 FOR UPDATE`, [input.eventId]);
      gateway = existing.rows[0] as GatewayRow | undefined;
      if (!gateway) throw new Error("Gateway event conflict could not be read.");
      if (gateway.processedAt) return { outcome: "duplicate" };
    }
    if (!known || !payment) { await markProcessed(tx, gateway.id, now); return { outcome: "ignored" }; }

    const attempts = await tx.query(`SELECT "id", "organizationId", "orderId", "amount", "currency" FROM "PaymentAttempt" WHERE "provider" = 'razorpay' AND "providerOrderId" = $1`, [payment.order_id]);
    const attempt = attempts.rows[0] as AttemptRow | undefined;
    // Leave the ledger row UNPROCESSED: a webhook can race ahead of the attempt row, and Razorpay's
    // retry of the same event must still be able to complete the payment. The route must answer
    // non-2xx for "unmatched" so Razorpay retries.
    if (!attempt) return { outcome: "unmatched" };
    if (attempt.amount !== payment.amount || attempt.currency !== payment.currency) {
      await audit(tx, attempt.organizationId, "payment.amount_mismatch", "PaymentAttempt", attempt.id, "Gateway amount or currency differs from the payment attempt.");
      await markProcessed(tx, gateway.id, now);
      return { outcome: "amount_mismatch" };
    }

    const found = await tx.query(`SELECT "id", "status" FROM "Payment" WHERE "providerPaymentId" = $1 FOR UPDATE`, [payment.id]);
    let paymentRow = found.rows[0] as PaymentRow | undefined;
    if (!paymentRow) {
      const paymentId = randomUUID();
      await tx.query(`INSERT INTO "Payment" ("id", "organizationId", "orderId", "paymentAttemptId", "status", "provider", "providerPaymentId", "amount", "currency", "updatedAt") VALUES ($1, $2, $3, $4, 'initiated', 'razorpay', $5, $6, $7, $8)`, [paymentId, attempt.organizationId, attempt.orderId, attempt.id, payment.id, payment.amount, payment.currency, now]);
      paymentRow = { id: paymentId, status: "initiated" };
    }

    // Outbox events announce a state CHANGE. A blocked downgrade, a no-op replay or a rejected
    // transition must never notify anyone (e.g. "payment failed" for a paid payment).
    let stateChanged = false;
    if (event === "payment.captured") {
      if (paymentRow.status !== "paid") {
        if (paymentRow.status === "failed" || paymentRow.status === "expired" || paymentRow.status === "refunded") {
          await audit(tx, attempt.organizationId, "payment.illegal_transition", "Payment", paymentRow.id, `Cannot capture a ${paymentRow.status} payment.`);
        } else {
          assertTransition("payment", paymentRow.status, "paid");
          await tx.query(`UPDATE "Payment" SET "status" = 'paid', "version" = "version" + 1, "updatedAt" = $1 WHERE "id" = $2`, [now, paymentRow.id]);
          stateChanged = true;
          const orders = await tx.query(`SELECT "id", "status", "version" FROM "Order" WHERE "id" = $1 AND "organizationId" = $2 FOR UPDATE`, [attempt.orderId, attempt.organizationId]);
          const order = orders.rows[0] as OrderRow | undefined;
          if (!order) throw new Error("Payment attempt references no order.");
          if (order.status === "pending_advance") {
            assertTransition("order", "pending_advance", "confirmed");
            await tx.query(`UPDATE "Order" SET "status" = 'confirmed', "version" = "version" + 1, "updatedAt" = $1 WHERE "id" = $2 AND "version" = $3`, [now, order.id, order.version]);
            await tx.query(`INSERT INTO "OrderStatusEvent" ("id", "organizationId", "orderId", "actorId", "actorKind", "fromStatus", "toStatus", "reason", "createdAt") VALUES ($1, $2, $3, NULL, 'webhook', 'pending_advance', 'confirmed', 'payment.captured', $4)`, [randomUUID(), attempt.organizationId, order.id, now]);
          }
        }
      }
    } else if (paymentRow.status === "paid") {
      await audit(tx, attempt.organizationId, "payment.illegal_transition", "Payment", paymentRow.id, "A failed event cannot downgrade a paid payment.");
    } else if (paymentRow.status !== "failed") {
      assertTransition("payment", paymentRow.status, "failed");
      await tx.query(`UPDATE "Payment" SET "status" = 'failed', "version" = "version" + 1, "updatedAt" = $1 WHERE "id" = $2`, [now, paymentRow.id]);
      stateChanged = true;
    }

    // A captured payment equal to the attempt amount confirms the order: the attempt is the advance request. Advance-percentage policy is an owner decision.
    await markProcessed(tx, gateway.id, now);
    if (stateChanged) {
      await tx.query(`INSERT INTO "OutboxEvent" ("id", "organizationId", "type", "payload") VALUES ($1, $2, $3, $4::jsonb)`, [randomUUID(), attempt.organizationId, event, json({ paymentId: paymentRow.id, orderId: attempt.orderId, gatewayEventId: gateway.id })]);
    }
    return { outcome: "processed" };
  });
}
