import { test, expect } from "@playwright/test";

/**
 * 👑 AALM VASTRALAY — VISUAL REGRESSION TESTING
 * Uses Playwright's pixel-by-pixel snapshot comparison to catch unintentional UI drifts.
 *
 * Local Execution:
 *   npx playwright test tests/e2e/visual.spec.ts
 *
 * To Update Golden Baseline Snapshots when designs intentionally change:
 *   npx playwright test tests/e2e/visual.spec.ts --update-snapshots
 */
test.describe("Storefront Visual Regression Snapshots", () => {
  test("1. Homepage visual snapshot matches design baseline", async ({ page }) => {
    await page.goto("/");
    // Network idle hone ka wait karein taaki hero images load ho jayein
    await page.waitForLoadState("networkidle");

    // Header and Hero section snapshot
    await expect(page).toHaveScreenshot("homepage-layout.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("2. Catalog search page visual snapshot matches baseline", async ({ page }) => {
    await page.goto("/search?q=saree");
    await page.waitForLoadState("networkidle");

    // Catalog page snapshot
    await expect(page).toHaveScreenshot("catalog-search-layout.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.05,
    });
  });
});
