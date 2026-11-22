// Server-side only: validates and persists website lead enquiries.

import { randomInt, randomUUID } from "node:crypto";

import { validateLead } from "@/lib/lead-validation";

export type SqlClient = {
  query(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
};

export type ParsedLead = {
  name: string;
  phone: string;
  organization: string;
  selectedProduct: string;
  expectedQuantity: number;
  kitSlug: string | null;
  deliveryDate: string | null;
  deliveryLocation: string | null;
  budgetPerUnitAmount: number | null;
  decoration: string | null;
  wantsSample: boolean;
  customizationRequest: string | null;
  remarks: string | null;
};

export type ParseLeadResult =
  | { ok: true; value: ParsedLead }
  | { ok: false; errors: Record<string, string> };

const PUBLIC_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePublicId(): string {
  return Array.from(
    { length: 10 },
    () => PUBLIC_ID_ALPHABET[randomInt(PUBLIC_ID_ALPHABET.length)],
  ).join("");
}

function stringValue(
  body: Record<string, unknown>,
  key: string,
  errors: Record<string, string>,
): string {
  const value = body[key];
  if (typeof value !== "string") {
    errors[key] = "Must be a string.";
    return "";
  }
  return value.trim();
}

function optionalString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
  errors: Record<string, string>,
): string | null {
  const value = body[key];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    errors[key] = "Must be a string.";
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) errors[key] = `Must be ${maxLength} characters or fewer.`;
  return trimmed || null;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseLeadRequestBody(body: unknown): ParseLeadResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, errors: { body: "Expected a JSON object." } };
  }

  const values = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const name = stringValue(values, "name", errors);
  const phone = stringValue(values, "phone", errors);
  const organization = stringValue(values, "organization", errors);
  const selectedProduct = stringValue(values, "selectedProduct", errors);
  const expectedQuantity = stringValue(values, "expectedQuantity", errors);
  const required = validateLead({ name, phone, organization, selectedProduct, expectedQuantity });
  if (!required.ok) Object.assign(errors, required.errors);
  if (name.length > 120) errors.name = "Must be 120 characters or fewer.";
  if (organization.length > 160) errors.organization = "Must be 160 characters or fewer.";
  if (selectedProduct.length > 160) errors.selectedProduct = "Must be 160 characters or fewer.";

  const deliveryDate = optionalString(values, "deliveryDate", 10, errors);
  if (deliveryDate) {
    if (!validDate(deliveryDate)) errors.deliveryDate = "Enter a valid date in YYYY-MM-DD format.";
    else {
      const today = new Date();
      const yesterday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1);
      if (Date.parse(`${deliveryDate}T00:00:00.000Z`) < yesterday) {
        errors.deliveryDate = "Date cannot be in the past.";
      }
    }
  }
  const deliveryLocation = optionalString(values, "deliveryLocation", 120, errors);
  const decoration = optionalString(values, "decoration", 40, errors);
  const customizationRequest = optionalString(values, "customizationRequest", 2000, errors);
  const remarks = optionalString(values, "remarks", 2000, errors);
  const kitSlug = optionalString(values, "kitSlug", 80, errors);
  if (kitSlug && !/^[a-z0-9-]+$/.test(kitSlug)) errors.kitSlug = "Use lowercase letters, numbers, and hyphens only.";

  let budgetPerUnitAmount: number | null = null;
  const budget = values.budgetPerUnit;
  if (budget !== undefined && budget !== null && budget !== "") {
    if (typeof budget !== "string" || !/^\d{1,7}$/.test(budget.trim())) {
      errors.budgetPerUnit = "Use up to 7 digits.";
    } else budgetPerUnitAmount = Number(budget.trim()) * 100;
  }

  let wantsSample = false;
  if (values.wantsSample !== undefined) {
    if (typeof values.wantsSample !== "boolean") errors.wantsSample = "Must be a boolean.";
    else wantsSample = values.wantsSample;
  }

  if (Object.keys(errors).length > 0 || !required.ok) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name: required.value.name.trim(),
      phone: required.value.phone,
      organization: required.value.organization.trim(),
      selectedProduct: required.value.selectedProduct.trim(),
      expectedQuantity: required.value.expectedQuantity,
      kitSlug,
      deliveryDate,
      deliveryLocation,
      budgetPerUnitAmount,
      decoration,
      wantsSample,
      customizationRequest,
      remarks,
    },
  };
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

export async function createLead(
  db: SqlClient,
  input: ParsedLead,
  publicIdGenerator: () => string = generatePublicId,
): Promise<{ publicId: string }> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const publicId = publicIdGenerator();
    try {
      await db.query(
        `WITH new_lead AS (
          INSERT INTO "Lead" ("id", "publicId", "organizationId", "contactName", "contactPhone", "companyName", "selectedProduct", "kitSlug", "expectedQuantity", "deliveryDate", "deliveryLocation", "budgetPerUnitAmount", "decoration", "wantsSample", "customizationRequest", "remarks", "source", "updatedAt")
          VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'website_order_form', now())
          RETURNING "id", "publicId"
        )
        INSERT INTO "OutboxEvent" ("id", "organizationId", "type", "payload")
        SELECT $16, NULL, 'lead.created', jsonb_build_object('leadId', "id", 'publicId', "publicId")
        FROM new_lead`,
        [randomUUID(), publicId, input.name, input.phone, input.organization, input.selectedProduct, input.kitSlug, input.expectedQuantity, input.deliveryDate, input.deliveryLocation, input.budgetPerUnitAmount, input.decoration, input.wantsSample, input.customizationRequest, input.remarks, randomUUID()],
      );
      return { publicId };
    } catch (error) {
      if (errorCode(error) !== "23505" || attempt === 2) throw error;
    }
  }
  throw new Error("Unreachable lead creation state.");
}
