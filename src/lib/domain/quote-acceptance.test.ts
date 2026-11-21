import { describe, expect, it } from "vitest";

import { decideQuoteAcceptance } from "./quote-acceptance";

const now = new Date("2026-11-21T10:00:00.000Z");
const baseInput = {
  quoteStatus: "sent" as const,
  versionContentHash: "version-hash",
  presentedContentHash: "version-hash",
  idempotencyKey: "accept-1",
  now,
};

describe("decideQuoteAcceptance", () => {
  it("accepts a currently sent quote", () => {
    expect(decideQuoteAcceptance(baseInput)).toEqual({
      outcome: "accept",
      approval: {
        contentHash: "version-hash",
        acceptIdempotencyKey: "accept-1",
        approvedAt: now,
      },
    });
  });

  it("replays an identical accepted request", () => {
    expect(
      decideQuoteAcceptance({
        ...baseInput,
        quoteStatus: "accepted",
        existingApproval: { idempotencyKey: "accept-1", contentHash: "version-hash" },
      }),
    ).toEqual({ outcome: "replay" });
  });

  it.each([
    ["missing_key", { idempotencyKey: "   " }],
    ["hash_mismatch", { presentedContentHash: "old-hash" }],
    ["expired", { expiresAt: now }],
    ["already_accepted", { quoteStatus: "accepted" as const, idempotencyKey: "accept-2" }],
    ["not_sent", { quoteStatus: "draft" as const }],
  ] as const)("rejects %s", (reason, override) => {
    expect(decideQuoteAcceptance({ ...baseInput, ...override })).toEqual({
      outcome: "reject",
      reason,
    });
  });

  it("does not accept a draft quote", () => {
    expect(decideQuoteAcceptance({ ...baseInput, quoteStatus: "draft" })).toEqual({
      outcome: "reject",
      reason: "not_sent",
    });
  });
});
