"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { parseQuantity } from "@/lib/lead-validation";
import {
  estimateOrder,
  formatPaiseAsRupees,
  parseRupeePrice,
} from "@/lib/product-estimate";

const inputClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-accent";

export function ProductEstimator({
  productName,
  unitPriceLabel,
}: {
  productName: string;
  unitPriceLabel: string;
}) {
  const [quantityInput, setQuantityInput] = useState("");
  const quantity = parseQuantity(quantityInput);
  const unitPaise = parseRupeePrice(unitPriceLabel);
  const estimate = useMemo(
    () =>
      quantity && unitPaise
        ? estimateOrder({ quantity, unitPaise })
        : null,
    [quantity, unitPaise],
  );
  const productHref = `/order?kit=${encodeURIComponent(productName)}`;
  const requestHref =
    estimate?.ok
      ? `${productHref}&headcount=${encodeURIComponent(String(estimate.quantity))}`
      : productHref;

  if (!unitPaise) {
    return (
      <Link
        href={productHref}
        className="inline-flex min-h-11 items-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Request quote
      </Link>
    );
  }

  const hasInput = quantityInput.trim() !== "";
  let invalidMessage: string | null = null;
  if (hasInput && !quantity) {
    invalidMessage =
      "Enter a whole-number quantity. Minimum order is 10 pieces per style.";
  } else if (hasInput && estimate && !estimate.ok) {
    invalidMessage =
      estimate.reason === "below_moq"
        ? "Minimum order is 10 pieces per style."
        : "Enter a smaller whole-number quantity. Minimum order is 10 pieces per style.";
  }

  return (
    <section aria-labelledby="order-estimator-title">
      <h2
        id="order-estimator-title"
        className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground"
      >
        Estimate your order
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-soft">
        Start with the blank-garment quantity. Your quote confirms the final
        programme.
      </p>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-text-soft">
        Quantity
        <input
          aria-label="Quantity"
          type="text"
          inputMode="numeric"
          aria-describedby={invalidMessage ? "quantity-message" : undefined}
          aria-invalid={Boolean(invalidMessage)}
          value={quantityInput}
          onChange={(event) => setQuantityInput(event.target.value)}
          placeholder="50"
          className={inputClass}
        />
      </label>
      <div
        className="mt-5 rounded-2xl border border-[color:var(--border)] bg-surface-soft p-4"
        aria-live="polite"
      >
        {!hasInput ? (
          <p className="text-sm leading-6 text-text-soft">
            Enter a quantity to see an indicative blank-garment total.
          </p>
        ) : null}
        {invalidMessage ? (
          <p
            id="quantity-message"
            className="text-sm leading-6 text-text-soft"
          >
            {invalidMessage}
          </p>
        ) : null}
        {estimate?.ok ? (
          <>
            <p className="text-sm text-foreground">
              Indicative blank-garment total: {" "}
              <strong>{formatPaiseAsRupees(estimate.totalPaise)}</strong>
            </p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-soft">Per unit</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {formatPaiseAsRupees(estimate.unitPaise)}
                </dd>
              </div>
              <div>
                <dt className="text-text-soft">Quantity band</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {estimate.band}
                </dd>
              </div>
            </dl>
            {estimate.reviewRecommended ? (
              <p className="mt-3 text-sm leading-6 text-text-soft">
                Large programme: we will review sourcing and delivery.
              </p>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-text-soft">
              Indicative, blank garment, ex-GST. Decoration, packaging, freight
              and GST are extra. Volume pricing is confirmed in your quote.
            </p>
          </>
        ) : null}
      </div>
      <Link
        href={requestHref}
        className="mt-5 inline-flex min-h-11 items-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Request quote for this estimate
      </Link>
    </section>
  );
}
