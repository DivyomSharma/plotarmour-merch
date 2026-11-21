// Server-side only: HTTP boundary for Razorpay webhooks.

import { processRazorpayEvent } from "@/lib/server/payment-service";
import type { TransactionalDb } from "@/lib/server/transaction";

const MAX_BODY_BYTES = 256 * 1024;

export type RazorpayWebhookDependencies = {
  getDb: () => TransactionalDb | null;
  getSecret: () => string | undefined;
};

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function safeError(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    const candidate = error as Error & { code?: unknown };
    return {
      ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
      message: error.message,
    };
  }
  return { message: "Unknown error" };
}

export async function handleRazorpayWebhook(
  request: Request,
  deps: RazorpayWebhookDependencies,
): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  const signature = request.headers.get("x-razorpay-signature")?.trim();
  const eventId = request.headers.get("x-razorpay-event-id")?.trim();
  if (!signature || !eventId) {
    return json({ ok: false, error: "missing_headers" }, 400);
  }

  const secret = deps.getSecret();
  const db = deps.getDb();
  if (!secret || !db) return json({ ok: false, error: "not_configured" }, 503);

  try {
    const { outcome } = await processRazorpayEvent(db, {
      rawBody,
      signature,
      secret,
      eventId,
    });
    if (outcome === "invalid_signature") {
      return json({ ok: false, error: "invalid_signature" }, 401);
    }
    if (outcome === "unmatched") {
      // Non-2xx intentionally keeps Razorpay retrying while the ledger row remains unprocessed.
      return json({ ok: false, outcome }, 409);
    }
    return json({ ok: true, outcome }, 200);
  } catch (error) {
    console.error("Razorpay webhook processing failed", safeError(error));
    return json({ ok: false, error: "processing_failed" }, 500);
  }
}
