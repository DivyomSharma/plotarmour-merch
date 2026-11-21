import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const migration = readFileSync(
  resolve(process.cwd(), "prisma/migrations/0001_init/migration.sql"),
  "utf8",
);
const policies = readFileSync(resolve(process.cwd(), "prisma/rls/policies.sql"), "utf8");

const orgA = "00000000-0000-0000-0000-0000000000a1";
const orgB = "00000000-0000-0000-0000-0000000000b1";
const userA = "00000000-0000-0000-0000-0000000000a2";
const userB = "00000000-0000-0000-0000-0000000000b2";
const staffUser = "00000000-0000-0000-0000-0000000000c1";
const gatewayId = "00000000-0000-0000-0000-0000000000d1";

type CountRow = { count: number };
type RlsRow = { relname: string; relrowsecurity: boolean };

let db: PGlite;

function modelBlock(name: string): string {
  const match = schema.match(new RegExp(`model\\s+${name}\\s+\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`Missing Prisma model ${name}`);
  return match[1];
}

function tenantTables(): string[] {
  return [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)]
    .map((match) => match[1])
    .filter((name) => /^\s*organizationId\s+String\s+@db\.Uuid/m.test(modelBlock(name)));
}

const tenantTableNames = tenantTables();
const allTableNames = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((match) => match[1]);

function quoted(name: string): string {
  return `"${name}"`;
}

async function count(table: string): Promise<number> {
  const result = await db.query<CountRow>(`SELECT count(*)::int AS count FROM ${quoted(table)}`);
  return result.rows[0].count;
}

async function asRole<T>(
  role: "anon" | "authenticated",
  sub: string | null,
  callback: () => Promise<T>,
): Promise<T> {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', ${sub ? `'${sub}'` : "''"}, false)`);
  await db.exec(`SET ROLE ${role}`);
  try {
    return await callback();
  } finally {
    await db.exec("RESET ROLE");
    await db.exec("SELECT set_config('request.jwt.claim.sub', '', false)");
  }
}

function id(n: number): string {
  return `10000000-0000-0000-0000-${n.toString().padStart(12, "0")}`;
}

async function seedOrganization(organizationId: string, userId: string, offset: number): Promise<void> {
  const ids = {
    member: id(offset + 1), address: id(offset + 2), lead: id(offset + 3), quote: id(offset + 4),
    quoteVersion: id(offset + 5), quoteLine: id(offset + 6), approval: id(offset + 7), order: id(offset + 8),
    orderLine: id(offset + 9), statusEvent: id(offset + 10), artwork: id(offset + 11), scan: id(offset + 12),
    attempt: id(offset + 13), payment: id(offset + 14), tax: id(offset + 15), invoice: id(offset + 16),
    audit: id(offset + 17), outbox: id(offset + 18),
  };
  const suffix = offset === 100 ? "a" : "b";
  await db.exec(`
    INSERT INTO "Organization" ("id", "name", "updatedAt") VALUES ('${organizationId}', 'Organization ${suffix}', now());
    INSERT INTO "OrganizationMember" ("id", "organizationId", "userId", "role", "updatedAt") VALUES ('${ids.member}', '${organizationId}', '${userId}', 'owner', now());
    INSERT INTO "Address" ("id", "organizationId", "label", "recipientName", "line1", "city", "state", "postalCode", "updatedAt") VALUES ('${ids.address}', '${organizationId}', 'Office', 'Buyer ${suffix}', '1 Test Street', 'Mumbai', 'MH', '400001', now());
    INSERT INTO "Lead" ("id", "publicId", "organizationId", "contactName", "contactPhone", "selectedProduct", "expectedQuantity", "updatedAt") VALUES ('${ids.lead}', 'lead-${suffix}', '${organizationId}', 'Buyer ${suffix}', '9999999999', 'T-shirt', 10, now());
    INSERT INTO "Quote" ("id", "publicId", "organizationId", "leadId", "updatedAt") VALUES ('${ids.quote}', 'quote-${suffix}', '${organizationId}', '${ids.lead}', now());
    INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ('${ids.quoteVersion}', '${organizationId}', '${ids.quote}', 1, '{"lines":[]}', 'hash-${suffix}');
    INSERT INTO "QuoteLine" ("id", "organizationId", "quoteVersionId", "description", "quantity", "unitAmount", "totalAmount") VALUES ('${ids.quoteLine}', '${organizationId}', '${ids.quoteVersion}', 'Shirt', 10, 1000, 10000);
    INSERT INTO "QuoteApproval" ("id", "organizationId", "quoteVersionId", "contentHash", "actorId", "approvedAt", "acceptIdempotencyKey") VALUES ('${ids.approval}', '${organizationId}', '${ids.quoteVersion}', 'hash-${suffix}', '${userId}', now(), 'approve-${suffix}');
    INSERT INTO "Order" ("id", "publicId", "organizationId", "quoteVersionId", "snapshot", "updatedAt") VALUES ('${ids.order}', 'order-${suffix}', '${organizationId}', '${ids.quoteVersion}', '{}', now());
    INSERT INTO "OrderLine" ("id", "organizationId", "orderId", "description", "quantity", "unitAmount", "totalAmount", "updatedAt") VALUES ('${ids.orderLine}', '${organizationId}', '${ids.order}', 'Shirt', 10, 1000, 10000, now());
    INSERT INTO "OrderStatusEvent" ("id", "organizationId", "orderId", "fromStatus", "toStatus") VALUES ('${ids.statusEvent}', '${organizationId}', '${ids.order}', 'pending_advance', 'confirmed');
    INSERT INTO "ArtworkAsset" ("id", "organizationId", "quoteId", "storageKey", "sha256", "mimeType", "sizeBytes", "updatedAt") VALUES ('${ids.artwork}', '${organizationId}', '${ids.quote}', 'artwork-${suffix}', 'sha-${suffix}', 'image/png', 1, now());
    INSERT INTO "FileScanResult" ("id", "organizationId", "artworkAssetId", "updatedAt") VALUES ('${ids.scan}', '${organizationId}', '${ids.artwork}', now());
    INSERT INTO "PaymentAttempt" ("id", "organizationId", "orderId", "provider", "providerOrderId", "amount", "updatedAt") VALUES ('${ids.attempt}', '${organizationId}', '${ids.order}', 'test', 'attempt-${suffix}', 10000, now());
    INSERT INTO "Payment" ("id", "organizationId", "orderId", "paymentAttemptId", "provider", "amount", "updatedAt") VALUES ('${ids.payment}', '${organizationId}', '${ids.order}', '${ids.attempt}', 'test', 10000, now());
    INSERT INTO "TaxSnapshot" ("id", "organizationId", "sellerGstin", "placeOfSupplyState", "hsnOrSac", "taxableValue", "cgst", "sgst", "igst", "tcs", "roundingAdjustment") VALUES ('${ids.tax}', '${organizationId}', '27ABCDE1234F1Z5', 'MH', '6109', 10000, 900, 900, 0, 0, 0);
    INSERT INTO "Invoice" ("id", "organizationId", "orderId", "taxSnapshotId", "number", "financialYear", "issuedAt", "updatedAt") VALUES ('${ids.invoice}', '${organizationId}', '${ids.order}', '${ids.tax}', 'INV-${suffix}', '2026-27', now(), now());
    INSERT INTO "AuditEvent" ("id", "organizationId", "action", "entityType", "entityId") VALUES ('${ids.audit}', '${organizationId}', 'created', 'Order', '${ids.order}');
    INSERT INTO "OutboxEvent" ("id", "organizationId", "type", "payload") VALUES ('${ids.outbox}', '${organizationId}', 'order.created', '{}');
  `);
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
  `);
  await db.exec(migration);
  await db.exec(policies);
  await seedOrganization(orgA, userA, 100);
  await seedOrganization(orgB, userB, 200);
  await db.exec(`INSERT INTO "StaffMember" ("id", "userId", "role", "updatedAt") VALUES ('${id(300)}', '${staffUser}', 'sales', now())`);
  await db.exec(`INSERT INTO "GatewayEvent" ("id", "provider", "eventId", "rawBody", "rawBodyHash") VALUES ('${gatewayId}', 'test', 'event-1', '{}', 'gateway-hash')`);
});

afterAll(async () => {
  await db.close();
});

describe("Postgres RLS policies", () => {
  it("isolates all tenant tables for organization A", async () => {
    await asRole("authenticated", userA, async () => {
      for (const table of tenantTableNames) expect(await count(table), table).toBe(1);
    });
    expect(tenantTableNames).toHaveLength(17);
  });

  it("isolates all tenant tables for organization B", async () => {
    await asRole("authenticated", userB, async () => {
      for (const table of tenantTableNames) expect(await count(table), table).toBe(1);
    });
  });

  it("lets staff see both organizations", async () => {
    await asRole("authenticated", staffUser, async () => {
      for (const table of tenantTableNames) expect(await count(table), table).toBe(2);
    });
  });

  it("denies anon access and no-sub authenticated access", async () => {
    await asRole("anon", null, async () => {
      for (const table of allTableNames) {
        await expect(count(table)).rejects.toBeDefined();
      }
    });
    await asRole("authenticated", null, async () => {
      for (const table of allTableNames) expect(await count(table), table).toBe(0);
    });
  });

  it("permits only member artwork inserts", async () => {
    await asRole("authenticated", userA, async () => {
      await expect(db.exec(`INSERT INTO "Quote" ("id", "publicId", "organizationId") VALUES ('${id(401)}', 'forbidden-quote', '${orgA}')`)).rejects.toThrow();
      await expect(db.exec(`INSERT INTO "ArtworkAsset" ("id", "organizationId", "storageKey", "sha256", "mimeType", "sizeBytes") VALUES ('${id(402)}', '${orgB}', 'forbidden-art', 'sha', 'image/png', 1)`)).rejects.toThrow();
      await expect(db.exec(`INSERT INTO "ArtworkAsset" ("id", "organizationId", "storageKey", "sha256", "mimeType", "sizeBytes", "updatedAt") VALUES ('${id(403)}', '${orgA}', 'allowed-art', 'sha', 'image/png', 1, now())`)).resolves.toBeDefined();
    });
  });

  it("hides gateway events and other staff rows from members", async () => {
    await asRole("authenticated", userA, async () => {
      expect(await count("GatewayEvent")).toBe(0);
      expect(await count("StaffMember")).toBe(0);
    });
  });

  it("enables RLS on every Prisma table", async () => {
    const result = await db.query<RlsRow>(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace
    `);
    const rlsByTable = new Map(result.rows.map((row) => [row.relname, row.relrowsecurity]));
    for (const table of allTableNames) expect(rlsByTable.get(table), table).toBe(true);
  });

  it("enforces append-only records even for the owner", async () => {
    for (const table of ["AuditEvent", "OrderStatusEvent", "QuoteVersion", "TaxSnapshot", "QuoteApproval"]) {
      await expect(db.exec(`UPDATE ${quoted(table)} SET "id" = "id"`)).rejects.toThrow();
      await expect(db.exec(`DELETE FROM ${quoted(table)}`)).rejects.toThrow();
    }
    await expect(db.exec(`UPDATE "GatewayEvent" SET "rawBody" = 'changed' WHERE "id" = '${gatewayId}'`)).rejects.toThrow();
    await expect(db.exec(`UPDATE "GatewayEvent" SET "processedAt" = now() WHERE "id" = '${gatewayId}'`)).resolves.toBeDefined();
  });

  // The tests below mutate the database, so they run after every count-based assertion above.
  it("blocks cross-tenant and spoofed quote approvals but allows a legitimate one", async () => {
    // Organization A gets a second, unapproved version so a legitimate approval is possible.
    await db.exec(`INSERT INTO "QuoteVersion" ("id", "organizationId", "quoteId", "versionNumber", "canonicalJson", "contentHash") VALUES ('${id(410)}', '${orgA}', '${id(104)}', 2, '{}', 'hash-a2')`);
    const approval = (rowId: number, versionId: string, actorId: string) =>
      `INSERT INTO "QuoteApproval" ("id", "organizationId", "quoteVersionId", "contentHash", "actorId", "approvedAt", "acceptIdempotencyKey") VALUES ('${id(rowId)}', '${orgA}', '${versionId}', 'h', '${actorId}', now(), 'key-${rowId}')`;

    await asRole("authenticated", userA, async () => {
      // Organization B's quote version: another tenant's row must not be approvable by A.
      await expect(db.exec(approval(411, id(205), userA))).rejects.toThrow();
      // The actor must be the caller, not someone else.
      await expect(db.exec(approval(412, id(410), userB))).rejects.toThrow();
      await expect(db.exec(approval(413, id(410), userA))).resolves.toBeDefined();
    });
  });

  it("keeps member artwork uploads in their initial state and inside their own organization", async () => {
    const artwork = (rowId: number, organizationId: string, extraColumns = "", extraValues = "") =>
      `INSERT INTO "ArtworkAsset" ("id", "organizationId", "storageKey", "sha256", "mimeType", "sizeBytes", "updatedAt"${extraColumns}) VALUES ('${id(rowId)}', '${organizationId}', 'k${rowId}', 's', 'image/png', 1, now()${extraValues})`;

    await asRole("authenticated", userA, async () => {
      // Scanning and approval are not member steps: an "approved" upload would bypass the scan.
      await expect(db.exec(artwork(420, orgA, `, "status"`, `, 'approved'`))).rejects.toThrow();
      // Attaching artwork to another tenant's quote must fail.
      await expect(db.exec(artwork(421, orgA, `, "quoteId"`, `, '${id(204)}'`))).rejects.toThrow();
      // Attaching to the member's own quote is allowed.
      await expect(db.exec(artwork(422, orgA, `, "quoteId"`, `, '${id(104)}'`))).resolves.toBeDefined();
    });
  });

  it("isolates leads and keeps unqualified leads staff-only", async () => {
    await db.exec(`INSERT INTO "Lead" ("id", "publicId", "contactName", "contactPhone", "selectedProduct", "expectedQuantity", "updatedAt") VALUES ('${id(430)}', 'lead-anonymous', 'Anonymous', '9999999999', 'Tee', 10, now())`);

    await asRole("authenticated", userA, async () => expect(await count("Lead")).toBe(1));
    await asRole("authenticated", userB, async () => expect(await count("Lead")).toBe(1));
    await asRole("authenticated", staffUser, async () => expect(await count("Lead")).toBe(3));
  });
});
