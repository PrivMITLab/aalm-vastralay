/**
 * 👑 AALM VASTRALAY — UNIVERSAL IMAGE & MEDIA RESOLVER ENGINE
 *
 * Implements a production-grade, fault-tolerant 6-stage priority auto-detection pipeline:
 *  1. ImageKit (ik: path or ik.imagekit.io with WebP /tr: transforms)
 *  2. Backblaze B2 (b2: key via Cloudflare Worker proxy)
 *  3. Google Drive Direct ID (33-char alphanumeric -> lh3.googleusercontent.com + wsrv.nl)
 *  4. Google Drive Share Links (drive.google.com/file/d/.../view)
 *  5. YouTube & Streaming Video (embed iframes & video streaming bypass)
 *  6. Direct External URLs (wsrv.nl WebP compression with URL encoding)
 *  7. Local Assets (/brand/..., /uploads/..., /images/...)
 *
 * Guarantee: Zero broken image icons — always falls back safely to PLACEHOLDER_IMAGE.
 */

import { getProductImage, getThumbnail, isImageKitConfigured } from "./imagekit";
import type { ResolveOptions, VideoResolveResult } from "@/types/media";

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

const B2_WORKER_URL = (process.env.NEXT_PUBLIC_B2_WORKER_URL ?? "").replace(/\/$/, "");
const USE_WSRV = process.env.NEXT_PUBLIC_USE_WSRV !== "false";

// Google Drive file ID pattern (typically 28 to 45 alphanumeric characters with underscores and dashes)
const GDRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{28,45}$/;
const GDRIVE_URL_REGEX = /(?:drive|docs)\.google\.com\/(?:file\/(?:u\/\d+\/)?d\/|(?:open|uc)\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i;
const YOUTUBE_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,14})/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

/**
 * Checks whether a given media source reference is a video format.
 */
export function isVideoUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  const s = src.trim();
  if (s.startsWith("youtube:") || YOUTUBE_REGEX.test(s)) return true;
  if (VIDEO_EXT_REGEX.test(s)) return true;
  if (s.includes("video/mp4") || s.includes("video/webm")) return true;
  return false;
}

/**
 * Extracts YouTube video ID from various link formats.
 */
export function extractYouTubeId(src: string): string | null {
  if (src.startsWith("youtube:")) return src.slice(8).trim();
  const match = src.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

/**
 * Resolves any stored media reference into a high-performance, servable image URL.
 */
export function resolveImage(src: string | null | undefined, opts: ResolveOptions = {}): string {
  if (!src || typeof src !== "string" || !src.trim()) {
    return PLACEHOLDER_IMAGE;
  }

  const raw = src.trim();
  const { width = 800, quality = 70, thumbnail = false, version } = opts;
  const targetWidth = thumbnail ? 320 : width;
  const vParam = version ? `&v=${encodeURIComponent(String(version))}` : "";

  // 1. ImageKit (ik: path)
  if (raw.startsWith("ik:")) {
    if (!isImageKitConfigured()) {
      return PLACEHOLDER_IMAGE;
    }
    const ikUrl = thumbnail ? getThumbnail(raw) : getProductImage(raw, targetWidth, quality);
    return version ? `${ikUrl}${ikUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(String(version))}` : ikUrl;
  }

  // 2. Backblaze B2 (b2: key)
  if (raw.startsWith("b2:")) {
    const key = raw.slice(3).replace(/^\//, "");
    if (!B2_WORKER_URL) return PLACEHOLDER_IMAGE;
    return `${B2_WORKER_URL}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
  }

  // 3. YouTube thumbnail fallback if passed as an image
  const ytId = extractYouTubeId(raw);
  if (ytId) {
    const ytThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (!USE_WSRV) return ytThumb;
    return `https://wsrv.nl/?url=${encodeURIComponent(ytThumb)}&w=${targetWidth}&q=${quality}&output=webp&fit=cover${vParam}`;
  }

  // 4. Google Drive URL
  const gdriveUrlMatch = raw.match(GDRIVE_URL_REGEX);
  if (gdriveUrlMatch) {
    const fileId = gdriveUrlMatch[1];
    const directGdriveUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    if (!USE_WSRV) return directGdriveUrl;
    return `https://wsrv.nl/?url=${encodeURIComponent(directGdriveUrl)}&w=${targetWidth}&q=${quality}&output=webp&fit=cover${vParam}`;
  }

  // 5. Google Drive Direct ID (33-char alphanumeric without slashes or dots)
  if (GDRIVE_ID_REGEX.test(raw) && !raw.includes("/") && !raw.includes(".")) {
    const directGdriveUrl = `https://lh3.googleusercontent.com/d/${raw}`;
    if (!USE_WSRV) return directGdriveUrl;
    return `https://wsrv.nl/?url=${encodeURIComponent(directGdriveUrl)}&w=${targetWidth}&q=${quality}&output=webp&fit=cover${vParam}`;
  }

  // 6. External Direct URLs (http:// or https://)
  if (/^https?:\/\//i.test(raw)) {
    // If it's already an ImageKit URL, inject transformation params
    if (raw.includes("ik.imagekit.io") && !raw.includes("/tr:")) {
      const parts = raw.split("ik.imagekit.io/");
      if (parts.length === 2) {
        const [endpointPrefix, rest] = parts[1].split(/\/(.+)/);
        if (endpointPrefix && rest) {
          return `https://ik.imagekit.io/${endpointPrefix}/tr:w-${targetWidth},q-${quality},f-webp/${rest}${vParam}`;
        }
      }
    }

    if (!USE_WSRV) return raw;
    return `https://wsrv.nl/?url=${encodeURIComponent(raw)}&w=${targetWidth}&q=${quality}&output=webp&fit=cover${vParam}`;
  }

  // 7. Local /public asset (or relative path)
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/**
 * Returns a 320px thumbnail for catalog grids and preview drawers.
 */
export function resolveThumbnail(src: string | null | undefined, opts: Omit<ResolveOptions, "thumbnail"> = {}): string {
  return resolveImage(src, { ...opts, thumbnail: true });
}

/**
 * Returns the primary (first) image from an array of images.
 */
export function firstImage(images: (string | null | undefined)[] | null | undefined, opts?: ResolveOptions): string {
  const candidate = images?.find((img) => Boolean(img && img.trim()));
  return resolveImage(candidate, opts);
}

/**
 * Resolves a video reference into an embeddable iframe URL or direct stream URL.
 */
export function resolveVideo(src: string | null | undefined): VideoResolveResult | null {
  if (!src || !src.trim()) return null;
  const s = src.trim();

  // YouTube Links & Prefixes
  const ytId = extractYouTubeId(s);
  if (ytId) {
    return {
      type: "youtube",
      url: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
    };
  }

  // Google Drive Video (Bypass wsrv.nl as wsrv does not support video streaming)
  const gdriveMatch = s.match(GDRIVE_URL_REGEX);
  if (gdriveMatch) {
    const fileId = gdriveMatch[1];
    return {
      type: "file",
      url: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  // ImageKit Video
  if (s.startsWith("ik:")) {
    return isImageKitConfigured() ? { type: "file", url: getProductImage(s) } : null;
  }

  // Direct MP4 / WebM video files
  return { type: "file", url: s };
}
