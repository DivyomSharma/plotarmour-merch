export const MIN_ORDER_QUANTITY = 10;

export type LeadValidationInput = {
  name: string;
  phone: string;
  organization: string;
  selectedProduct: string;
  expectedQuantity: string;
};

export type LeadValidationField = keyof LeadValidationInput;

export type ValidatedLead = Omit<LeadValidationInput, "phone" | "expectedQuantity"> & {
  phone: string;
  expectedQuantity: number;
};

export type LeadValidationResult =
  | { ok: true; value: ValidatedLead }
  | { ok: false; errors: Partial<Record<LeadValidationField, string>> };

export function normaliseIndianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const phone =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

  return /^\d{10}$/.test(phone) ? phone : null;
}

export function parseQuantity(value: string): number | null {
  const digits = value.replace(/[,\s]/g, "");

  if (!/^\d+$/.test(digits)) return null;

  const quantity = Number(digits);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

export function validateLead(input: LeadValidationInput): LeadValidationResult {
  const errors: Partial<Record<LeadValidationField, string>> = {};
  const requiredFields: LeadValidationField[] = [
    "name",
    "phone",
    "organization",
    "selectedProduct",
    "expectedQuantity",
  ];

  for (const field of requiredFields) {
    if (!input[field].trim()) errors[field] = "This field is required.";
  }

  const phone = normaliseIndianPhone(input.phone);
  if (input.phone.trim() && !phone) {
    errors.phone = "Enter a valid Indian 10-digit phone number.";
  }

  const expectedQuantity = parseQuantity(input.expectedQuantity);
  if (
    input.expectedQuantity.trim() &&
    (!expectedQuantity || expectedQuantity < MIN_ORDER_QUANTITY)
  ) {
    errors.expectedQuantity = "Minimum order is 10 pieces per style";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: input.name,
      phone: phone as string,
      organization: input.organization,
      selectedProduct: input.selectedProduct,
      expectedQuantity: expectedQuantity as number,
    },
  };
}
