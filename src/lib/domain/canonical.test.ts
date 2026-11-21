import { describe, expect, it } from "vitest";

import { buildQuoteVersionSnapshot, canonicalize, contentHash } from "./canonical";

describe("canonical serialization", () => {
  it("is independent of object insertion order, recursively", () => {
    expect(canonicalize({ z: 1, a: { y: 2, b: [3, { d: 4, c: 5 }] } })).toBe(
      canonicalize({ a: { b: [3, { c: 5, d: 4 }], y: 2 }, z: 1 }),
    );
  });

  it("serializes Dates and drops undefined object members", () => {
    expect(canonicalize({ when: new Date("2026-11-21T00:00:00.000Z"), ignored: undefined })).toBe(
      '{"when":"2026-11-21T00:00:00.000Z"}',
    );
  });

  it("rejects invalid numbers and cyclic values", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    expect(() => canonicalize(NaN)).toThrow(TypeError);
    expect(() => canonicalize(cyclic)).toThrow(TypeError);
  });

  it("rejects non-plain objects that would otherwise all hash as an empty object", () => {
    class Box {
      constructor(public value: number) {}
    }

    expect(() => canonicalize(new Map([["a", 1]]))).toThrow(TypeError);
    expect(() => canonicalize(new Set([1]))).toThrow(TypeError);
    expect(() => canonicalize(Buffer.from("x"))).toThrow(TypeError);
    expect(() => canonicalize({ nested: new Box(1) })).toThrow(TypeError);
    expect(canonicalize(Object.create(null))).toBe("{}");
  });

  it("changes a SHA-256 hash whenever content changes", () => {
    expect(contentHash({ amount: 100 })).not.toBe(contentHash({ amount: 101 }));
  });

  it("builds the snapshot shape used by quote versions", () => {
    const snapshot = buildQuoteVersionSnapshot({
      calculation: { total: 12_000 },
      terms: { validityDays: 30 },
      billingAddress: { state: "Maharashtra" },
      shippingAddress: { state: "Karnataka" },
      sizeMatrix: { M: 10 },
    });

    expect(snapshot.contentHash).toBe(contentHash(snapshot.canonicalJson));
    expect(snapshot.canonicalJson).toHaveProperty("calculation.total", 12_000);
  });
});
