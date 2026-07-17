"use client";

import { FormEvent, useState } from "react";
type LeadFormState = {
  name: string;
  phone: string;
  organization: string;
  selectedProduct: string;
  expectedQuantity: string;
  remarks: string;
  customizationRequest: string;
};

const initialState: LeadFormState = {
  name: "",
  phone: "",
  organization: "",
  selectedProduct: "",
  expectedQuantity: "",
  remarks: "",
  customizationRequest: "",
};

export function LeadForm() {
  const [formState, setFormState] = useState<LeadFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-panel relative space-y-5 rounded-[28px] p-6 text-foreground md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[-0.04em]">
            Create a lead
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-soft">
            Short intake only. No checkout, no signup, and no long procurement form.
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-text-soft">
          Lead
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Name
          </span>
          <input
            required
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Aman Singh"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Phone Number
          </span>
          <input
            required
            value={formState.phone}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            placeholder="+91 98XXXXXX12"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Organization
          </span>
          <input
            required
            value={formState.organization}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                organization: event.target.value,
              }))
            }
            placeholder="Robotics Club / HR Team / Startup Name"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Selected Product
          </span>
          <input
            required
            value={formState.selectedProduct}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                selectedProduct: event.target.value,
              }))
            }
            placeholder="Oversized T-Shirts"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
          Expected Quantity
        </span>
        <input
          required
          value={formState.expectedQuantity}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              expectedQuantity: event.target.value,
            }))
          }
          placeholder="150 units"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
          Remarks
        </span>
        <textarea
          value={formState.remarks}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              remarks: event.target.value,
            }))
          }
          placeholder="Deadline, city split, event date, or anything else that affects the quote."
          rows={3}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
          Customization Request
        </span>
        <textarea
          required
          value={formState.customizationRequest}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              customizationRequest: event.target.value,
            }))
          }
          placeholder="Front print, embroidery, neck label, hang tag, packaging, or brand-specific requests."
          rows={4}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="flex min-h-13 w-full items-center justify-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-accent-strong"
      >
        Create Lead
      </button>

      <p className="text-xs leading-5 text-text-soft">
        {submitted
          ? "Lead captured. Next step is sales discussion and project conversion."
          : "This intake creates a lead only. Quotation, approvals, payments, and production happen in the workspace."}
      </p>
    </form>
  );
}
