// Server-side only: HTTP boundary for public lead submissions.

import { createLead, parseLeadRequestBody, type SqlClient } from "@/lib/server/leads";

const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_KEYS = 10_000;

type LimitResult = { allowed: boolean; retryAfter?: number };
export type LeadRateLimiter = { check(key: string, now: number): LimitResult };

export class InMemoryLeadRateLimiter implements LeadRateLimiter {
  private readonly requests = new Map<string, number[]>();

  check(key: string, now: number): LimitResult {
    const recent = (this.requests.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000)) };
    }
    if (!this.requests.has(key) && this.requests.size >= MAX_TRACKED_KEYS) {
      const oldestKey = this.requests.keys().next().value;
      if (oldestKey) this.requests.delete(oldestKey);
    }
    recent.push(now);
    this.requests.set(key, recent);
    return { allowed: true };
  }
}

const defaultRateLimiter = new InMemoryLeadRateLimiter();

export type LeadEndpointDependencies = {
  getDb: () => SqlClient | null;
  now?: () => number;
  rateLimiter?: LeadRateLimiter;
};

function json(body: unknown, status: number, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function requestIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function safeError(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    const code = typeof (error as Error & { code?: unknown }).code === "string"
      ? (error as Error & { code: string }).code
      : undefined;
    return { code, message: error.message };
  }
  return { message: "Unknown error" };
}

export async function handleLeadRequest(request: Request, deps: LeadEndpointDependencies): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: "forbidden" }, 403);
    } catch {
      return json({ ok: false, error: "forbidden" }, 403);
    }
  }

  // Per-instance only: serverless production still needs a shared platform or edge limiter.
  const limit = (deps.rateLimiter ?? defaultRateLimiter).check(requestIp(request), (deps.now ?? Date.now)());
  if (!limit.allowed) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfter) });

  let text: string;
  try {
    text = await request.text();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const website = (body as Record<string, unknown>).website;
    if (typeof website === "string" && website.length > 0) return json({ ok: true }, 201);
  }

  const parsed = parseLeadRequestBody(body);
  if (!parsed.ok) return json(parsed, 422);
  const db = deps.getDb();
  if (!db) return json({ ok: false, error: "not_configured" }, 503);
  try {
    const { publicId } = await createLead(db, parsed.value);
    return json({ ok: true, publicId }, 201);
  } catch (error) {
    console.error("Lead save failed", safeError(error));
    return json({ ok: false, error: "save_failed" }, 500);
  }
}
