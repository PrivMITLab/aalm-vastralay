import { defineConfig } from "vitest/config";
import path from "path";

/**
 * 👑 AALM VASTRALAY — VITEST CONFIGURATION
 * Fast, in-memory, TypeScript-native test runner for Unit & Integration tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/commerce.test.ts", "tests/api/**/*.test.ts"],
    exclude: ["tests/e2e/**", "tests/load/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
