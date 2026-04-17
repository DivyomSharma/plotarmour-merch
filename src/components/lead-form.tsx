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
      className="brutal-panel-light relative space-y-4 bg-white p-5 text-black md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-black uppercase tracking-[0.12em]">
            Get Quote
          </p>
          <p className="mt-2 max-w-sm text-sm font-medium text-black/70">
            Drop the brief. We reply with design direction, quantity logic, and
            a bulk quote.
          </p>
        </div>
        <span className="border-[3px] border-black px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          24h
        </span>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em]">
          Name
        </span>
        <input
          required
          value={formState.name}
          onChange={(event) =>
            setFormState((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Aman Singh"
          className="w-full border-[3px] border-black bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-black/40 focus:bg-red-50"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em]">
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
          className="w-full border-[3px] border-black bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-black/40 focus:bg-red-50"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em]">
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
          placeholder="Fest hoodies + tees for core team. Need premium look, custom labels, and solid packaging."
          rows={4}
          className="w-full border-[3px] border-black bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-black/40 focus:bg-red-50"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em]">
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
            className="w-full border-[3px] border-black bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-black/40 focus:bg-red-50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em]">
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
            className="w-full border-[3px] border-black bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-black/40 focus:bg-red-50"
          />
        </label>
      </div>

      <button
        type="submit"
        className="flex min-h-14 w-full items-center justify-center border-[4px] border-black bg-red-500 px-5 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-black"
      >
        Send Brief
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
        {submitted
          ? "Brief queued. Your details have been pushed into the contact flow."
          : "No spam. Just merch direction, MOQ clarity, and a straight quote."}
      </p>
    </form>
  );
}
