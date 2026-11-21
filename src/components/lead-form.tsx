"use client";

import { FormEvent, useRef, useState } from "react";
import { buildWhatsAppLink } from "@/lib/contact";
import {
  type LeadValidationField,
  validateLead,
} from "@/lib/lead-validation";

type LeadFormState = {
  name: string;
  phone: string;
  organization: string;
  selectedProduct: string;
  expectedQuantity: string;
  remarks: string;
  customizationRequest: string;
  deliveryDate: string;
  deliveryLocation: string;
  budgetPerUnit: string;
  decoration: string;
  wantsSampleKit: boolean;
};
type FieldName = LeadValidationField;
type SubmissionState = "idle" | "sent" | "blocked" | "copied";

const initialState: LeadFormState = {
  name: "",
  phone: "",
  organization: "",
  selectedProduct: "",
  expectedQuantity: "",
  remarks: "",
  customizationRequest: "",
  deliveryDate: "",
  deliveryLocation: "",
  budgetPerUnit: "",
  decoration: "",
  wantsSampleKit: false,
};
const inputClass =
  "w-full rounded-2xl border border-[color:var(--border)] bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-soft focus:border-accent";
const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-soft";

function line(label: string, value: string | boolean) {
  return `${label}: ${typeof value === "boolean" ? (value ? "Yes" : "No") : value.trim() || "Not provided"}`;
}

export function LeadForm({
  defaultProduct = "",
  defaultHeadcount = "",
  defaultBudget = "",
}: {
  defaultProduct?: string;
  defaultHeadcount?: string;
  defaultBudget?: string;
}) {
  const [formState, setFormState] = useState<LeadFormState>({
    ...initialState,
    selectedProduct: defaultProduct,
    expectedQuantity: defaultHeadcount,
    budgetPerUnit: defaultBudget,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const update = <K extends keyof LeadFormState>(
    key: K,
    value: LeadFormState[K],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    if (key in errors)
      setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmission("idle");
  };
  const focusField = (field: FieldName) =>
    window.requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${field}"]`)
        ?.focus(),
    );
  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p className="mt-2 text-xs text-accent" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: FieldName) =>
    errors[field] ? `${field}-error` : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requiredFields: FieldName[] = [
      "name",
      "phone",
      "organization",
      "selectedProduct",
      "expectedQuantity",
    ];
    const validation = validateLead(formState);
    if (!validation.ok) {
      setErrors(validation.errors);
      setSubmission("idle");
      focusField(
        requiredFields.find((field) => validation.errors[field]) ?? "name",
      );
      return;
    }
    const { expectedQuantity: quantity, phone } = validation.value;
    const enquiry = [
      "PlotArmour Merch quote request",
      line("Name", formState.name),
      line("Phone", phone),
      line("Organization", formState.organization),
      line("Product or kit", formState.selectedProduct),
      line("Expected quantity", String(quantity)),
      line("Delivery date", formState.deliveryDate),
      line("Delivery location", formState.deliveryLocation),
      line("Budget per unit (INR)", formState.budgetPerUnit),
      line("Decoration", formState.decoration),
      line("Sample requested", formState.wantsSampleKit),
      line("Customisation request", formState.customizationRequest),
      line("Remarks", formState.remarks),
    ].join("\n");
    setMessage(enquiry);
    const popup = window.open(buildWhatsAppLink(enquiry), "_blank");
    if (popup) {
      popup.opener = null;
      setSubmission("sent");
    } else setSubmission("blocked");
  };
  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setSubmission("copied");
    } catch {
      setSubmission("blocked");
    }
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="surface-panel relative space-y-5 rounded-[28px] p-6 text-foreground md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[-0.04em]">
            Request a quote
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-soft">
            Your details open as a pre-filled WhatsApp message. Nothing is saved
            on this site.
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-text-soft">
          Quote request
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input
            data-field="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            value={formState.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Aman Singh"
            className={inputClass}
          />
          {fieldError("name")}
        </label>
        <label className="block">
          <span className={labelClass}>Phone number</span>
          <input
            data-field="phone"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            inputMode="tel"
            value={formState.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
          {fieldError("phone")}
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Organization</span>
          <input
            data-field="organization"
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={describedBy("organization")}
            value={formState.organization}
            onChange={(event) => update("organization", event.target.value)}
            placeholder="Robotics Club / HR Team / Startup Name"
            className={inputClass}
          />
          {fieldError("organization")}
        </label>
        <label className="block">
          <span className={labelClass}>Selected product</span>
          <input
            data-field="selectedProduct"
            aria-invalid={Boolean(errors.selectedProduct)}
            aria-describedby={describedBy("selectedProduct")}
            value={formState.selectedProduct}
            onChange={(event) => update("selectedProduct", event.target.value)}
            placeholder="Oversized T-Shirts"
            className={inputClass}
          />
          {fieldError("selectedProduct")}
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Expected quantity</span>
        <input
          data-field="expectedQuantity"
          aria-invalid={Boolean(errors.expectedQuantity)}
          aria-describedby={describedBy("expectedQuantity")}
          inputMode="numeric"
          value={formState.expectedQuantity}
          onChange={(event) => update("expectedQuantity", event.target.value)}
          placeholder="150"
          className={inputClass}
        />
        {fieldError("expectedQuantity")}
      </label>
      <label className="block">
        <span className={labelClass}>Remarks</span>
        <textarea
          value={formState.remarks}
          onChange={(event) => update("remarks", event.target.value)}
          placeholder="Deadline, city split, event date, or anything else that affects the quote."
          rows={3}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Customisation request</span>
        <textarea
          value={formState.customizationRequest}
          onChange={(event) =>
            update("customizationRequest", event.target.value)
          }
          placeholder="Front print, embroidery, neck label, hang tag, packaging, or brand-specific requests."
          rows={4}
          className={inputClass}
        />
      </label>
      <details className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Add more detail for a sharper quote (optional)
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Needed-by (in-hands) date</span>
            <input
              type="date"
              value={formState.deliveryDate}
              onChange={(event) => update("deliveryDate", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Delivery city / pincode</span>
            <input
              value={formState.deliveryLocation}
              onChange={(event) =>
                update("deliveryLocation", event.target.value)
              }
              placeholder="Pune 411001"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Budget per unit (INR)</span>
            <input
              inputMode="numeric"
              value={formState.budgetPerUnit}
              onChange={(event) => update("budgetPerUnit", event.target.value)}
              placeholder="500"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Decoration</span>
            <select
              value={formState.decoration}
              onChange={(event) => update("decoration", event.target.value)}
              className={inputClass}
            >
              <option value="">Not sure yet</option>
              <option>Screen print</option>
              <option>Embroidery</option>
              <option>DTF</option>
              <option>DTG</option>
              <option>Sublimation</option>
              <option>Patches</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-xs leading-5 text-text-soft">
          Have a logo or artwork? Share it in WhatsApp; file upload is not on
          this form yet.
        </p>
      </details>
      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={formState.wantsSampleKit}
          onChange={(event) => update("wantsSampleKit", event.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--accent)]"
        />
        <span>
          I would like a sample before placing the full order. Sample pricing is
          confirmed in the quote.
        </span>
      </label>
      <button
        type="submit"
        className="flex min-h-13 w-full items-center justify-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-accent-strong"
      >
        Open WhatsApp quote request
      </button>
      <div aria-live="polite" className="text-xs leading-5 text-text-soft">
        {submission === "sent" ? (
          "A pre-filled WhatsApp message has opened. Send it to share your request; no server-side lead has been captured."
        ) : submission === "blocked" ? (
          <>
            <p>
              WhatsApp could not be opened. Copy the details and paste them into
              WhatsApp to send your request.
            </p>
            <button
              type="button"
              onClick={copyDetails}
              className="mt-2 font-semibold text-foreground underline underline-offset-4"
            >
              Copy details
            </button>
          </>
        ) : submission === "copied" ? (
          "Details copied. Paste them into WhatsApp to send your request; no server-side lead has been captured."
        ) : (
          "This request is sent via WhatsApp. Quotation, approvals, payments, and production are confirmed separately."
        )}
      </div>
    </form>
  );
}
