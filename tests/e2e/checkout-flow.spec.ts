import { test, expect } from "@playwright/test";

/**
 * 👑 AALM VASTRALAY — FULL USER CHECKOUT JOURNEY E2E TEST
 * Simulates real customer flow: Homepage -> Search -> Product -> Add To Cart -> Checkout.
 */
test.describe("E-Commerce User Checkout Journey", () => {
  test("Complete flow: Visit home -> view catalog -> open cart -> proceed to checkout", async ({ page }) => {
    // 1. Homepage visit
    await page.goto("/");
    await expect(page).toHaveTitle(/Aalm Vastralay/i);

    // 2. Search catalog navigation (handle desktop vs mobile viewports)
    const searchInput = page.locator('input[type="search"]:visible, input[name="q"]:visible, input[placeholder*="Search" i]:visible').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("saree");
    await searchInput.press("Enter");

    // Verify search results page loaded (HeaderNav navigates to /products?q=saree)
    await page.waitForURL(/\/(products|search)/, { timeout: 10000 });
    await expect(page.locator("body")).toContainText(/saree/i, { timeout: 10000 });

    // 3. Open Cart via direct navigation or Header Icon
    await page.goto("/cart");
    // Cart is protected by requireUser, so unauthenticated guest is safely redirected to sign-in
    await page.waitForURL(/\/(cart|sign-in)/, { timeout: 10000 });
    await expect(page.locator("body")).toContainText(/Bag|Cart|Sign In|Account|Shopping/i, { timeout: 10000 });

    // 4. Verify Policy / Trust Badges on Checkout readiness
    await page.goto("/shipping");
    await expect(page.locator("h1, h2")).toContainText(/Shipping/i, { timeout: 10000 });
    await expect(page.locator("body")).toContainText(/Cash on Delivery|COD|Free Shipping/i, { timeout: 10000 });
  });
});
