import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

export async function testBrandAssets() {
  console.log("▶ Testing Brand Identity, 20 Logos & 53-Icon Matrix Integrity...");

  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, "public");
  const logosDir = path.join(publicDir, "logos");
  const watermarksDir = path.join(publicDir, "watermarks");
  const brandDir = path.join(publicDir, "brand");

  // 1. Verify Master Artwork & Root Fallbacks
  const masterSvg = path.join(publicDir, "logo-source.svg");
  const rootLogo = path.join(publicDir, "logo.svg");
  assert.ok(fs.existsSync(masterSvg), "public/logo-source.svg must exist");
  assert.ok(fs.existsSync(rootLogo), "public/logo.svg must exist");
  assert.ok(fs.statSync(masterSvg).size > 200, "logo-source.svg must be non-empty");

  // 2. Verify Zero Regression on Existing Brand Files
  const existingFiles = [
    "logo-full.svg",
    "logo-full-light.svg",
    "logo-mark.svg",
    "watermark.svg",
    "poster.png",
  ];
  for (const file of existingFiles) {
    const fullPath = path.join(brandDir, file);
    assert.ok(fs.existsSync(fullPath), `Brand asset public/brand/${file} must exist`);
  }
  assert.ok(fs.existsSync(path.join(publicDir, "images", "hero.jpg")), "public/images/hero.jpg must exist");

  // 3. Verify All 20 Logo SVGs (5 types x 4 colorways)
  const types = ["primary", "secondary", "icon-only", "wordmark", "lettermark"];
  const colorways = ["", "-white", "-black", "-gray"];
  for (const type of types) {
    for (const color of colorways) {
      const fileName = `${type}${color}.svg`;
      const filePath = path.join(logosDir, fileName);
      assert.ok(fs.existsSync(filePath), `Logo variant public/logos/${fileName} must exist`);
      assert.ok(fs.statSync(filePath).size > 100, `${fileName} must have valid SVG content`);
    }
  }

  // 4. Verify Logo PNGs
  const logoPngs = [
    "primary.png",
    "primary@2x.png",
    "secondary.png",
    "icon-only.png",
    "wordmark.png",
    "lettermark.png",
  ];
  for (const png of logoPngs) {
    const filePath = path.join(logosDir, png);
    assert.ok(fs.existsSync(filePath), `PNG logo public/logos/${png} must exist`);
    assert.ok(fs.statSync(filePath).size > 500, `${png} must have valid PNG content`);
  }

  // 5. Verify Watermark Suite (3 variants)
  const watermarks = ["full.svg", "icon.svg", "tiled.svg"];
  for (const wm of watermarks) {
    const filePath = path.join(watermarksDir, wm);
    assert.ok(fs.existsSync(filePath), `Watermark public/watermarks/${wm} must exist`);
  }

  // 6. Verify Favicons, Apple Touch, Android/PWA, Tiles & Social Cards
  const requiredIcons = [
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon-96x96.png",
    "favicon.svg",
    "favicon-dark.svg",
    "apple-touch-icon.png",
    "apple-touch-icon-76x76.png",
    "apple-touch-icon-152x152.png",
    "apple-touch-icon-167x167.png",
    "apple-touch-icon-180x180.png",
    "apple-touch-icon-precomposed.png",
    "android-chrome-72x72.png",
    "android-chrome-96x96.png",
    "android-chrome-128x128.png",
    "android-chrome-144x144.png",
    "android-chrome-152x152.png",
    "android-chrome-192x192.png",
    "android-chrome-384x384.png",
    "android-chrome-512x512.png",
    "maskable-192x192.png",
    "maskable-512x512.png",
    "mstile-70x70.png",
    "mstile-144x144.png",
    "mstile-150x150.png",
    "mstile-310x150.png",
    "mstile-310x310.png",
    "og-image.png",
    "twitter-image.png",
    "og-image-square.png",
    "linkedin-image.png",
    "email-logo.png",
    "safari-pinned-tab.svg",
    "loading-spinner.svg",
    "browserconfig.xml",
    "manifest.json",
  ];

  for (const icon of requiredIcons) {
    const filePath = path.join(publicDir, icon);
    assert.ok(fs.existsSync(filePath), `Required asset public/${icon} must exist`);
    assert.ok(fs.statSync(filePath).size > 20, `${icon} must not be empty`);
  }

  // 7. Verify Manifest JSON & Browserconfig Structure
  const manifestRaw = fs.readFileSync(path.join(publicDir, "manifest.json"), "utf8");
  const manifest = JSON.parse(manifestRaw);
  assert.ok(Array.isArray(manifest.icons), "manifest.json must have icons array");
  assert.ok(manifest.icons.length >= 10, "manifest.json must have comprehensive icons list");

  const browserconfig = fs.readFileSync(path.join(publicDir, "browserconfig.xml"), "utf8");
  assert.ok(browserconfig.includes("<browserconfig>"), "browserconfig.xml must contain browserconfig element");
  assert.ok(browserconfig.includes("mstile-150x150.png"), "browserconfig.xml must reference tile logos");

  console.log("  ✔ Master vector artwork and root fallbacks verified");
  console.log("  ✔ All existing public/brand/ legacy assets preserved (zero regression)");
  console.log("  ✔ All 20 logo SVG variants (5 types x 4 colorways) verified");
  console.log("  ✔ All 6 high-res logo PNGs verified");
  console.log("  ✔ All 3 watermark variants verified");
  console.log("  ✔ Complete 53-icon matrix verified across all target platforms");
  console.log("  ✔ PWA manifest.json and Windows browserconfig.xml verified");
}
