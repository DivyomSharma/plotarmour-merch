type EnvSource = Record<string, string | undefined>;

export type ServerEnv = {
  databaseUrl?: string;
  razorpayWebhookSecret?: string;
  dbPoolMax: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
};

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}

function optionalValue(source: EnvSource, key: string): string | undefined {
  const value = source[key]?.trim();
  if (!value) return undefined;
  return value;
}

// DATABASE_URL and RAZORPAY_WEBHOOK_SECRET are OPTIONAL by design: without a database `/api/leads`
// answers 503 and the order form falls back to WhatsApp, and without a secret the webhook route
// answers 503. Malformed values always fail. Set REQUIRE_SERVER_ENV=true once the database and
// payments are mandatory for a deployment, so a missing value then fails loudly at first use.
export function validateServerEnv(source: EnvSource, strict = source.REQUIRE_SERVER_ENV === "true"):
  | { ok: true; value: ServerEnv }
  | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const databaseUrl = optionalValue(source, "DATABASE_URL");
  const razorpayWebhookSecret = optionalValue(source, "RAZORPAY_WEBHOOK_SECRET");
  const dbPoolMaxRaw = optionalValue(source, "DB_POOL_MAX");
  const supabaseUrl = optionalValue(source, "SUPABASE_URL");
  const supabaseAnonKey = optionalValue(source, "SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = optionalValue(source, "SUPABASE_SERVICE_ROLE_KEY");

  if (databaseUrl && !isPostgresUrl(databaseUrl)) issues.push("DATABASE_URL must be a postgres:// or postgresql:// URL");
  if (dbPoolMaxRaw && (!/^\d+$/.test(dbPoolMaxRaw) || Number(dbPoolMaxRaw) < 1)) {
    issues.push("DB_POOL_MAX must be a positive integer");
  }
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      if (url.protocol !== "https:") issues.push("SUPABASE_URL must use https");
    } catch {
      issues.push("SUPABASE_URL must be a valid https URL");
    }
  }

  if (strict) {
    if (!databaseUrl) issues.push("DATABASE_URL is required when REQUIRE_SERVER_ENV=true");
    if (!razorpayWebhookSecret) issues.push("RAZORPAY_WEBHOOK_SECRET is required when REQUIRE_SERVER_ENV=true");
  }

  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    value: {
      databaseUrl,
      razorpayWebhookSecret,
      dbPoolMax: dbPoolMaxRaw ? Number(dbPoolMaxRaw) : 3,
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceRoleKey,
    },
  };
}

export function getServerEnv(source: EnvSource = process.env): ServerEnv {
  const result = validateServerEnv(source);
  if (result.ok) return result.value;

  const message = `Invalid server environment: ${result.issues.join("; ")}`;
  if (source.NODE_ENV === "production") throw new Error(message);
  console.warn(message);
  return { dbPoolMax: 3 };
}
