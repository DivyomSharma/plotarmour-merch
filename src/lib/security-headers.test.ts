import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

function parseDirectives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split(";").map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    }),
  );
}

describe("contentSecurityPolicy", () => {
  it("enforces the policy instead of only reporting it", () => {
    expect(securityHeaders.find((header) => header.key.startsWith("Content-Security-Policy"))).toMatchObject({
      key: "Content-Security-Policy",
      value: contentSecurityPolicy,
    });
  });

  it("has the required restrictive directives without unsafe eval or wildcard sources", () => {
    const directives = parseDirectives(contentSecurityPolicy);

    expect(directives.get("frame-ancestors")).toEqual(["'none'"]);
    expect(directives.get("base-uri")).toEqual(["'self'"]);
    expect(directives.get("form-action")).toEqual(["'self'"]);
    expect(directives.get("object-src")).toEqual(["'none'"]);
    expect(directives.get("img-src")).toEqual([
      "'self'",
      "data:",
      "blob:",
      "https://www.bulkplaintshirt.com",
    ]);
    expect([...directives.values()].flat()).not.toContain("'unsafe-eval'");
    expect([...directives.values()].flat()).not.toContain("*");
  });
});
