import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createLead, generatePublicId, parseLeadRequestBody, type ParsedLead, type SqlClient } from "@/lib/server/leads";

let db: PGlite;
let client: SqlClient;

const input: ParsedLead = {
  name: "Aman Singh", phone: "9876543210", organization: "PlotArmour", selectedProduct: "Oversized T-Shirts", expectedQuantity: 10,
  kitSlug: null, deliveryDate: null, deliveryLocation: null, budgetPerUnitAmount: 50000, decoration: null, wantsSample: false, customizationRequest: null, remarks: null,
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(resolve(process.cwd(), "prisma/migrations/0001_init/migration.sql"), "utf8"));
  client = { query: (text, params) => db.query<Record<string, unknown>>(text, params as never) };
});
afterAll(async () => db.close());

describe("persisted leads", () => {
  it("generates unambiguous unique public IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, generatePublicId));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(id).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/);
  });

  it("stores normalized fields and retries a public ID collision", async () => {
    const first = await createLead(client, input, () => "COLLISION01");
    let calls = 0;
    const second = await createLead(client, { ...input, budgetPerUnitAmount: 12300 }, () => {
      calls += 1;
      return calls === 1 ? "COLLISION01" : "RECOVERED02";
    });
    expect(first.publicId).toBe("COLLISION01");
    expect(second.publicId).toBe("RECOVERED02");
    const row = await db.query<Record<string, unknown>>('SELECT "organizationId", "budgetPerUnitAmount", "source" FROM "Lead" WHERE "publicId" = $1', [second.publicId]);
    expect(row.rows[0]).toMatchObject({ organizationId: null, budgetPerUnitAmount: 12300, source: "website_order_form" });
  });

  it("keeps SQL-shaped input literal and leaves the table intact", async () => {
    const attack = "'; DROP TABLE \"Lead\"; --";
    await createLead(client, { ...input, name: attack }, () => "INJECTION03");
    const row = await db.query<Record<string, unknown>>('SELECT "contactName" FROM "Lead" WHERE "publicId" = $1', ["INJECTION03"]);
    expect(row.rows[0].contactName).toBe(attack);
    await expect(db.query('SELECT count(*) FROM "Lead"')).resolves.toBeDefined();
  });

  it("validates request caps, dates, budget, non-objects, and drops unknown fields", () => {
    const base = { name: "Aman", phone: "9876543210", organization: "Org", selectedProduct: "Tee", expectedQuantity: "10" };
    const parsed = parseLeadRequestBody({ ...base, deliveryLocation: "Pune", unknown: "discarded" });
    expect(parsed).toMatchObject({ ok: true, value: { deliveryLocation: "Pune" } });
    if (parsed.ok) expect("unknown" in parsed.value).toBe(false);
    for (const [key, value] of [["name", "x".repeat(121)], ["organization", "x".repeat(161)], ["selectedProduct", "x".repeat(161)], ["deliveryLocation", "x".repeat(121)], ["decoration", "x".repeat(41)], ["customizationRequest", "x".repeat(2001)], ["remarks", "x".repeat(2001)], ["kitSlug", "x".repeat(81)]]) {
      expect(parseLeadRequestBody({ ...base, [key]: value }).ok).toBe(false);
    }
    expect(parseLeadRequestBody({ ...base, deliveryDate: "2026-02-30" }).ok).toBe(false);
    expect(parseLeadRequestBody({ ...base, deliveryDate: "2000-01-01" }).ok).toBe(false);
    expect(parseLeadRequestBody({ ...base, budgetPerUnit: "12a" }).ok).toBe(false);
    expect(parseLeadRequestBody([]).ok).toBe(false);
  });
});
