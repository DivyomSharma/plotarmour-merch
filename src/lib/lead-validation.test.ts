import { describe, expect, it } from "vitest";
import {
  MIN_ORDER_QUANTITY,
  normaliseIndianPhone,
  parseQuantity,
  validateLead,
} from "@/lib/lead-validation";

const validLead = {
  name: "Aman Singh",
  phone: "9876543210",
  organization: "PlotArmour",
  selectedProduct: "Oversized T-Shirts",
  expectedQuantity: "10",
};

describe("lead validation", () => {
  it("parses comma-separated positive quantities", () => {
    expect(parseQuantity("1,000")).toBe(1000);
  });

  it("rejects quantities below the MOQ, non-digits, and empty values", () => {
    expect(validateLead({ ...validLead, expectedQuantity: "5" })).toEqual({
      ok: false,
      errors: { expectedQuantity: "Minimum order is 10 pieces per style" },
    });
    expect(parseQuantity("abc")).toBeNull();
    expect(parseQuantity("")).toBeNull();
    expect(MIN_ORDER_QUANTITY).toBe(10);
  });

  it("accepts Indian phone numbers with or without the country code", () => {
    expect(normaliseIndianPhone("+91 98765 43210")).toBe("9876543210");
    expect(normaliseIndianPhone("9876543210")).toBe("9876543210");
    expect(normaliseIndianPhone("919876543210")).toBe("9876543210");
  });

  it("rejects invalid Indian phone numbers", () => {
    expect(normaliseIndianPhone("12345")).toBeNull();
  });
});
