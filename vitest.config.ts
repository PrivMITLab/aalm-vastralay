import { defineConfig } from "vitest/config";
import path from "path";

/**
 * 👑 AALM VASTRALAY — VITEST CONFIGURATION
 * Fast, in-memory, TypeScript-native test runner for Unit, API & DB tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "tests/unit/commerce.test.ts",
      "tests/api/**/*.test.ts",
      "tests/db/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**", "tests/load/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["node_modules/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
