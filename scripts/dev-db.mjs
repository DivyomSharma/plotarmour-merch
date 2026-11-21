// Local development database: an in-memory Postgres (PGlite) served over TCP, with this repo's
// migration and RLS policies applied and Supabase-style roles stubbed. No Docker, no account.
//
//   npm run dev:db
//   DATABASE_URL=postgresql://postgres@127.0.0.1:5433/postgres npm run dev
//
// Data is lost when the process stops. This is for development and tests only; production uses
// a real Postgres (for example Supabase), where `auth.uid()` and the roles already exist.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.DEV_DB_PORT ?? 5433);
const root = process.cwd();
const migration = readFileSync(resolve(root, "prisma/migrations/0001_init/migration.sql"), "utf8");
const policies = readFileSync(resolve(root, "prisma/rls/policies.sql"), "utf8");

const db = await PGlite.create();
await db.exec(`
  CREATE ROLE anon;
  CREATE ROLE authenticated;
  CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
`);
await db.exec(migration);
await db.exec(policies);

// PGlite is a single-connection database; the socket server multiplexes. Keep this at or above the
// app pool size (`max` in src/lib/server/db.ts).
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 5 });
await server.start();
console.log(`Local database ready (in-memory). Use:`);
console.log(`DATABASE_URL=postgresql://postgres@127.0.0.1:${port}/postgres`);

async function shutdown() {
  await server.stop();
  await db.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
