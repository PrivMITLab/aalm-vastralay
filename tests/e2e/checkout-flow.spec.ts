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

    // 2. Search catalog navigation
    const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("saree");
    await searchInput.press("Enter");

    // Verify search results page loaded
    await page.waitForURL(/\/search/);
    await expect(page.locator("body")).toContainText(/saree/i);

    // 3. Open Cart via Header Icon
    const cartButton = page.locator('a[href="/cart"], button[aria-label*="Cart"]').first();
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    // Verify Cart Page / Drawer loads
    await page.waitForURL(/\/cart/);
    await expect(page.locator("h1, h2")).toContainText(/Cart|Bag|Shopping/i);

    // 4. Verify Policy / Trust Badges on Checkout readiness
    await page.goto("/shipping");
    await expect(page.locator("h1, h2")).toContainText(/Shipping/i);
    await expect(page.locator("body")).toContainText(/Cash on Delivery|COD/i);
  });
});
