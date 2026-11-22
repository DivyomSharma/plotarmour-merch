import { canTransition, type State } from "@/lib/domain/state-machines";

export type QuoteAcceptanceInput = {
  quoteStatus: State<"quote">;
  versionContentHash: string;
  presentedContentHash: string;
  idempotencyKey: string;
  existingApproval?: { idempotencyKey: string; contentHash: string };
  now: Date;
  expiresAt?: Date;
};

export type QuoteAcceptanceDecision =
  | {
      outcome: "accept";
      approval: {
        contentHash: string;
        acceptIdempotencyKey: string;
        approvedAt: Date;
      };
    }
  | { outcome: "replay" }
  | {
      outcome: "reject";
      reason: "not_sent" | "hash_mismatch" | "expired" | "already_accepted" | "missing_key";
    };

export function decideQuoteAcceptance(input: QuoteAcceptanceInput): QuoteAcceptanceDecision {
  if (!input.idempotencyKey.trim()) return { outcome: "reject", reason: "missing_key" };

  const existing = input.existingApproval;
  if (
    existing?.idempotencyKey === input.idempotencyKey &&
    existing.contentHash === input.presentedContentHash &&
    existing.contentHash === input.versionContentHash
  ) {
    return { outcome: "replay" };
  }
  if (input.presentedContentHash !== input.versionContentHash) {
    return { outcome: "reject", reason: "hash_mismatch" };
  }
  if (
    input.quoteStatus === "expired" ||
    (input.expiresAt !== undefined && input.expiresAt.getTime() <= input.now.getTime())
  ) {
    return { outcome: "reject", reason: "expired" };
  }
  if (input.quoteStatus === "accepted" || existing !== undefined) {
    return { outcome: "reject", reason: "already_accepted" };
  }
  if (!canTransition("quote", input.quoteStatus, "accepted")) {
    return { outcome: "reject", reason: "not_sent" };
  }

  return {
    outcome: "accept",
    approval: {
      contentHash: input.versionContentHash,
      acceptIdempotencyKey: input.idempotencyKey,
      approvedAt: input.now,
    },
  };
}
