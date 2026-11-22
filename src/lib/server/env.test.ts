import { describe, expect, it } from "vitest";

import { validateServerEnv } from "@/lib/server/env";

describe("validateServerEnv", () => {
  it("accepts valid server configuration", () => {
    expect(validateServerEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:password@db.example.test:5432/merch",
      RAZORPAY_WEBHOOK_SECRET: "placeholder-webhook-secret",
      DB_POOL_MAX: "4",
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "placeholder-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "placeholder-service-role-key",
    })).toMatchObject({ ok: true, value: { dbPoolMax: 4 } });
  });

  it("rejects malformed values without exposing their contents", () => {
    const result = validateServerEnv({
      NODE_ENV: "production",
      DATABASE_URL: "mysql://not-postgres",
      DB_POOL_MAX: "0",
      SUPABASE_URL: "http://not-https.example.test",
    });

    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.issues).toEqual(expect.arrayContaining([
        "DATABASE_URL must be a postgres:// or postgresql:// URL",
        "DB_POOL_MAX must be a positive integer",
        "SUPABASE_URL must use https",
      ]));
      expect(result.issues.join(" ")).not.toContain("mysql://not-postgres");
    }
  });

  it("keeps the database and webhook secret optional, so a deployment without them degrades to 503 and WhatsApp", () => {
    // Production with nothing configured is the real state of the site before a database exists.
    expect(validateServerEnv({ NODE_ENV: "production" })).toMatchObject({ ok: true, value: { dbPoolMax: 3 } });
  });

  it("requires both values only when REQUIRE_SERVER_ENV=true", () => {
    const result = validateServerEnv({ NODE_ENV: "production", REQUIRE_SERVER_ENV: "true" });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.issues).toEqual([
        "DATABASE_URL is required when REQUIRE_SERVER_ENV=true",
        "RAZORPAY_WEBHOOK_SECRET is required when REQUIRE_SERVER_ENV=true",
      ]);
    }
    expect(validateServerEnv({
      REQUIRE_SERVER_ENV: "true",
      DATABASE_URL: "postgresql://user:password@db.example.test:5432/merch",
      RAZORPAY_WEBHOOK_SECRET: "placeholder-webhook-secret",
    })).toMatchObject({ ok: true });
  });
});
