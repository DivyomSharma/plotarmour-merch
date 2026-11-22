import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function readMigrationSql(): string[] {
  const migrationsDir = resolve(process.cwd(), "prisma/migrations");
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((folder) => readFileSync(resolve(migrationsDir, folder, "migration.sql"), "utf8"));
}
