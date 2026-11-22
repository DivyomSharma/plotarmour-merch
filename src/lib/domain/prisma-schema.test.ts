import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { stateMachines } from "./state-machines";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
// Lead is tenant-owned after qualification, but anonymous enquiries must exist before that point.
const organizationExceptions = new Set(["Organization", "StaffMember", "GatewayEvent"]);
// Anonymous leads and pre-tenant platform events are staff-only until attached to an organization.
const nullableOrganizationIdExceptions = new Set(["Lead", "AuditEvent", "OutboxEvent"]);

function block(kind: "model" | "enum", name: string): string {
  const match = schema.match(new RegExp(`${kind}\\s+${name}\\s+\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`Missing ${kind} ${name}`);
  return match[1];
}

function enumValues(name: string): string[] {
  return block("enum", name)
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[0])
    .filter((value) => value && !value.startsWith("//"));
}

function modelNames(): string[] {
  return [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((match) => match[1]);
}

describe("Prisma schema invariants", () => {
  it("keeps status enums aligned with the domain state machines", () => {
    const machines = [
      ["LeadStatus", "lead"],
      ["QuoteStatus", "quote"],
      ["OrderStatus", "order"],
      ["PaymentStatus", "payment"],
      ["ArtworkStatus", "artwork"],
    ] as const;

    for (const [enumName, machineName] of machines) {
      expect(new Set(enumValues(enumName))).toEqual(
        new Set(Object.keys(stateMachines[machineName])),
      );
    }
  });

  it("requires tenancy fields and indexes on every tenant-owned model", () => {
    for (const name of modelNames()) {
      if (organizationExceptions.has(name)) continue;
      const model = block("model", name);
      expect(model, `${name} needs organizationId`).toMatch(
        nullableOrganizationIdExceptions.has(name)
          ? /^\s*organizationId\s+String\?\s+@db\.Uuid/m
          : /^\s*organizationId\s+String\s+@db\.Uuid/m,
      );
      expect(model, `${name} needs an organization index`).toContain(
        "@@index([organizationId])",
      );
    }
  });

  it("does not use Float or Decimal for money-like fields", () => {
    for (const name of modelNames()) {
      const model = block("model", name);
      for (const line of model.split("\n")) {
        if (/^\s*\w*(amount|price|total|value|fee|cgst|sgst|igst|tcs)\w*/i.test(line)) {
          expect(line).not.toMatch(/\s(?:Float|Decimal)(?:\s|$)/);
        }
      }
    }
  });

  it("keeps audit and order status events append-only", () => {
    expect(block("model", "AuditEvent")).not.toMatch(/^\s*updatedAt\s/m);
    expect(block("model", "OrderStatusEvent")).not.toMatch(/^\s*updatedAt\s/m);
  });

  it("deduplicates gateway events by provider event id", () => {
    expect(block("model", "GatewayEvent")).toContain(
      "@@unique([provider, eventId])",
    );
  });

  it("does not cascade-delete records", () => {
    expect(schema).not.toContain("onDelete: Cascade");
  });

  it("allows multiple invoices per order", () => {
    expect(block("model", "Invoice")).toMatch(
      /^\s*orderId\s+String\s+@db\.Uuid/m,
    );
    expect(block("model", "Invoice")).toContain("@@index([orderId])");
  });

  it("keeps platform staff out of buyer organizations", () => {
    expect(block("model", "StaffMember")).not.toMatch(/organizationId/);
    expect(enumValues("OrganizationRole")).not.toEqual(
      expect.arrayContaining(["sales", "production", "finance"]),
    );
  });

  it("records anonymous enquiries with a normalized phone before qualification", () => {
    const lead = block("model", "Lead");
    expect(lead).toMatch(/^\s*contactPhone\s+String/m);
    expect(lead).toMatch(/^\s*organizationId\s+String\?\s+@db\.Uuid/m);
  });

  it("records quote validity separately from quote state", () => {
    expect(block("model", "Quote")).toMatch(/^\s*validUntil\s+DateTime\?/m);
  });
});
