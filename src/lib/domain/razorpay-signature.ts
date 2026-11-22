// Server-side only: this module uses Node's crypto implementation.
import { createHmac, timingSafeEqual } from "node:crypto";

// The caller must pass the unparsed raw body and verify it before parsing.
export function verifyRazorpaySignature(
  rawBody: string | Uint8Array,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;

  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest();
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}
