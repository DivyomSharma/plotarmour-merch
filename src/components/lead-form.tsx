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
type SubmissionState = "idle" | "sent" | "saved" | "blocked" | "copied";

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
  const [reference, setReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State drives the UI, but is not updated synchronously; the ref blocks same-tick double submits.
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const update = <K extends keyof LeadFormState>(
    key: K,
    value: LeadFormState[K],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    if (key in errors)
      setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmission("idle");
    setReference(null);
  };
  const focusField = (field: FieldName) =>
    window.requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${field}"]`)
        ?.focus(),
    );
  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p className="mt-2 text-xs text-accent-text" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: FieldName) =>
    errors[field] ? `${field}-error` : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
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
    const enquiryLines = [
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
    ];
    const initialEnquiry = enquiryLines.join("\n");
    setMessage(initialEnquiry);

    // Open synchronously so the browser preserves the submit gesture for WhatsApp.
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    submittingRef.current = true;
    setIsSubmitting(true);

    // A blocked popup must not lose the enquiry: it is still saved, and the visitor gets the
    // reference plus the copy fallback.
    let publicId: string | null = null;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          phone: formState.phone,
          organization: formState.organization,
          selectedProduct: formState.selectedProduct,
          expectedQuantity: formState.expectedQuantity,
          remarks: formState.remarks,
          customizationRequest: formState.customizationRequest,
          deliveryDate: formState.deliveryDate,
          deliveryLocation: formState.deliveryLocation,
          budgetPerUnit: formState.budgetPerUnit,
          decoration: formState.decoration,
          wantsSample: formState.wantsSampleKit,
          website: honeypotRef.current?.value ?? "",
        }),
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);
      if (
        response.status === 201 &&
        result &&
        typeof result === "object" &&
        typeof (result as { publicId?: unknown }).publicId === "string"
      ) {
        publicId = (result as { publicId: string }).publicId;
      }
    } catch {
      // Saving is optional; WhatsApp remains the delivery path.
    } finally {
      window.clearTimeout(timeout);
    }

    const enquiry = publicId
      ? [...enquiryLines, `Reference: ${publicId}`].join("\n")
      : initialEnquiry;
    setMessage(enquiry);
    setReference(publicId);
    if (popup) {
      popup.location.href = buildWhatsAppLink(enquiry);
      setSubmission(publicId ? "saved" : "sent");
    } else {
      setSubmission("blocked");
    }
    submittingRef.current = false;
    setIsSubmitting(false);
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
            {submission === "saved"
              ? "Your request has been saved and opens as a pre-filled WhatsApp message."
              : "Your details open as a pre-filled WhatsApp message so we can reply to you there."}
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
      <input
        ref={honeypotRef}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex min-h-13 w-full items-center justify-center rounded-full border border-accent bg-accent px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Open WhatsApp quote request"}
      </button>
      <div aria-live="polite" className="text-xs leading-5 text-text-soft">
        {submission === "sent" ? (
          "A pre-filled WhatsApp message has opened. Send it to share your request; nothing is saved on this site."
        ) : submission === "saved" ? (
          <>Saved. Your reference is {reference}. WhatsApp is opening so we can reply to you.</>
        ) : submission === "blocked" ? (
          <>
            <p>
              {reference ? `Saved. Your reference is ${reference}. ` : ""}
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
          reference
            ? `Details copied. Your reference is ${reference}. Paste them into WhatsApp to send your request.`
            : "Details copied. Paste them into WhatsApp to send your request; nothing is saved on this site."
        ) : (
          "This request is sent via WhatsApp. Quotation, approvals, payments, and production are confirmed separately."
        )}
      </div>
    </form>
  );
}
