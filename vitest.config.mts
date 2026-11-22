import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import { defineConfig } from "vitest/config";

const projectRoot = realpathSync.native(fileURLToPath(new URL(".", import.meta.url)));

export default defineConfig({
  root: projectRoot,
  resolve: {
    alias: {
      "@": `${projectRoot}/src`,
    },
  },
  test: {
    pool: "forks",
    testTimeout: 60000,
  },
});
