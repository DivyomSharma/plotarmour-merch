import { describe, expect, it } from "vitest";

import {
  GST_STATE_CODES,
  isValidGstStateCode,
  parseGstin,
  stateCodeFromGstin,
} from "./gst";

describe("GST state codes", () => {
  it("contains only active two-digit codes", () => {
    expect(GST_STATE_CODES).not.toHaveProperty("25");
    expect(GST_STATE_CODES).not.toHaveProperty("28");
    expect(Object.keys(GST_STATE_CODES).every((code) => /^\d{2}$/.test(code))).toBe(true);
  });

  it("validates known state codes", () => {
    expect(isValidGstStateCode("27")).toBe(true);
    expect(isValidGstStateCode("28")).toBe(false);
  });
});

describe("parseGstin", () => {
  it("parses a known valid GSTIN", () => {
    expect(parseGstin("27AAPFU0939F1ZV")).toEqual({
      ok: true,
      stateCode: "27",
      pan: "AAPFU0939F",
      entityNumber: "1",
      checkChar: "V",
    });
  });

  it("accepts lowercase and surrounding whitespace", () => {
    expect(stateCodeFromGstin("  27aapfu0939f1zv  ")).toBe("27");
  });

  it("rejects an invalid checksum", () => {
    expect(parseGstin("27AAPFU0939F1ZW")).toEqual({ ok: false, reason: "checksum" });
  });

  it("rejects an invalid format", () => {
    expect(parseGstin("27AAPFU0939F1Z")).toEqual({ ok: false, reason: "format" });
  });

  it("rejects an unknown state", () => {
    expect(parseGstin("28AAPFU0939F1ZV")).toEqual({ ok: false, reason: "state" });
  });
});
