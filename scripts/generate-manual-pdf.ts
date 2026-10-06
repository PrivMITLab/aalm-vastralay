import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const htmlPath = path.resolve(process.cwd(), "docs/HINDI_MASTER_MANUAL.html");
  const outputPath = path.resolve(process.cwd(), "docs/AALM_VASTRALAY_MANUAL_HI.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error(`[ERROR] HTML manual not found at: ${htmlPath}`);
    process.exit(1);
  }

  console.log(`[INFO] Launching browser to generate PDF...`);
  // Try system msedge channel first (always available on Windows), fallback to default
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await chromium.launch({ headless: true });
  }
  const context = await browser.newContext();
  const page = await context.newPage();

  const fileUrl = `file://${htmlPath.replace(/\\/g, "/")}`;
  console.log(`[INFO] Navigating to: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // Ensure fonts and styles are fully loaded
  await page.evaluate(() => document.fonts.ready);

  console.log(`[INFO] Generating A4 PDF at: ${outputPath}`);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "15mm",
      right: "15mm",
      bottom: "15mm",
      left: "15mm",
    },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`[SUCCESS] PDF generated successfully!`);
  console.log(`  Path: ${outputPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(`[FATAL] Failed to generate PDF:`, err);
  process.exit(1);
});
