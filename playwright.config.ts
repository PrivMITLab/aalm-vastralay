import { defineConfig, devices } from "@playwright/test";

/**
 * 👑 AALM VASTRALAY — PLAYWRIGHT E2E CONFIGURATION
 * Automated Browser Testing for Storefront, Search, Cart & Mobile Responsive Views.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari / Pixel",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET || "ci-mock-auth-secret-key-32-characters-minimum-length",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock",
      ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || "ci-mock-encryption-secret-key-32-characters",
    },
  },
});
