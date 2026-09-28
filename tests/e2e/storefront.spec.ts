import { test, expect } from "@playwright/test";

/**
 * 👑 AALM VASTRALAY — CORE STOREFRONT E2E TEST SUITE
 * Validates real browser rendering, navigation, search, and responsive mobile behavior.
 */

test.describe("Storefront Core Experience", () => {
  test("1. Homepage renders brand identity, header nav, and search bar", async ({ page }) => {
    await page.goto("/");

    // 1. Verify title or main header contains branding
    await expect(page).toHaveTitle(/Aalm Vastralay|आलम वस्त्रालय/i);

    // 2. Verify search bar is accessible (visible on desktop or mobile)
    const searchInput = page.locator('input[type="search"]:visible, input[placeholder*="Search" i]:visible, input[placeholder*="खोजें" i]:visible').first();
    await expect(searchInput).toBeVisible();

    // 3. Verify main content area loaded
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("2. Search route renders query and search catalog layout", async ({ page }) => {
    await page.goto("/search?q=saree");

    // 1. URL has search param
    await expect(page).toHaveURL(/.*search.*q=saree/);

    // 2. Main search page container is visible
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("3. Essential policy and information pages load with valid content", async ({ page }) => {
    // Verify static / shipping routes load without 404 or 500
    const routes = ["/shipping", "/privacy", "/terms"];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("4. Bottom navigation / mobile drawer is responsive on mobile screens", async ({ page, isMobile }) => {
    await page.goto("/");

    if (isMobile) {
      // Mobile bottom bar or hamburger toggle
      const mobileNav = page.locator('nav, [role="navigation"]').first();
      await expect(mobileNav).toBeVisible();
    } else {
      // Desktop header navigation
      const header = page.locator("header");
      await expect(header).toBeVisible();
    }
  });
});
