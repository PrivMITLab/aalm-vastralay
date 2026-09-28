import assert from "node:assert/strict";
import { checkAiRateLimit, computeAiCacheKey } from "../src/lib/ai/client";
import { parseEthnicQueryDeterministic } from "../src/lib/ai/search-parser";

/**
 * 👑 AALM VASTRALAY — AI INTEGRATION & NLP TEST SUITE
 *
 * Verifies:
 * 1. AI Rate Limiting & Token Bucket Math
 * 2. Deterministic SHA-256 Cache Key Generation
 * 3. Natural Language Search & Conversational Filter Extraction (Hinglish/English)
 * 4. Structured Output Integrity & Fallback Safety
 */

export async function runAiIntegrationTests() {
  console.log("  ▶ Running Free AI Engine & Natural Language Search Tests...");

  // 1. Rate Limiting Tests
  const testId = `test-user-${Date.now()}`;
  const r1 = checkAiRateLimit(testId);
  assert.equal(r1.ok, true, "First request should be allowed");
  assert.equal(r1.remaining, 19, "Remaining count should be 19");

  // Consume remaining
  for (let i = 0; i < 19; i++) {
    checkAiRateLimit(testId);
  }
  const rBlocked = checkAiRateLimit(testId);
  assert.equal(rBlocked.ok, false, "21st request in 1-min window should be blocked");
  assert.equal(rBlocked.remaining, 0, "Remaining should be 0");
  assert.ok(rBlocked.retryAfterSec > 0, "Retry after seconds should be positive");

  // 2. Cache Key Generation Tests
  const key1 = computeAiCacheKey("description", "Red Banarasi Saree");
  const key2 = computeAiCacheKey("description", "  red banarasi saree  ");
  assert.equal(key1, key2, "Cache key should be normalized and case-insensitive");
  assert.equal(key1.length, 64, "Cache key should be a 64-char SHA-256 hex string");

  // 3. Natural Language Search Parsing Tests (Hinglish + English)
  // Scenario A: "shaadi ke liye laal silk saree under 5000"
  const qA = parseEthnicQueryDeterministic("shaadi ke liye laal silk saree under 5000");
  assert.equal(qA.categorySlug, "sarees", "Category should resolve to sarees");
  assert.equal(qA.occasion, "Wedding / Bridal", "Occasion should resolve to Wedding / Bridal");
  assert.equal(qA.color, "Red", "Color 'laal' should resolve to Red");
  assert.equal(qA.fabric, "Silk", "Fabric should resolve to Silk");
  assert.equal(qA.maxPrice, 5000, "Max price should be 5000");
  assert.ok(qA.explanation.includes("Wedding / Bridal"), "Explanation should contain Wedding");
  assert.ok(qA.explanation.includes("Red"), "Explanation should contain Red");
  assert.ok(qA.explanation.includes("Under ₹5,000"), "Explanation should contain formatted price");

  // Scenario B: "groom sherwani maroon below 15k"
  const qB = parseEthnicQueryDeterministic("groom sherwani maroon below 15k");
  assert.equal(qB.categorySlug, "sherwanis", "Category should resolve to sherwanis");
  assert.equal(qB.color, "Maroon", "Color should resolve to Maroon");
  assert.equal(qB.maxPrice, 15000, "15k shorthand should resolve to 15000");

  // Scenario C: "haldi yellow lehenga"
  const qC = parseEthnicQueryDeterministic("haldi yellow lehenga");
  assert.equal(qC.categorySlug, "lehengas", "Category should resolve to lehengas");
  assert.equal(qC.occasion, "Haldi", "Occasion should resolve to Haldi");
  assert.equal(qC.color, "Yellow", "Color should resolve to Yellow");

  // Scenario D: "sangeet pink anarkali above 3000"
  const qD = parseEthnicQueryDeterministic("sangeet pink anarkali above 3000");
  assert.equal(qD.categorySlug, "anarkali-suits", "Category should resolve to anarkali-suits");
  assert.equal(qD.occasion, "Sangeet", "Occasion should resolve to Sangeet");
  assert.equal(qD.color, "Pink", "Color should resolve to Pink");
  assert.equal(qD.minPrice, 3000, "Min price should be 3000");

  // 4. Edge Cases
  const qEmpty = parseEthnicQueryDeterministic("");
  assert.equal(qEmpty.maxPrice, undefined, "Empty query should have no max price");
  assert.equal(qEmpty.keywords.length, 0, "Empty query should have no keywords");

  console.log("  ✔ AI rate limiting, token buckets, and Hinglish NLP intent parsing passed!");
}

if (process.argv[1]?.endsWith("ai-integration.test.ts")) {
  runAiIntegrationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
