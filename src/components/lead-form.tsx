"use client";

import { FormEvent, useState } from "react";
import { buildWhatsAppLink } from "@/lib/contact";

type LeadFormState = {
  name: string;
  organization: string;
  requirement: string;
  quantity: string;
  timeline: string;
};

const initialState: LeadFormState = {
  name: "",
  organization: "",
  requirement: "",
  quantity: "",
  timeline: "",
};

export function LeadForm() {
  const [formState, setFormState] = useState<LeadFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = [
      "Hi PlotArmour Merch,",
      "",
      `Name: ${formState.name}`,
      `Organization: ${formState.organization}`,
      `Requirement: ${formState.requirement}`,
      `Quantity: ${formState.quantity}`,
      `Timeline: ${formState.timeline}`,
      "",
      "Please send a quote in 24 hours.",
    ].join("\n");

    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
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
            Start your quote
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-soft">
            Share the brief and we&apos;ll come back with product direction,
            quantities, and a clean commercial response.
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-text-soft">
          24h
        </span>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
          Name
        </span>
        <input
          required
          value={formState.name}
          onChange={(event) =>
            setFormState((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Aman Singh"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
        />
      </label>

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
          Requirement
        </span>
        <textarea
          required
          value={formState.requirement}
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              requirement: event.target.value,
            }))
          }
          placeholder="Onboarding kit with hoodie, tee, bottle, custom sleeve card, and premium packaging."
          rows={4}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Quantity
          </span>
          <input
            required
            value={formState.quantity}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                quantity: event.target.value,
              }))
            }
            placeholder="150 units"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">
            Timeline
          </span>
          <input
            required
            value={formState.timeline}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                timeline: event.target.value,
              }))
            }
            placeholder="Needed in 10 days"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent"
          />
        </label>
      </div>

      <button
        type="submit"
        className="flex min-h-13 w-full items-center justify-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-accent-strong"
      >
        Send brief
      </button>

      <p className="text-xs leading-5 text-text-soft">
        {submitted
          ? "Brief received. Your details have been routed into the quote flow."
          : "No spam. Just a clear response on product mix, MOQ, and turnaround."}
      </p>
    </form>
  );
}
