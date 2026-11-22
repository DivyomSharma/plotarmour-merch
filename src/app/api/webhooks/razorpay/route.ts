import { getDb, getRazorpayWebhookSecret } from "@/lib/server/db";
import { handleRazorpayWebhook } from "@/lib/server/webhook-endpoint";

export async function POST(request: Request): Promise<Response> {
  return handleRazorpayWebhook(request, {
    getDb,
    getSecret: getRazorpayWebhookSecret,
  });
}
