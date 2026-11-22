import { describe, expect, it } from "vitest";

import { catalogProducts } from "@/lib/product-catalog";

// product-catalog.ts is imported by client components, so everything in it ships to every
// visitor's browser. Supplier cost basis and supplier page URLs must never live here
// (PLAN.md: margin and supplier cost fields stay internal-only).
const FORBIDDEN_PUBLIC_FIELDS = ["bulkPrice", "samplePrice", "url", "supplier", "cost", "margin"];

describe("public catalogue data", () => {
  it("contains no supplier cost-basis or supplier URL fields", () => {
    expect(catalogProducts.length).toBeGreaterThan(0);
    for (const product of catalogProducts) {
      for (const field of FORBIDDEN_PUBLIC_FIELDS) {
        expect(Object.keys(product), `${product.slug} must not expose "${field}"`).not.toContain(field);
      }
    }
  });

  it("keeps the customer-facing indicative prices", () => {
    for (const product of catalogProducts) {
      expect(product.bulkPriceMarkedUp, product.slug).toMatch(/^Rs \d[\d,]*$/);
      expect(product.samplePriceMarkedUp, product.slug).toMatch(/^Rs \d[\d,]*$/);
    }
  });
});
