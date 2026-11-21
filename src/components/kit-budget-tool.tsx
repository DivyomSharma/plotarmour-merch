"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateKitBudget, type Kit } from "@/lib/kits";

const inputClass =
  "mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-accent";
const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function KitBudgetTool({ kit }: { kit: Kit }) {
  const [headcount, setHeadcount] = useState("");
  const [budget, setBudget] = useState("");
  const result = useMemo(
    () => calculateKitBudget(Number(headcount), Number(budget), kit),
    [headcount, budget, kit],
  );
  const orderHref = `/order?kit=${encodeURIComponent(kit.name)}&headcount=${encodeURIComponent(headcount)}&budget=${encodeURIComponent(budget)}`;
  const hasValues = headcount !== "" || budget !== "";
  const currentKitFits = result.fits.some(
    (candidate) => candidate.slug === kit.slug,
  );

  return (
    <section
      className="surface-panel rounded-[30px] p-5 md:p-7"
      aria-labelledby="budget-tool-title"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-text">
        Planning tool
      </p>
      <h2
        id="budget-tool-title"
        className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground"
      >
        Check the budget fit
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-soft">
        Indicative only. Your issued quote confirms products, customisation,
        tax, and delivery.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-text-soft">
          Headcount
          <input
            aria-label="Headcount"
            inputMode="numeric"
            min="10"
            type="number"
            value={headcount}
            onChange={(event) => setHeadcount(event.target.value)}
            placeholder="50"
            className={inputClass}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-text-soft">
          Per-head budget (INR)
          <input
            aria-label="Per-head budget in INR"
            inputMode="numeric"
            min="1"
            type="number"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="1200"
            className={inputClass}
          />
        </label>
      </div>
      <div
        className="mt-5 rounded-2xl border border-[color:var(--border)] bg-surface-soft p-4"
        aria-live="polite"
      >
        {!hasValues ? (
          <p className="text-sm leading-6 text-text-soft">
            Add a headcount of at least 10 and a per-head budget to compare the
            indicative options.
          </p>
        ) : null}
        {hasValues && !result.headcount ? (
          <p className="text-sm leading-6 text-text-soft">
            Minimum order is 10 pieces per style.
          </p>
        ) : null}
        {hasValues && result.headcount && !result.budgetPerHead ? (
          <p className="text-sm leading-6 text-text-soft">
            Add a valid per-head budget to see an indicative total.
          </p>
        ) : null}
        {result.totalRange ? (
          <>
            <p className="text-sm text-foreground">
              Indicative total for this kit:{" "}
              <strong>
                {formatINR(result.totalRange.min)}–
                {formatINR(result.totalRange.max)}
              </strong>
            </p>
            {result.belowMinimum ? (
              <p className="mt-2 text-sm leading-6 text-text-soft">
                Below indicative minimum, we can suggest a lighter kit.
              </p>
            ) : currentKitFits ? (
              <p className="mt-2 text-sm leading-6 text-text-soft">
                This kit fits the entered indicative budget.
              </p>
            ) : result.fits.length ? (
              <p className="mt-2 text-sm leading-6 text-text-soft">
                A closer indicative fit:{" "}
                {result.fits.map((candidate) => candidate.name).join(", ")}.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-text-soft">
                No listed kit sits in that range; request a quote and we can
                tailor the mix.
              </p>
            )}
          </>
        ) : null}
      </div>
      <Link
        href={orderHref}
        className="mt-5 inline-flex min-h-11 items-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Request quote
      </Link>
    </section>
  );
}
