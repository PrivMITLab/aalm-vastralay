import { getProductImage, getThumbnail, isImageKitConfigured } from "./imagekit";

/**
 * Resolves any stored image reference into a servable URL.
 *
 *  - "b2:<key>"          → Cloudflare Worker proxy in front of the private Backblaze B2 bucket
 *  - "ik:<path>"         → ImageKit CDN with on-the-fly transforms
 *  - "https://..."       → wsrv.nl proxy (free, unlimited fair use) for resizing/WebP
 *  - "/images/x.jpg"     → local /public asset served by Next.js / Cloudflare Pages
 *  - "youtube:<id>"      → YouTube unlisted embed (video fallback)
 */

const B2_WORKER_URL = (process.env.NEXT_PUBLIC_B2_WORKER_URL ?? "").replace(/\/$/, "");
const USE_WSRV = process.env.NEXT_PUBLIC_USE_WSRV !== "false";

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export type ResolveOptions = { width?: number; quality?: number; thumbnail?: boolean };

export function resolveImage(src: string | null | undefined, opts: ResolveOptions = {}): string {
  if (!src) return PLACEHOLDER_IMAGE;
  const { width = 800, quality = 80, thumbnail = false } = opts;

  if (src.startsWith("b2:")) {
    const key = src.slice(3).replace(/^\//, "");
    return B2_WORKER_URL ? `${B2_WORKER_URL}/${key}` : PLACEHOLDER_IMAGE;
  }

  if (src.startsWith("ik:")) {
    if (!isImageKitConfigured()) return PLACEHOLDER_IMAGE;
    return thumbnail ? getThumbnail(src) : getProductImage(src, width, quality);
  }

  if (/^https?:\/\//i.test(src)) {
    if (!USE_WSRV) return src;
    const w = thumbnail ? 320 : width;
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${w}&q=${quality}&output=webp&fit=cover`;
  }

  // Local /public asset (or relative path)
  return src.startsWith("/") ? src : `/${src}`;
}

export function resolveThumbnail(src: string | null | undefined) {
  return resolveImage(src, { thumbnail: true });
}

export function firstImage(images: string[] | null | undefined, opts?: ResolveOptions) {
  return resolveImage(images?.[0], opts);
}

/** Returns an embeddable video URL, or null. */
export function resolveVideo(src: string | null | undefined): { type: "youtube" | "file"; url: string } | null {
  if (!src) return null;
  if (src.startsWith("youtube:")) return { type: "youtube", url: `https://www.youtube.com/embed/${src.slice(8)}` };
  const yt = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  if (yt) return { type: "youtube", url: `https://www.youtube.com/embed/${yt[1]}` };
  if (src.startsWith("ik:")) return isImageKitConfigured() ? { type: "file", url: getProductImage(src) } : null;
  return { type: "file", url: src };
}
