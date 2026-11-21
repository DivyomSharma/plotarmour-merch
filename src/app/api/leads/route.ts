import { getDb } from "@/lib/server/db";
import { handleLeadRequest } from "@/lib/server/lead-endpoint";

export async function POST(request: Request): Promise<Response> {
  return handleLeadRequest(request, { getDb });
}
