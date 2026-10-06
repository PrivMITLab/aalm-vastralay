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

  console.log(`[INFO] Launching browser to generate production-grade PDF...`);
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
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8px; width: 100%; text-align: right; padding: 0 15mm; color: #8C7853; font-family: 'Noto Sans Devanagari', sans-serif; font-weight: 600;">
        <span>आलम वस्त्रालय (Aalm Vastralay) — 100% प्रोडक्शन ग्रेड मास्टर मैनुअल</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8px; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; color: #8C7853; font-family: 'Noto Sans Devanagari', sans-serif;">
        <span>गोपनीय एवं अधिकृत प्रलेख (Confidential & Authorized) — ₹0/माह क्लाउड आर्किटेक्चर</span>
        <span>पृष्ठ <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: "16mm",
      right: "12mm",
      bottom: "16mm",
      left: "12mm",
    },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  const buf = fs.readFileSync(outputPath);
  const matches = buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  const pageCount = matches ? matches.length : 0;

  console.log(`[SUCCESS] PDF generated successfully!`);
  console.log(`  Path: ${outputPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`  Total Pages: ${pageCount}`);

  if (pageCount < 50) {
    console.warn(`[WARN] Page count is ${pageCount}, target is 50+ pages!`);
  } else {
    console.log(`[TARGET ACHIEVED] Manual successfully spans ${pageCount} pages (>= 50 pages required)!`);
  }
}

main().catch((err) => {
  console.error(`[FATAL] Failed to generate PDF:`, err);
  process.exit(1);
});
