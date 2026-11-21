// Server-side only: this module uses Node's crypto implementation.
import { createHash } from "node:crypto";

function canonicalizeValue(value: unknown, ancestors: Set<object>, inArray = false): string {
  if (value === null) return "null";

  switch (typeof value) {
    case "string":
    case "boolean":
      return JSON.stringify(value);
    case "number":
      if (!Number.isFinite(value)) throw new TypeError("Cannot canonicalize a non-finite number.");
      return JSON.stringify(value);
    case "undefined":
      if (inArray) return "null";
      throw new TypeError("Cannot canonicalize undefined at the top level.");
    case "function":
    case "symbol":
    case "bigint":
      throw new TypeError(`Cannot canonicalize ${typeof value}.`);
    case "object":
      break;
  }

  if (value instanceof Date) return JSON.stringify(value.toISOString());
  // Map, Set, Buffer and class instances have no enumerable keys and would all hash as "{}",
  // letting different contents collide; only arrays and plain objects are hashable.
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Cannot canonicalize a non-plain object (Map, Set, Buffer or class instance).");
  }
  if (ancestors.has(value)) throw new TypeError("Cannot canonicalize a cyclic structure.");

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => canonicalizeValue(entry, ancestors, true)).join(",")}]`;
    }

    const object = value as Record<string, unknown>;
    const entries = Object.keys(object)
      .sort()
      .filter((key) => object[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${canonicalizeValue(object[key], ancestors)}`);
    return `{${entries.join(",")}}`;
  } finally {
    ancestors.delete(value);
  }
}

export function canonicalize(value: unknown): string {
  return canonicalizeValue(value, new Set<object>());
}

export function contentHash(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

export type QuoteVersionSnapshotInput = {
  calculation: unknown;
  terms: unknown;
  billingAddress: unknown;
  shippingAddress: unknown;
  sizeMatrix: unknown;
};

export function buildQuoteVersionSnapshot(input: QuoteVersionSnapshotInput): {
  canonicalJson: QuoteVersionSnapshotInput;
  contentHash: string;
} {
  const canonicalJson = {
    calculation: input.calculation,
    terms: input.terms,
    billingAddress: input.billingAddress,
    shippingAddress: input.shippingAddress,
    sizeMatrix: input.sizeMatrix,
  };

  return { canonicalJson, contentHash: contentHash(canonicalJson) };
}
