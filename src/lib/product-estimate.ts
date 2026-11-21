import { MIN_ORDER_QUANTITY } from "@/lib/lead-validation";

export type QuantityBand = "10-100" | "100-500" | "500+";

export type OrderEstimate =
  | {
      ok: true;
      quantity: number;
      unitPaise: number;
      totalPaise: number;
      band: QuantityBand;
      reviewRecommended: boolean;
    }
  | {
      ok: false;
      reason: "below_moq" | "invalid_quantity" | "invalid_price";
    };

/**
 * Parses a displayed INR price into paise without using floating-point money
 * arithmetic. The price label must include the existing rupee marker.
 */
export function parseRupeePrice(value: string): number | null {
  const match = value.match(
    /^\s*(?:Rs\.?|₹)\s*(\d+(?:,\d+)*)(?:\.(\d{1,2}))?\s*$/i,
  );

  if (!match) return null;

  const integerLabel = match[1];
  const hasValidCommaGrouping =
    !integerLabel.includes(",") ||
    /^(?:\d{1,3}(?:,\d{2})*,\d{3}|\d{1,3}(?:,\d{3})+)$/.test(
      integerLabel,
    );
  if (!hasValidCommaGrouping) return null;

  const rupees = integerLabel.replace(/,/g, "");

  const wholeRupees = Number(rupees);
  if (!Number.isSafeInteger(wholeRupees)) return null;

  const paise = match[2] ? Number(match[2].padEnd(2, "0")) : 0;
  const unitPaise = wholeRupees * 100 + paise;

  return Number.isSafeInteger(unitPaise) && unitPaise > 0 ? unitPaise : null;
}

/**
 * Quantity bands are inclusive at their upper bounds: 10-100, then 101-500,
 * then 501 and above.
 */
export function estimateOrder({
  quantity,
  unitPaise,
}: {
  quantity: number;
  unitPaise: number;
}): OrderEstimate {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return { ok: false, reason: "invalid_quantity" };
  }

  if (quantity < MIN_ORDER_QUANTITY) {
    return { ok: false, reason: "below_moq" };
  }

  if (!Number.isSafeInteger(unitPaise) || unitPaise <= 0) {
    return { ok: false, reason: "invalid_price" };
  }

  if (quantity > Math.floor(Number.MAX_SAFE_INTEGER / unitPaise)) {
    return { ok: false, reason: "invalid_quantity" };
  }

  const totalPaise = quantity * unitPaise;
  const band: QuantityBand =
    quantity <= 100 ? "10-100" : quantity <= 500 ? "100-500" : "500+";

  return {
    ok: true,
    quantity,
    unitPaise,
    totalPaise,
    band,
    reviewRecommended: quantity > 500,
  };
}

export function formatPaiseAsRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
