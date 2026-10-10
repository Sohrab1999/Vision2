import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Phase-1 «پایداری» — unit tests for the pure business-logic layer
// (SRS progression, cloud-sync merge, backup sanitization, skill
// aggregation, konkur hard-bank union, rate limiter).
// Run: bun run test

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
