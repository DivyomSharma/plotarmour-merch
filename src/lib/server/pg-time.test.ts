import { defaults, types } from "pg";
import { describe, expect, it } from "vitest";

import { configurePgTime, parseTimestampAsUtc } from "@/lib/server/pg-time";

describe("pg timestamp handling", () => {
  it("reads timestamp text as a UTC instant regardless of the machine time zone", () => {
    expect(parseTimestampAsUtc("2026-12-01 00:00:00").toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(parseTimestampAsUtc("2026-12-01 23:59:59.123").toISOString()).toBe("2026-12-01T23:59:59.123Z");
  });

  it("registers the UTC parser and UTC input serialisation", () => {
    configurePgTime();
    configurePgTime(); // idempotent
    expect(defaults.parseInputDatesAsUTC).toBe(true);
    const parse = types.getTypeParser(1114) as (value: string) => Date;
    expect(parse("2026-12-01 00:00:00").toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });
});
