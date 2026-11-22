import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyRazorpaySignature } from "./razorpay-signature";

describe("verifyRazorpaySignature", () => {
  const secret = "webhook-secret";
  const body = '{"event":"payment.captured"}';
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  it("accepts a valid raw-body signature", () => {
    expect(verifyRazorpaySignature(body, signature, secret)).toBe(true);
  });

  it("rejects altered data or secrets", () => {
    expect(verifyRazorpaySignature(`${body} `, signature, secret)).toBe(false);
    expect(verifyRazorpaySignature(body, signature, "wrong-secret")).toBe(false);
  });

  it("rejects malformed signatures without throwing", () => {
    expect(verifyRazorpaySignature(body, "garbage", secret)).toBe(false);
    expect(verifyRazorpaySignature(body, "ab".repeat(31), secret)).toBe(false);
    expect(verifyRazorpaySignature(body, signature, "")).toBe(false);
  });

  it("supports Uint8Array bodies", () => {
    const bytes = new TextEncoder().encode(body);
    expect(verifyRazorpaySignature(bytes, signature, secret)).toBe(true);
  });
});
