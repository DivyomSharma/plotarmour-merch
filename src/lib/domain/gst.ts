/**
 * Source: GSTN published state code list; finance to confirm before launch.
 * Codes 25 and 28 are retired and deliberately omitted.
 */
export const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
};

const GSTIN_FORMAT = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MOD_36_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function isValidGstStateCode(code: string): boolean {
  return Object.hasOwn(GST_STATE_CODES, code);
}

export type ParsedGstin =
  | { ok: true; stateCode: string; pan: string; entityNumber: string; checkChar: string }
  | { ok: false; reason: "format" | "state" | "checksum" };

function gstinCheckCharacter(value: string): string {
  let sum = 0;

  for (let index = 0; index < value.length; index += 1) {
    const characterValue = MOD_36_ALPHABET.indexOf(value[index]);
    const weightedValue = characterValue * (index % 2 === 0 ? 1 : 2);
    sum += Math.floor(weightedValue / 36) + (weightedValue % 36);
  }

  return MOD_36_ALPHABET[(36 - (sum % 36)) % 36];
}

export function parseGstin(gstin: string): ParsedGstin {
  const normalized = gstin.trim().toUpperCase();

  if (!GSTIN_FORMAT.test(normalized)) {
    return { ok: false, reason: "format" };
  }

  const stateCode = normalized.slice(0, 2);
  if (!isValidGstStateCode(stateCode)) {
    return { ok: false, reason: "state" };
  }

  if (normalized[14] !== gstinCheckCharacter(normalized.slice(0, 14))) {
    return { ok: false, reason: "checksum" };
  }

  return {
    ok: true,
    stateCode,
    pan: normalized.slice(2, 12),
    entityNumber: normalized[12],
    checkChar: normalized[14],
  };
}

export function stateCodeFromGstin(gstin: string): string | undefined {
  const parsed = parseGstin(gstin);
  return parsed.ok ? parsed.stateCode : undefined;
}
