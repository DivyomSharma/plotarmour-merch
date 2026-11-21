import { MIN_ORDER_QUANTITY } from "@/lib/lead-validation";

export const RUSH_THRESHOLD_DAYS = 14;
const PAISE_PER_RUPEE = 100;
const BASIS_POINTS_PER_WHOLE = 10_000;

export class QuoteCalculationError extends Error {
  readonly name = "QuoteCalculationError";
}

export type ManualReviewFlags = {
  splitDelivery?: boolean;
  customFabricOrColour?: boolean;
  unfamiliarArtwork?: boolean;
  nonStandardSizeMatrix?: boolean;
  specialPackaging?: boolean;
  exceptionalQuantity?: boolean;
  supplierPriceUncertain?: boolean;
};

export type QuoteCalculationInput = {
  lines: ReadonlyArray<{
    description: string;
    quantity: number;
    unitAmount: number;
  }>;
  sellerState: string;
  placeOfSupplyState: string;
  gstRateBp: number;
  roundToRupee?: boolean;
  flags?: ManualReviewFlags;
  requiredByDate?: Date;
  now?: Date;
};

export type QuoteCalculation = {
  lines: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
  }>;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundingAdjustment: number;
  total: number;
  currency: "INR";
  calculationVersion: "2026-11-v1";
  manualReview: { required: boolean; reasons: string[] };
};

/** Rounds a non-negative integer division result to the nearest integer, with .5 rounded up. */
export function roundHalfUp(numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(numerator) || numerator < 0) {
    throw new QuoteCalculationError("Numerator must be a non-negative safe integer.");
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new QuoteCalculationError("Denominator must be a positive safe integer.");
  }

  return Math.floor((numerator + Math.floor(denominator / 2)) / denominator);
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new QuoteCalculationError(`${field} must be a non-negative safe integer.`);
  }
}

function assertSafeResult(value: number, field: string): number {
  if (!Number.isSafeInteger(value)) {
    throw new QuoteCalculationError(`${field} exceeds the supported integer range.`);
  }
  return value;
}

function manualReviewReasons(input: QuoteCalculationInput): string[] {
  const flags: Array<[keyof ManualReviewFlags, string]> = [
    ["splitDelivery", "split_delivery"],
    ["customFabricOrColour", "custom_fabric_or_colour"],
    ["unfamiliarArtwork", "unfamiliar_artwork"],
    ["nonStandardSizeMatrix", "non_standard_size_matrix"],
    ["specialPackaging", "special_packaging"],
    ["exceptionalQuantity", "exceptional_quantity"],
    ["supplierPriceUncertain", "supplier_price_uncertain"],
  ];
  const reasons = flags
    .filter(([flag]) => input.flags?.[flag])
    .map(([, reason]) => reason);

  if (input.requiredByDate) {
    const now = input.now ?? new Date();
    if (
      Number.isFinite(input.requiredByDate.getTime()) &&
      Number.isFinite(now.getTime()) &&
      input.requiredByDate.getTime() - now.getTime() <
        RUSH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
    ) {
      reasons.push("rush_deadline");
    }
  }

  return reasons;
}

export function calculateQuote(input: QuoteCalculationInput): QuoteCalculation {
  if (!input.lines.length) {
    throw new QuoteCalculationError("A quote needs at least one line.");
  }
  if (!input.sellerState.trim() || !input.placeOfSupplyState.trim()) {
    throw new QuoteCalculationError("Seller state and place-of-supply state are required.");
  }
  assertNonNegativeInteger(input.gstRateBp, "GST rate");
  if (input.gstRateBp > 2800) {
    throw new QuoteCalculationError("GST rate must not exceed 2800 basis points.");
  }

  const lines = input.lines.map((line, index) => {
    assertNonNegativeInteger(line.quantity, `Line ${index + 1} quantity`);
    assertNonNegativeInteger(line.unitAmount, `Line ${index + 1} unit amount`);
    if (line.quantity < MIN_ORDER_QUANTITY) {
      throw new QuoteCalculationError(
        `Line ${index + 1} quantity must be at least ${MIN_ORDER_QUANTITY}.`,
      );
    }

    // Pick fields explicitly: extra caller properties must never leak into the hash-bound snapshot.
    return {
      description: line.description,
      quantity: line.quantity,
      unitAmount: line.unitAmount,
      totalAmount: assertSafeResult(line.quantity * line.unitAmount, "Line total"),
    };
  });
  const taxableValue = assertSafeResult(
    lines.reduce((sum, line) => sum + line.totalAmount, 0),
    "Taxable value",
  );
  const tax = roundHalfUp(
    assertSafeResult(taxableValue * input.gstRateBp, "Tax calculation"),
    BASIS_POINTS_PER_WHOLE,
  );
  const sameState =
    input.sellerState.trim().toLowerCase() ===
    input.placeOfSupplyState.trim().toLowerCase();
  const cgst = sameState ? Math.floor(tax / 2) : 0;
  const sgst = sameState ? tax - cgst : 0;
  const igst = sameState ? 0 : tax;
  const beforeRounding = assertSafeResult(taxableValue + tax, "Quote total");
  const roundingAdjustment = input.roundToRupee === false
    ? 0
    : roundHalfUp(beforeRounding, PAISE_PER_RUPEE) * PAISE_PER_RUPEE - beforeRounding;
  const total = assertSafeResult(beforeRounding + roundingAdjustment, "Quote total");
  const reasons = manualReviewReasons(input);

  return {
    lines,
    taxableValue,
    cgst,
    sgst,
    igst,
    roundingAdjustment,
    total,
    currency: "INR",
    calculationVersion: "2026-11-v1",
    manualReview: { required: reasons.length > 0, reasons },
  };
}
