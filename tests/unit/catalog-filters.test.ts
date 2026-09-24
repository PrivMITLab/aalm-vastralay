import assert from "node:assert/strict";
import {
  CATALOG_COLORS,
  CATALOG_OCCASIONS,
  CATALOG_FABRICS,
  matchesVisualFilters,
} from "../../src/lib/catalog-filters";

export async function testCatalogFilters() {
  console.log("  ▶ Running Catalog Visual Filters (Occasion, Color, Fabric) Tests...");

  // 1. Verify definitions
  assert.ok(CATALOG_COLORS.length >= 8, "Expected at least 8 color swatches");
  assert.ok(CATALOG_OCCASIONS.length >= 6, "Expected at least 6 wedding/festive occasions");
  assert.ok(CATALOG_FABRICS.length >= 6, "Expected at least 6 ethnic fabrics");

  // 2. Verify Haldi / Yellow match
  const haldiSuit = {
    title: "Mustard Embroidered Anarkali Suit",
    description: "Perfect for Haldi ceremony and pre-wedding pujas",
    tags: ["haldi", "yellow", "chanderi", "ethnic"],
    variants: [{ color: "Mustard Yellow" }],
  };

  const matchesHaldi = matchesVisualFilters(haldiSuit, { occasion: "haldi" });
  assert.equal(matchesHaldi, true, "Haldi suit should match haldi occasion filter");

  const matchesYellow = matchesVisualFilters(haldiSuit, { color: "yellow" });
  assert.equal(matchesYellow, true, "Haldi suit should match yellow color filter");

  const matchesFabric = matchesVisualFilters(haldiSuit, { fabric: "chanderi" });
  assert.equal(matchesFabric, true, "Haldi suit should match chanderi fabric filter");

  // 3. Verify mismatch rejection
  const matchesMehendi = matchesVisualFilters(haldiSuit, { occasion: "mehendi" });
  assert.equal(matchesMehendi, false, "Haldi suit should not match mehendi occasion filter");

  const matchesBlue = matchesVisualFilters(haldiSuit, { color: "blue" });
  assert.equal(matchesBlue, false, "Haldi suit should not match blue color filter");

  console.log("  ✔ Catalog visual filters (colors, occasions, fabrics) verified!");
}
