import assert from "node:assert/strict";
import {
  prepareImageForVisionAnalysis,
  generateDeterministicVisionFallback,
  executeAiVisionAnalysis,
} from "../../src/lib/ai/client";

export async function testAiVisionEngine() {
  console.log("➡️ Running testAiVisionEngine suite...");

  // Test 1: Data URL base64 extraction
  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const dataUrl = `data:image/png;base64,${sampleBase64}`;
  const preparedDataUrl = await prepareImageForVisionAnalysis(dataUrl);

  assert.ok(preparedDataUrl, "Prepared data URL should not be null");
  assert.equal(preparedDataUrl.inlineData.mimeType, "image/png", "Mime type should be extracted accurately from data URL");
  assert.equal(preparedDataUrl.inlineData.data, sampleBase64, "Base64 data should match input payload");
  console.log("  ✔ Data URL parsing & base64 extraction passed.");

  // Test 2: SSRF blocklist enforcement
  const privateUrls = [
    "http://127.0.0.1:3000/image.jpg",
    "http://localhost:8080/image.png",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.1/private.png",
    "http://192.168.1.1/secret.jpg",
  ];

  for (const privUrl of privateUrls) {
    const blocked = await prepareImageForVisionAnalysis(privUrl);
    assert.equal(blocked, null, `SSRF protection should return null and block internal/private URL: ${privUrl}`);
  }
  console.log("  ✔ SSRF private IP and loopback defense verified.");

  // Test 3: Deterministic Vision Fallback Generation
  const dummyCategories = [
    { id: "cat-1", name: "Banarasi Sarees", slug: "banarasi-sarees" },
    { id: "cat-2", name: "Bridal Lehengas", slug: "bridal-lehengas" },
    { id: "cat-3", name: "Chanderi Silk", slug: "chanderi-silk" },
  ];

  const fallbackResult = generateDeterministicVisionFallback(
    "b2:products/red-bridal-lehenga-zari.jpg",
    dummyCategories
  );

  assert.ok(fallbackResult.title.length > 5, "Fallback title should be meaningful");
  assert.equal(fallbackResult.categoryId, "cat-2", "Should accurately match bridal lehengas category");
  assert.equal(fallbackResult.categorySlug, "bridal-lehengas", "Category slug should match");
  assert.ok(fallbackResult.suggestedPrice > 0, "Suggested price must be positive");
  assert.ok(fallbackResult.suggestedMrp > fallbackResult.suggestedPrice, "MRP should exceed selling price");
  assert.ok(fallbackResult.tags.length >= 3, "Tags array should contain craft tags");
  assert.ok(fallbackResult.formattedText.includes("AALM VASTRALAY"), "Formatted copy should contain brand signature");
  console.log("  ✔ Deterministic vision fallback and craft extraction verified.");

  // Test 4: Full Vision Analysis Execution (with Fallback / API tolerance)
  const analysis = await executeAiVisionAnalysis({
    imageUrl: dataUrl,
    categoriesList: dummyCategories,
  });

  assert.ok(analysis.title, "Analysis must return a title");
  assert.ok(analysis.fabric, "Analysis must determine fabric");
  assert.ok(analysis.craftType, "Analysis must determine craft type");
  assert.ok(analysis.color, "Analysis must identify garment color");
  assert.ok(analysis.formattedText.length > 30, "Formatted text must be crisp boutique copy");
  assert.ok(analysis.suggestedPrice >= 500, "Suggested price should be reasonable for ethnic wear");
  console.log("  ✔ Multimodal vision analysis execution verified.");

  console.log("✅ testAiVisionEngine: All 4 Vision AI checks passed.\n");
}
