import { randomUUID } from "node:crypto";

import { assertTransition, type State } from "@/lib/domain/state-machines";
import { decideQuoteAcceptance } from "@/lib/domain/quote-acceptance";
import { generatePublicId, type SqlClient } from "@/lib/server/leads";
import { runSerializable, type TransactionalDb } from "@/lib/server/transaction";

type QuoteRow = { id: string; status: State<"quote">; "activeVersionId": string | null; version: number };
type VersionRow = { id: string; "canonicalJson": unknown; "contentHash": string };
type ApprovalRow = { "acceptIdempotencyKey": string; "contentHash": string };
type OrderRow = { "publicId": string };
type QuoteLineRow = { description: string; quantity: number; "unitAmount": number; "totalAmount": number; currency: string };

export type AcceptQuoteInput = {
  organizationId: string;
  quoteId: string;
  quoteVersionId: string;
  presentedContentHash: string;
  idempotencyKey: string;
  actorId: string;
  now?: Date;
};

export type AcceptQuoteResult =
  | { outcome: "accepted" | "replay"; orderPublicId: string }
  | { outcome: "reject"; reason: "not_found" | "not_active_version" | "not_sent" | "hash_mismatch" | "expired" | "already_accepted" | "missing_key" };

function json(value: unknown): string {
  return JSON.stringify(value);
}

async function insertAudit(tx: SqlClient, organizationId: string, action: string, entityType: string, entityId: string, actorId: string | null, actorKind: "user" | "webhook" = "user"): Promise<void> {
  await tx.query(`INSERT INTO "AuditEvent" ("id", "organizationId", "actorId", "actorKind", "action", "entityType", "entityId") VALUES ($1, $2, $3, $4::"ActorKind", $5, $6, $7)`, [randomUUID(), organizationId, actorId, actorKind, action, entityType, entityId]);
}

export async function acceptQuote(db: TransactionalDb, input: AcceptQuoteInput): Promise<AcceptQuoteResult> {
  const now = input.now ?? new Date();
  return runSerializable(db, async (tx) => {
    const quoteResult = await tx.query(`SELECT "id", "status", "activeVersionId", "version" FROM "Quote" WHERE "id" = $1 AND "organizationId" = $2 FOR UPDATE`, [input.quoteId, input.organizationId]);
    const quote = quoteResult.rows[0] as QuoteRow | undefined;
    if (!quote) return { outcome: "reject", reason: "not_found" };

    const versionResult = await tx.query(`SELECT "id", "canonicalJson", "contentHash" FROM "QuoteVersion" WHERE "id" = $1 AND "organizationId" = $2 AND "quoteId" = $3`, [input.quoteVersionId, input.organizationId, quote.id]);
    const version = versionResult.rows[0] as VersionRow | undefined;
    if (!version || quote.activeVersionId !== version.id) return { outcome: "reject", reason: "not_active_version" };

    const approvalResult = await tx.query(`SELECT "acceptIdempotencyKey", "contentHash" FROM "QuoteApproval" WHERE "quoteVersionId" = $1`, [version.id]);
    const approval = approvalResult.rows[0] as ApprovalRow | undefined;
    const decision = decideQuoteAcceptance({ quoteStatus: quote.status, versionContentHash: version.contentHash, presentedContentHash: input.presentedContentHash, idempotencyKey: input.idempotencyKey, existingApproval: approval && { idempotencyKey: approval.acceptIdempotencyKey, contentHash: approval.contentHash }, now });
    if (decision.outcome === "reject") return decision;
    if (decision.outcome === "replay") {
      const orderResult = await tx.query(`SELECT "publicId" FROM "Order" WHERE "quoteVersionId" = $1`, [version.id]);
      const order = orderResult.rows[0] as OrderRow | undefined;
      if (!order) throw new Error("Quote approval replay has no order.");
      return { outcome: "replay", orderPublicId: order.publicId };
    }

    assertTransition("quote", quote.status, "accepted");
    await tx.query(`INSERT INTO "QuoteApproval" ("id", "organizationId", "quoteVersionId", "contentHash", "actorId", "approvedAt", "acceptIdempotencyKey") VALUES ($1, $2, $3, $4, $5, $6, $7)`, [randomUUID(), input.organizationId, version.id, decision.approval.contentHash, input.actorId, decision.approval.approvedAt, decision.approval.acceptIdempotencyKey]);
    const updated = await tx.query(`UPDATE "Quote" SET "status" = 'accepted', "version" = "version" + 1, "updatedAt" = $1 WHERE "id" = $2 AND "organizationId" = $3 AND "version" = $4 RETURNING "id"`, [now, quote.id, input.organizationId, quote.version]);
    if (updated.rows.length !== 1) throw new Error("Quote optimistic lock failed.");

    const orderId = randomUUID();
    const orderPublicId = generatePublicId();
    await tx.query(`INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "status", "snapshot", "updatedAt") VALUES ($1, $2, $3, $4, 'pending_advance', $5::jsonb, $6)`, [orderId, orderPublicId, input.organizationId, version.id, json(version.canonicalJson), now]);
    const lines = await tx.query(`SELECT "description", "quantity", "unitAmount", "totalAmount", "currency" FROM "QuoteLine" WHERE "quoteVersionId" = $1 AND "organizationId" = $2`, [version.id, input.organizationId]);
    for (const line of lines.rows as QuoteLineRow[]) {
      await tx.query(`INSERT INTO "OrderLine" ("id", "organizationId", "orderId", "description", "quantity", "unitAmount", "totalAmount", "currency", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [randomUUID(), input.organizationId, orderId, line.description, line.quantity, line.unitAmount, line.totalAmount, line.currency, now]);
    }
    await insertAudit(tx, input.organizationId, "quote.accepted", "Quote", quote.id, input.actorId);
    await tx.query(`INSERT INTO "OutboxEvent" ("id", "organizationId", "type", "payload") VALUES ($1, $2, 'quote.accepted', $3::jsonb)`, [randomUUID(), input.organizationId, json({ quoteId: quote.id, orderId })]);
    return { outcome: "accepted", orderPublicId };
  });
}
