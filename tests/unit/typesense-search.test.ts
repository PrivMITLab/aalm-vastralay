/**
 * 👑 AALM VASTRALAY — SUITE 40: TYPESENSE FEDERATED INSTANT SEARCH & POSTGRES FALLBACK
 * Location: tests/unit/typesense-search.test.ts
 *
 * Verifies:
 *  1. Configuration & Detection.
 *  2. Filter String Translation for Typesense syntax.
 *  3. Dual-Engine Fail-Soft Search Execution (graceful fallback).
 */

import assert from "node:assert";
import {
  isTypesenseConfigured,
  buildTypesenseFilterString,
  searchEthnicCatalog,
} from "../../src/lib/typesense";

export async function testTypesenseSearchFallback() {
  console.log("  ▶ Running Typesense Search & Postgres Fallback Tests...");

  // 1. Configuration detection check
  assert.strictEqual(typeof isTypesenseConfigured(), "boolean");

  // 2. Filter String Builder
  const baseFilter = buildTypesenseFilterString();
  assert.ok(baseFilter.includes("is_active:=true"));

  const fullFilter = buildTypesenseFilterString({
    inStockOnly: true,
    minPrice: 1500,
    maxPrice: 8000,
    tags: ["silk", "wedding"],
  });

  assert.ok(fullFilter.includes("is_active:=true"));
  assert.ok(fullFilter.includes("stock:>0"));
  assert.ok(fullFilter.includes("price:[1500..8000]"));
  assert.ok(fullFilter.includes("tags:=[silk,wedding]"));

  // Single bounds
  const minOnly = buildTypesenseFilterString({ minPrice: 2000 });
  assert.ok(minOnly.includes("price:>=2000"));

  const maxOnly = buildTypesenseFilterString({ maxPrice: 5000 });
  assert.ok(maxOnly.includes("price:<=5000"));

  // 3. Dual-Engine Fail-Soft Search Execution
  const searchRes = await searchEthnicCatalog("saree", { limit: 2 });
  assert.ok(searchRes !== null && typeof searchRes === "object");
  assert.strictEqual(typeof searchRes.query, "string");
  assert.ok(Array.isArray(searchRes.products));
  assert.strictEqual(typeof searchRes.total, "number");
  assert.strictEqual(typeof searchRes.latencyMs, "number");
  assert.ok(["typesense", "postgres_fallback"].includes(searchRes.source));

  console.log("  ✔ Typesense instant search & Postgres fail-soft fallback verified!");
}
