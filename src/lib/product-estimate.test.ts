import { describe, expect, it } from "vitest";
import {
  estimateOrder,
  formatPaiseAsRupees,
  parseRupeePrice,
} from "@/lib/product-estimate";

describe("product estimate", () => {
  it("parses displayed rupee prices into integer paise", () => {
    expect(parseRupeePrice("Rs 350")).toBe(35_000);
    expect(parseRupeePrice("Rs 1,250")).toBe(125_000);
    expect(parseRupeePrice("₹ 99.50")).toBe(9_950);
    expect(parseRupeePrice("free")).toBeNull();
    expect(parseRupeePrice("")).toBeNull();
    expect(parseRupeePrice("Rs")).toBeNull();
    expect(parseRupeePrice("Rs 1,,250")).toBeNull();
  });

  it("calculates a total using paise", () => {
    expect(estimateOrder({ quantity: 50, unitPaise: 35_000 })).toEqual({
      ok: true,
      quantity: 50,
      unitPaise: 35_000,
      totalPaise: 1_750_000,
      band: "10-100",
      reviewRecommended: false,
    });
    expect(formatPaiseAsRupees(1_750_000)).toBe("₹17,500.00");
  });

  it("assigns inclusive quantity bands and flags large programmes", () => {
    expect(estimateOrder({ quantity: 10, unitPaise: 100 })).toMatchObject({
      ok: true,
      band: "10-100",
      reviewRecommended: false,
    });
    expect(estimateOrder({ quantity: 100, unitPaise: 100 })).toMatchObject({
      ok: true,
      band: "10-100",
    });
    expect(estimateOrder({ quantity: 101, unitPaise: 100 })).toMatchObject({
      ok: true,
      band: "100-500",
    });
    expect(estimateOrder({ quantity: 500, unitPaise: 100 })).toMatchObject({
      ok: true,
      band: "100-500",
    });
    expect(estimateOrder({ quantity: 501, unitPaise: 100 })).toMatchObject({
      ok: true,
      band: "500+",
      reviewRecommended: true,
    });
  });

  it("rejects unusable quantities and prices", () => {
    expect(estimateOrder({ quantity: 9, unitPaise: 100 })).toEqual({
      ok: false,
      reason: "below_moq",
    });
    expect(estimateOrder({ quantity: 10.5, unitPaise: 100 })).toEqual({
      ok: false,
      reason: "invalid_quantity",
    });
    expect(estimateOrder({ quantity: Number.NaN, unitPaise: 100 })).toEqual({
      ok: false,
      reason: "invalid_quantity",
    });
    expect(
      estimateOrder({ quantity: Number.MAX_SAFE_INTEGER, unitPaise: 100 }),
    ).toEqual({ ok: false, reason: "invalid_quantity" });
  });
});
