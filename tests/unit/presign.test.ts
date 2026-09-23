/**
 * 👑 AALM VASTRALAY — UNIT TEST: UPLOAD METADATA & PRESIGN VALIDATION
 * Validates Optimization 4.3:
 *  - Allowed MIME types (JPEG, PNG, WebP, GIF, MP4, WebM)
 *  - Disallowed types (exe, pdf, js, etc.) rejected
 *  - 10MB image size limit enforced
 *  - 100MB video size limit enforced
 *  - Key generation sanitization
 */

import { validateUploadMetadata } from "../../src/lib/b2";

export async function testUploadPresign() {
  console.log("  ▶ Running Upload Presign & Metadata Security Tests...");

  // 1. Valid image upload
  const validImage = validateUploadMetadata("kanjivaram-saree.jpg", "image/jpeg", 2 * 1024 * 1024, "products");
  if (!validImage.isValid || !validImage.key?.startsWith("products/")) {
    throw new Error("Failed: Valid JPEG image was rejected!");
  }

  // 2. Disallowed MIME type (e.g., application/javascript or application/pdf)
  const invalidMime = validateUploadMetadata("malicious.js", "application/javascript", 1024);
  if (invalidMime.isValid) {
    throw new Error("Failed: Disallowed javascript upload was accepted!");
  }

  // 3. Image exceeding 10MB limit
  const hugeImage = validateUploadMetadata("huge-photo.png", "image/png", 11 * 1024 * 1024);
  if (hugeImage.isValid) {
    throw new Error("Failed: Image exceeding 10MB was accepted!");
  }

  // 4. Video within 100MB limit
  const validVideo = validateUploadMetadata("saree-drape-tutorial.mp4", "video/mp4", 50 * 1024 * 1024);
  if (!validVideo.isValid || !validVideo.key?.endsWith(".mp4")) {
    throw new Error("Failed: Valid 50MB MP4 video was rejected!");
  }

  // 5. Video exceeding 100MB limit
  const hugeVideo = validateUploadMetadata("huge-movie.mp4", "video/mp4", 105 * 1024 * 1024);
  if (hugeVideo.isValid) {
    throw new Error("Failed: Video exceeding 100MB was accepted!");
  }

  console.log("  ✔ Upload presign metadata security & size thresholds verified!");
}
