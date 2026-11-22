import { describe, expect, it } from "vitest";

import { MIN_ORDER_QUANTITY } from "@/lib/lead-validation";
import {
  calculateQuote,
  QuoteCalculationError,
  roundHalfUp,
  RUSH_THRESHOLD_DAYS,
} from "./quote-calculation";

const baseInput = {
  lines: [{ description: "T-shirt", quantity: MIN_ORDER_QUANTITY, unitAmount: 1_000 }],
  sellerStateCode: "27",
  placeOfSupplyStateCode: "27",
  gstRateBp: 500,
  roundToRupee: false,
};

describe("calculateQuote", () => {
  it("uses CGST and SGST when state codes match, including an odd tax amount", () => {
    const result = calculateQuote({
      ...baseInput,
      lines: [{ description: "T-shirt", quantity: 10, unitAmount: 1 }],
    });

    expect(result).toMatchObject({ taxableValue: 10, cgst: 0, sgst: 1, igst: 0 });
    expect(result.cgst + result.sgst + result.igst).toBe(1);
  });

  it("uses IGST for inter-state supply", () => {
    const result = calculateQuote({ ...baseInput, placeOfSupplyStateCode: "29" });

    expect(result).toMatchObject({ cgst: 0, sgst: 0, igst: 500, total: 10_500 });
  });

  it("supports a zero percent input tax rate", () => {
    const result = calculateQuote({ ...baseInput, gstRateBp: 0 });

    expect(result).toMatchObject({ cgst: 0, sgst: 0, igst: 0, total: 10_000 });
  });

  it("rounds totals to the nearest rupee in both directions", () => {
    const up = calculateQuote({
      ...baseInput,
      roundToRupee: true,
      gstRateBp: 0,
      lines: [{ description: "T-shirt", quantity: 10, unitAmount: 1_005 }],
    });
    const down = calculateQuote({
      ...baseInput,
      roundToRupee: true,
      gstRateBp: 0,
      lines: [{ description: "T-shirt", quantity: 10, unitAmount: 1_004 }],
    });

    expect(up).toMatchObject({ roundingAdjustment: 50, total: 10_100 });
    expect(down).toMatchObject({ roundingAdjustment: -40, total: 10_000 });
  });

  it("rejects quantities below the MOQ and non-integer money", () => {
    expect(() =>
      calculateQuote({
        ...baseInput,
        lines: [{ description: "T-shirt", quantity: MIN_ORDER_QUANTITY - 1, unitAmount: 100 }],
      }),
    ).toThrow(QuoteCalculationError);
    expect(() =>
      calculateQuote({
        ...baseInput,
        lines: [{ description: "T-shirt", quantity: MIN_ORDER_QUANTITY, unitAmount: 100.5 }],
      }),
    ).toThrow(QuoteCalculationError);
  });

  it("marks 13 days as rush but not exactly 14 days", () => {
    const now = new Date("2026-11-21T00:00:00.000Z");
    const rush = calculateQuote({
      ...baseInput,
      now,
      requiredByDate: new Date("2026-12-04T00:00:00.000Z"),
    });
    const notRush = calculateQuote({
      ...baseInput,
      now,
      requiredByDate: new Date("2026-12-05T00:00:00.000Z"),
    });

    expect(RUSH_THRESHOLD_DAYS).toBe(14);
    expect(rush.manualReview.reasons).toContain("rush_deadline");
    expect(notRush.manualReview.reasons).not.toContain("rush_deadline");
  });

  it.each([
    ["splitDelivery", "split_delivery"],
    ["customFabricOrColour", "custom_fabric_or_colour"],
    ["unfamiliarArtwork", "unfamiliar_artwork"],
    ["nonStandardSizeMatrix", "non_standard_size_matrix"],
    ["specialPackaging", "special_packaging"],
    ["exceptionalQuantity", "exceptional_quantity"],
    ["supplierPriceUncertain", "supplier_price_uncertain"],
  ] as const)("flags %s for manual review", (flag, reason) => {
    const result = calculateQuote({ ...baseInput, flags: { [flag]: true } });
    expect(result.manualReview).toEqual({ required: true, reasons: [reason] });
  });

  it.each([
    ["sellerStateCode", ""],
    ["sellerStateCode", "Maharashtra"],
    ["placeOfSupplyStateCode", "29 "],
  ] as const)("rejects invalid %s %j", (field, stateCode) => {
    expect(() =>
      calculateQuote({ ...baseInput, [field]: stateCode }),
    ).toThrow(QuoteCalculationError);
  });

  it("always assigns every paise of tax across GST components", () => {
    let seed = 0x12345678;
    const random = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
      return seed;
    };

    for (let index = 0; index < 400; index += 1) {
      const quantity = MIN_ORDER_QUANTITY + (random() % 2_000);
      const unitAmount = random() % 100_000;
      const gstRateBp = random() % 2_801;
      const sameState = random() % 2 === 0;
      const result = calculateQuote({
        ...baseInput,
        lines: [{ description: "Generated", quantity, unitAmount }],
        placeOfSupplyStateCode: sameState ? "27" : "33",
        gstRateBp,
      });

      expect(result.cgst + result.sgst + result.igst).toBe(
        roundHalfUp(result.taxableValue * gstRateBp, 10_000),
      );
    }
  });
});
