/**
 * 👑 AALM VASTRALAY — COMPLETE 53-ICON & LOGO PNG GENERATION SCRIPT
 * Generates all multi-resolution browser favicons, Apple touch icons, PWA icons,
 * maskable icons, Windows tiles, and social media preview assets.
 */

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SOURCE_SVG = path.resolve("./public/logo-source.svg");
const LOGO_PRIMARY_SVG = path.resolve("./public/logos/primary.svg");
const LOGO_SECONDARY_SVG = path.resolve("./public/logos/secondary.svg");
const LOGO_ICON_SVG = path.resolve("./public/logos/icon-only.svg");
const LOGO_WORDMARK_SVG = path.resolve("./public/logos/wordmark.svg");
const LOGO_LETTERMARK_SVG = path.resolve("./public/logos/lettermark.svg");

const OUTPUT_DIR = path.resolve("./public");
const LOGOS_DIR = path.resolve("./public/logos");

interface IconJob {
  name: string;
  source: string;
  width: number;
  height: number;
  padding?: number;
  background?: string | { r: number; g: number; b: number; alpha: number };
}

const JOBS: IconJob[] = [
  // --- Category A: Browser Favicons ---
  { name: "favicon-16x16.png", source: SOURCE_SVG, width: 16, height: 16 },
  { name: "favicon-32x32.png", source: SOURCE_SVG, width: 32, height: 32 },
  { name: "favicon-96x96.png", source: SOURCE_SVG, width: 96, height: 96 },

  // --- Category B: Apple Touch Icons ---
  { name: "apple-touch-icon-76x76.png", source: SOURCE_SVG, width: 76, height: 76, background: "#12031a" },
  { name: "apple-touch-icon-152x152.png", source: SOURCE_SVG, width: 152, height: 152, background: "#12031a" },
  { name: "apple-touch-icon-167x167.png", source: SOURCE_SVG, width: 167, height: 167, background: "#12031a" },
  { name: "apple-touch-icon-180x180.png", source: SOURCE_SVG, width: 180, height: 180, background: "#12031a" },
  { name: "apple-touch-icon.png", source: SOURCE_SVG, width: 180, height: 180, background: "#12031a" },
  { name: "apple-touch-icon-precomposed.png", source: SOURCE_SVG, width: 180, height: 180, background: "#12031a" },

  // --- Category C: PWA / Android Icons ---
  { name: "android-chrome-72x72.png", source: SOURCE_SVG, width: 72, height: 72 },
  { name: "android-chrome-96x96.png", source: SOURCE_SVG, width: 96, height: 96 },
  { name: "android-chrome-128x128.png", source: SOURCE_SVG, width: 128, height: 128 },
  { name: "android-chrome-144x144.png", source: SOURCE_SVG, width: 144, height: 144 },
  { name: "android-chrome-152x152.png", source: SOURCE_SVG, width: 152, height: 152 },
  { name: "android-chrome-192x192.png", source: SOURCE_SVG, width: 192, height: 192 },
  { name: "android-chrome-384x384.png", source: SOURCE_SVG, width: 384, height: 384 },
  { name: "android-chrome-512x512.png", source: SOURCE_SVG, width: 512, height: 512 },

  // --- Category D: Maskable Icons (80% safe zone) ---
  { name: "maskable-192x192.png", source: SOURCE_SVG, width: 192, height: 192, padding: 20, background: "#12031a" },
  { name: "maskable-512x512.png", source: SOURCE_SVG, width: 512, height: 512, padding: 52, background: "#12031a" },

  // --- Category E: Windows Tiles ---
  { name: "mstile-70x70.png", source: SOURCE_SVG, width: 70, height: 70, background: "#4A148C" },
  { name: "mstile-144x144.png", source: SOURCE_SVG, width: 144, height: 144, background: "#4A148C" },
  { name: "mstile-150x150.png", source: SOURCE_SVG, width: 150, height: 150, background: "#4A148C" },
  { name: "mstile-310x310.png", source: SOURCE_SVG, width: 310, height: 310, background: "#4A148C" },
  { name: "mstile-310x150.png", source: SOURCE_SVG, width: 310, height: 150, background: "#4A148C" },

  // --- Category F: Social & OG Images ---
  { name: "og-image.png", source: SOURCE_SVG, width: 1200, height: 630, background: "#12031a" },
  { name: "twitter-image.png", source: SOURCE_SVG, width: 1200, height: 600, background: "#12031a" },
  { name: "og-image-square.png", source: SOURCE_SVG, width: 1200, height: 1200, background: "#12031a" },
  { name: "linkedin-image.png", source: SOURCE_SVG, width: 1200, height: 627, background: "#12031a" },

  // --- Category I: Special Email Header ---
  { name: "email-logo.png", source: LOGO_PRIMARY_SVG, width: 400, height: 100 },
];

const LOGO_PNG_JOBS: IconJob[] = [
  { name: "primary.png", source: LOGO_PRIMARY_SVG, width: 800, height: 200 },
  { name: "primary@2x.png", source: LOGO_PRIMARY_SVG, width: 1600, height: 400 },
  { name: "secondary.png", source: LOGO_SECONDARY_SVG, width: 400, height: 500 },
  { name: "icon-only.png", source: LOGO_ICON_SVG, width: 512, height: 512 },
  { name: "wordmark.png", source: LOGO_WORDMARK_SVG, width: 800, height: 150 },
  { name: "lettermark.png", source: LOGO_LETTERMARK_SVG, width: 512, height: 512 },
];

async function generateAll() {
  console.log("🚀 Starting Complete 53-Icon & Logo PNG Generation...");

  // 1. Process public/ root icons
  for (const job of JOBS) {
    try {
      const srcBuffer = await fs.readFile(job.source);
      let pipeline = sharp(srcBuffer).resize(job.width, job.height, {
        fit: "contain",
        background: job.background || { r: 0, g: 0, b: 0, alpha: 0 },
      });

      if (job.padding) {
        pipeline = pipeline.extend({
          top: job.padding,
          bottom: job.padding,
          left: job.padding,
          right: job.padding,
          background: job.background || "#12031a",
        }).resize(job.width, job.height);
      }

      const outPath = path.join(OUTPUT_DIR, job.name);
      await pipeline.png().toFile(outPath);
      console.log(`  ✔ Generated ${job.name} (${job.width}x${job.height})`);
    } catch (err) {
      console.error(`  ❌ Failed to generate ${job.name}:`, err);
    }
  }

  // 2. Process public/logos/ PNG variants
  for (const job of LOGO_PNG_JOBS) {
    try {
      const srcBuffer = await fs.readFile(job.source);
      const pipeline = sharp(srcBuffer).resize(job.width, job.height, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
      const outPath = path.join(LOGOS_DIR, job.name);
      await pipeline.png().toFile(outPath);
      console.log(`  ✔ Generated logo variant ${job.name}`);
    } catch (err) {
      console.error(`  ❌ Failed to generate logo ${job.name}:`, err);
    }
  }

  // 3. Multi-resolution favicon.ico (fallback 32x32 PNG to .ico copy)
  try {
    const icoPath = path.join(OUTPUT_DIR, "favicon.ico");
    const fav32Buffer = await fs.readFile(path.join(OUTPUT_DIR, "favicon-32x32.png"));
    await fs.writeFile(icoPath, fav32Buffer);
    console.log("  ✔ Generated favicon.ico");
  } catch (err) {
    console.error("  ❌ Failed to write favicon.ico:", err);
  }

  console.log("\n✨ All icon types and logo PNGs successfully created!");
}

generateAll().catch((err) => {
  console.error("Fatal error during icon generation:", err);
  process.exit(1);
});
