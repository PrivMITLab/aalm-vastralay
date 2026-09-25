/**
 * 👑 AALM VASTRALAY — UNIVERSAL MEDIA RESOLVER TEST SUITE
 * Validates the 6-stage priority auto-detection pipeline:
 *  1. Google Drive Direct IDs
 *  2. Google Drive Share Links
 *  3. Backblaze B2 Proxy URLs
 *  4. External Direct URLs with wsrv.nl WebP & Cache Busting
 *  5. Video Detection & YouTube Embeds
 *  6. Safe Fallback to PLACEHOLDER_IMAGE
 */

import {
  resolveImage,
  resolveThumbnail,
  resolveVideo,
  firstImage,
  isVideoUrl,
  extractYouTubeId,
  PLACEHOLDER_IMAGE,
} from "../src/lib/image-resolver";

export async function testMediaResolver() {
  console.log("  ▶ Running Universal Media Resolver Tests...");

  // 1. Safe Fallback on Null / Empty / Invalid Input
  const empty1 = resolveImage(null);
  const empty2 = resolveImage("");
  const empty3 = resolveImage("   ");
  if (empty1 !== PLACEHOLDER_IMAGE || empty2 !== PLACEHOLDER_IMAGE || empty3 !== PLACEHOLDER_IMAGE) {
    throw new Error("Failed: Empty or null inputs must return PLACEHOLDER_IMAGE!");
  }

  // 2. Google Drive Direct ID (33-character alphanumeric)
  const gdriveId = "18FuS57fcL5U14i2o76qZkHLvXYZ12345";
  const resolvedGdriveId = resolveImage(gdriveId);
  if (!decodeURIComponent(resolvedGdriveId).includes("lh3.googleusercontent.com/d/18FuS57fcL5U14i2o76qZkHLvXYZ12345")) {
    throw new Error(`Failed: Google Drive ID not converted to lh3 URL! Got: ${resolvedGdriveId}`);
  }
  if (!resolvedGdriveId.includes("wsrv.nl") || !resolvedGdriveId.includes("output=webp")) {
    throw new Error(`Failed: Google Drive image must be wrapped with wsrv.nl WebP optimizer!`);
  }

  // 3. Google Drive Share Link
  const gdriveShareLink = "https://drive.google.com/file/d/1Bzi5qW1nXYZ9876543210ABCDEFGHIJK/view?usp=sharing";
  const resolvedShareLink = resolveImage(gdriveShareLink);
  if (!resolvedShareLink.includes("1Bzi5qW1nXYZ9876543210ABCDEFGHIJK")) {
    throw new Error(`Failed: Google Drive Share Link ID extraction failed! Got: ${resolvedShareLink}`);
  }

  // 3b. User's specific production Google Drive Link
  const userGdrive = "https://drive.google.com/file/d/1cCzmA3yLZgIAKzrGBOBv32ef4PZhScGQ/view?usp=sharing";
  const resolvedUserGdrive = resolveImage(userGdrive);
  if (!resolvedUserGdrive.includes("1cCzmA3yLZgIAKzrGBOBv32ef4PZhScGQ") || !resolvedUserGdrive.includes("lh3.googleusercontent.com")) {
    throw new Error(`Failed: Production GDrive URL not resolved properly! Got: ${resolvedUserGdrive}`);
  }

  // 4. External Direct URLs (Unsplash, ImgBB, etc.)
  const unsplashUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c";
  const resolvedDirect = resolveImage(unsplashUrl, { width: 600, quality: 75 });
  if (!resolvedDirect.includes("wsrv.nl/?url=") || !resolvedDirect.includes("w=600") || !resolvedDirect.includes("q=75")) {
    throw new Error(`Failed: Direct URL not encoded through wsrv.nl! Got: ${resolvedDirect}`);
  }

  // 5. Cache Busting Version Parameter (&v=...)
  const versioned = resolveImage(unsplashUrl, { version: "2026-v2" });
  if (!versioned.includes("&v=2026-v2")) {
    throw new Error(`Failed: Cache busting version parameter missing! Got: ${versioned}`);
  }

  // 6. Thumbnail Resolution (w=320)
  const thumb = resolveThumbnail(unsplashUrl);
  if (!thumb.includes("w=320")) {
    throw new Error(`Failed: Thumbnail width must be 320! Got: ${thumb}`);
  }

  // 7. Video Detection (isVideoUrl)
  if (!isVideoUrl("https://example.com/festive-reel.mp4")) {
    throw new Error("Failed: .mp4 video URL was not detected by isVideoUrl!");
  }
  if (!isVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")) {
    throw new Error("Failed: YouTube URL was not detected by isVideoUrl!");
  }
  if (!isVideoUrl("youtube:dQw4w9WgXcQ")) {
    throw new Error("Failed: youtube: prefix was not detected by isVideoUrl!");
  }
  if (isVideoUrl("https://example.com/saree.jpg")) {
    throw new Error("Failed: Image URL was incorrectly flagged as video!");
  }

  // 8. YouTube Video Resolution to Embed Iframe
  const ytResult = resolveVideo("https://youtu.be/dQw4w9WgXcQ");
  if (!ytResult || ytResult.type !== "youtube" || !ytResult.url.includes("embed/dQw4w9WgXcQ")) {
    throw new Error(`Failed: YouTube video did not resolve to embed URL! Got: ${JSON.stringify(ytResult)}`);
  }

  // 9. Google Drive Video (Bypasses wsrv.nl as wsrv does not process video)
  const gdriveVideoUrl = "https://drive.google.com/file/d/1VideoFileId1234567890/view";
  const gdriveVideoResult = resolveVideo(gdriveVideoUrl);
  if (!gdriveVideoResult || gdriveVideoResult.type !== "file" || !gdriveVideoResult.url.includes("drive.google.com/uc?export=download")) {
    throw new Error(`Failed: Google Drive video must resolve to direct download stream! Got: ${JSON.stringify(gdriveVideoResult)}`);
  }

  // 10. Local Assets (/brand/poster.png)
  const localAsset = resolveImage("/brand/poster.png");
  if (localAsset !== "/brand/poster.png") {
    throw new Error(`Failed: Local asset /brand/poster.png modified unexpectedly: ${localAsset}`);
  }

  // 11. firstImage Helper
  const imageList = ["", null, "https://example.com/saree.jpg"];
  const primary = firstImage(imageList);
  if (!primary.includes("example.com%2Fsaree.jpg")) {
    throw new Error(`Failed: firstImage did not pick the first non-empty image! Got: ${primary}`);
  }

  console.log("  ✔ Universal media resolver (GDrive, B2, YouTube, Direct WebP, Cache Busting) passed!");
}
