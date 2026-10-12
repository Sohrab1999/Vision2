import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Phase-1 «پایداری» — unit tests for the pure business-logic layer
// (SRS progression, cloud-sync merge, backup sanitization, skill
// aggregation, konkur hard-bank union, rate limiter).
// Task 75 (گام ۱۰ بخش ۲) — component-test infra: *.test.tsx files opt
// into jsdom per-file via the `// @vitest-environment jsdom` docblock;
// the global default stays `node` so the 438 pure-lib tests keep
// running in the cheapest environment.
// Run: bun run test

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
