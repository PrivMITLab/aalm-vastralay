/**
 * ImageKit helpers (20 GB bandwidth + 3 GB storage free tier).
 *
 * NEXT_PUBLIC_IMAGEKIT_URL – e.g. https://ik.imagekit.io/aalm-vastralay
 * Images are referenced by their ImageKit file path (e.g. "products/lehenga-1.jpg").
 */

export const IMAGEKIT_URL = (process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? "").replace(/\/$/, "");

export function isImageKitConfigured() {
  return IMAGEKIT_URL.length > 0;
}

type Transform = { width?: number; height?: number; quality?: number; format?: "auto" | "webp" | "avif" };

function buildTransform({ width, height, quality = 80, format = "auto" }: Transform) {
  const parts: string[] = [];
  if (width) parts.push(`w-${width}`);
  if (height) parts.push(`h-${height}`);
  parts.push(`q-${quality}`, `f-${format}`, "c-at_max");
  return `tr:${parts.join(",")}`;
}

/** Full-size, optimized product image (defaults to ~150 KB WebP at 800px). */
export function getProductImage(fileId: string, width = 800, quality = 80) {
  const clean = fileId.replace(/^ik:/, "").replace(/^\//, "");
  return `${IMAGEKIT_URL}/${buildTransform({ width, quality })}/${clean}`;
}

/** Small thumbnail for cards, lists and carts. */
export function getThumbnail(fileId: string, size = 320) {
  const clean = fileId.replace(/^ik:/, "").replace(/^\//, "");
  return `${IMAGEKIT_URL}/${buildTransform({ width: size, height: Math.round(size * 1.3), quality: 70 })}/${clean}`;
}

/** Video served through ImageKit video transforms (500 units/month free). */
export function getVideoUrl(fileId: string) {
  const clean = fileId.replace(/^ik:/, "").replace(/^\//, "");
  return `${IMAGEKIT_URL}/tr:q-70/${clean}`;
}
