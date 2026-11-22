// Server-side only: make node-postgres agree with Prisma about timestamps.
//
// Prisma stores `DateTime` as `timestamp(3)` (no time zone) holding UTC. node-postgres would
// otherwise READ such values as local time and WRITE JS Dates as local wall-clock time (Postgres
// drops the offset for `timestamp without time zone`). On a server whose zone is not UTC that
// shifts every instant, e.g. a quote's validUntil would expire hours early.
import { defaults, types } from "pg";

const TIMESTAMP_WITHOUT_TIME_ZONE_OID = 1114;

/** Parses node-postgres text such as "2026-12-01 00:00:00.123" as a UTC instant. */
export function parseTimestampAsUtc(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}

let configured = false;

export function configurePgTime(): void {
  if (configured) return;
  defaults.parseInputDatesAsUTC = true;
  types.setTypeParser(TIMESTAMP_WITHOUT_TIME_ZONE_OID, parseTimestampAsUtc);
  configured = true;
}
