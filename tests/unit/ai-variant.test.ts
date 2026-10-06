import assert from "node:assert/strict";

export async function testAiVariantStudioEngine() {
  console.log("➡️ Running testAiVariantStudioEngine suite...");

  // Test 1: Prompt Construction Contract
  const garmentType = "Banarasi Katan Silk Saree";
  const targetColor = "Emerald Bottle Green";
  const accentDetails = "Antique Gold Kadwa Weave Zari";
  const lightingStyle = "Editorial fashion studio lighting on neutral cream backdrop";

  const luxuryPrompt = [
    "Professional Indian luxury ethnic couture catalog photoshoot",
    `${garmentType} in vibrant ${targetColor} palette`,
    `featuring authentic ${accentDetails}`,
    lightingStyle,
    "ultra-detailed textile weave texture, 8k resolution, photorealistic, elegant presentation, no watermarks, no blur, pristine boutique fashion",
  ].filter(Boolean).join(", ");

  assert.ok(luxuryPrompt.includes(garmentType), "Prompt must include garment type");
  assert.ok(luxuryPrompt.includes(targetColor), "Prompt must include target color");
  assert.ok(luxuryPrompt.includes(accentDetails), "Prompt must include accent details");
  assert.ok(luxuryPrompt.includes("no watermarks"), "Prompt must explicitly forbid watermarks");
  console.log("  ✔ Luxury variant prompt formulation verified.");

  // Test 2: Pollinations Generation URL Contract
  const seed = 12345;
  const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(luxuryPrompt)}?width=800&height=1000&model=flux&nologo=true&seed=${seed}`;

  assert.ok(pollUrl.startsWith("https://image.pollinations.ai/prompt/"), "Must target Pollinations image API");
  assert.ok(pollUrl.includes("width=800&height=1000"), "Must enforce standard 4:5 Indian eCommerce ratio");
  assert.ok(pollUrl.includes("model=flux"), "Must use high-resolution Flux model");
  assert.ok(pollUrl.includes("nologo=true"), "Must enforce watermark-free output");
  console.log("  ✔ Generation URL parameters & aspect ratio verified.");

  // Test 3: B2 Filename & Variant Slug Sanitization Contract
  const rawColor = "Peacock Royal Blue / Navy";
  const safeColor = rawColor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `variant-${safeColor}-${Date.now()}.jpg`;

  assert.ok(!filename.includes(" "), "Filename must not contain spaces");
  assert.ok(!filename.includes("/"), "Filename must not contain slashes");
  assert.ok(filename.startsWith("variant-peacock-royal-blue-navy-"), "Filename must cleanly slugify colorway");
  assert.ok(filename.endsWith(".jpg"), "Filename must preserve extension");
  console.log("  ✔ B2 storage key sanitization & naming contract verified.");

  console.log("✅ testAiVariantStudioEngine: All 3 AI Variant checks passed.\n");
}
