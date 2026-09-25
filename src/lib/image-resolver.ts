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

export const B2_DEFAULT_WORKER_URL = "https://aalm-b2-proxy.alamwastraly.workers.dev";
export const B2_DEFAULT_BUCKET_NAME = "aalm-vastralay-media";
export const B2_DEFAULT_DIRECT_URL = "https://f000.backblazeb2.com";

const B2_WORKER_URL = (process.env.NEXT_PUBLIC_B2_WORKER_URL || B2_DEFAULT_WORKER_URL).replace(/\/$/, "");
const B2_BUCKET_NAME = process.env.NEXT_PUBLIC_B2_BUCKET_NAME || process.env.B2_BUCKET_NAME || B2_DEFAULT_BUCKET_NAME;
const B2_DIRECT_URL = (process.env.NEXT_PUBLIC_B2_DIRECT_URL || B2_DEFAULT_DIRECT_URL).replace(/\/$/, "");

if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_B2_WORKER_URL && process.env.NODE_ENV !== "test") {
  console.warn(
    `[Aalm Media] NEXT_PUBLIC_B2_WORKER_URL is unset. Defaulting to '${B2_DEFAULT_WORKER_URL}'. Configure NEXT_PUBLIC_B2_WORKER_URL in Vercel Project Settings -> Environment Variables.`
  );
}

const USE_WSRV = process.env.NEXT_PUBLIC_USE_WSRV !== "false";

// Google Drive file ID pattern (typically 28 to 45 alphanumeric characters with underscores and dashes)
const GDRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{28,45}$/;
const GDRIVE_URL_REGEX = /(?:drive|docs)\.google\.com\/(?:file\/(?:u\/\d+\/)?d\/|(?:open|uc)\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i;
const YOUTUBE_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,14})/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

/**
 * Canonicalizes external image sharing links into direct raw image stream URLs.
 * Automatically transforms:
 *  - Google Drive (drive.google.com/file/d/..., open?id=..., uc?id=..., /uc?export=view) -> lh3.googleusercontent.com/d/{id}
 *  - Google Drive Direct ID -> lh3.googleusercontent.com/d/{id}
 *  - Dropbox (dropbox.com/... -> raw=1)
 *  - GitHub (github.com/.../blob/... -> raw.githubusercontent.com/...)
 *  - OneDrive (onedrive.live.com/... -> download=1)
 */
export function canonicalizeImageUrl(src: string | null | undefined): string {
  if (!src || typeof src !== "string") return "";
  const s = src.trim();

  // 1. Google Drive URLs
  const gdriveMatch = s.match(GDRIVE_URL_REGEX);
  if (gdriveMatch) {
    const fileId = gdriveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Google Drive Direct ID alone (33-char alphanumeric without slashes or dots)
  if (GDRIVE_ID_REGEX.test(s) && !s.includes("/") && !s.includes(".")) {
    return `https://lh3.googleusercontent.com/d/${s}`;
  }

  // 3. Dropbox links (replace dl=0 with raw=1)
  if (s.includes("dropbox.com/")) {
    if (s.includes("dl=0")) return s.replace("dl=0", "raw=1");
    if (!s.includes("raw=1") && !s.includes("dl=1")) {
      return s.includes("?") ? `${s}&raw=1` : `${s}?raw=1`;
    }
    return s;
  }

  // 4. GitHub repository image preview to raw
  if (s.includes("github.com/") && s.includes("/blob/")) {
    return s.replace("github.com/", "raw.githubusercontent.com/").replace("/blob/", "/");
  }

  // 5. OneDrive links
  if (s.includes("onedrive.live.com/") && !s.includes("download=1")) {
    return s.includes("?") ? `${s}&download=1` : `${s}?download=1`;
  }

  return s;
}

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
/**
 * Resolves any stored media reference into a high-performance, servable image URL
 * according to delivery strategy (wsrv, direct, b2, auto).
 */
export function resolveImage(src: string | null | undefined, opts: ResolveOptions = {}): string {
  if (!src || typeof src !== "string" || !src.trim()) {
    return PLACEHOLDER_IMAGE;
  }

  const { strategy = "wsrv", mirroredUrl, width = 800, quality = 70, thumbnail = false, version } = opts;
  const targetWidth = thumbnail ? 320 : width;
  const vParam = version ? `&v=${encodeURIComponent(String(version))}` : "";

  // Strategy: "b2" (Persistent Backblaze B2 Mirror)
  if (strategy === "b2") {
    const candidate = mirroredUrl || src;
    if (candidate.startsWith("b2:")) {
      const key = candidate.slice(3).replace(/^\//, "");
      // Media Split: Images -> Worker Proxy ($0 Egress), Videos -> B2 Direct (Byte-Range Streaming)
      if (isVideoUrl(key)) {
        return `${B2_DIRECT_URL}/file/${B2_BUCKET_NAME}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
      }
      if (!B2_WORKER_URL) return PLACEHOLDER_IMAGE;
      return `${B2_WORKER_URL}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
    }
  }

  // Strategy: "auto" (Hybrid — prefers mirrored B2 if available, else wsrv)
  if (strategy === "auto" && mirroredUrl && mirroredUrl.startsWith("b2:")) {
    const key = mirroredUrl.slice(3).replace(/^\//, "");
    if (isVideoUrl(key)) {
      return `${B2_DIRECT_URL}/file/${B2_BUCKET_NAME}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
    }
    if (B2_WORKER_URL) {
      return `${B2_WORKER_URL}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
    }
  }

  const raw = canonicalizeImageUrl(src);

  // Strategy: "direct" (Direct canonical link, e.g. raw Google Drive, Dropbox, or external URL without wsrv)
  if (strategy === "direct") {
    if (raw.startsWith("b2:")) {
      const key = raw.slice(3).replace(/^\//, "");
      return `${B2_DIRECT_URL}/file/${B2_BUCKET_NAME}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
    }
    return raw.startsWith("/") || /^https?:\/\//i.test(raw) ? raw : `/${raw}`;
  }

  // Default & Strategy: "wsrv" (Fast WebP Cache Pipeline)
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
    // Media Split: Videos bypass worker to preserve Cloudflare limits and support byte-range seeking
    if (isVideoUrl(key)) {
      return `${B2_DIRECT_URL}/file/${B2_BUCKET_NAME}/${key}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
    }
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

  // 4. Direct Google User Content / Google Drive
  if (raw.includes("lh3.googleusercontent.com/d/")) {
    if (!USE_WSRV) return raw;
    return `https://wsrv.nl/?url=${encodeURIComponent(raw)}&w=${targetWidth}&q=${quality}&output=webp&fit=cover${vParam}`;
  }

  // 5. External Direct URLs (http:// or https://)
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

  // 6. Local /public asset (or relative path)
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/**
 * Builds an ordered list of fallback image URLs for SmartImage.
 * Order: primary (by strategy) -> wsrv fallback for worker -> mirrored B2 -> wsrv -> raw direct canonical -> placeholder
 */
export function getImageFallbackList(src: string | null | undefined, opts: ResolveOptions = {}): string[] {
  if (!src || typeof src !== "string" || !src.trim()) {
    return [PLACEHOLDER_IMAGE];
  }

  const list: string[] = [];
  const primary = resolveImage(src, opts);
  if (primary && primary !== PLACEHOLDER_IMAGE) {
    list.push(primary);

    // If primary is served via Cloudflare Worker proxy, add immediate wsrv fallback
    // so a dead or cold-starting worker never leaves broken image icons.
    if (primary.includes("workers.dev")) {
      const wsrvWorkerFallback = `https://wsrv.nl/?url=${encodeURIComponent(primary)}&output=webp`;
      if (!list.includes(wsrvWorkerFallback)) {
        list.push(wsrvWorkerFallback);
      }
    }
  }

  if (opts.mirroredUrl && opts.mirroredUrl.startsWith("b2:")) {
    const b2Url = resolveImage(opts.mirroredUrl, { ...opts, strategy: "b2" });
    if (b2Url && b2Url !== PLACEHOLDER_IMAGE && !list.includes(b2Url)) {
      list.push(b2Url);
      if (b2Url.includes("workers.dev")) {
        const wsrvMirrorFallback = `https://wsrv.nl/?url=${encodeURIComponent(b2Url)}&output=webp`;
        if (!list.includes(wsrvMirrorFallback)) {
          list.push(wsrvMirrorFallback);
        }
      }
    }
  }

  const wsrvUrl = resolveImage(src, { ...opts, strategy: "wsrv" });
  if (wsrvUrl && wsrvUrl !== PLACEHOLDER_IMAGE && !list.includes(wsrvUrl)) {
    list.push(wsrvUrl);
  }

  const directUrl = resolveImage(src, { ...opts, strategy: "direct" });
  if (directUrl && directUrl !== PLACEHOLDER_IMAGE && !list.includes(directUrl)) {
    list.push(directUrl);
  }

  if (!list.includes(PLACEHOLDER_IMAGE)) {
    list.push(PLACEHOLDER_IMAGE);
  }

  return list;
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

  // Backblaze B2 Video (Always route video keys to direct B2 download endpoint, never worker)
  if (s.startsWith("b2:")) {
    const key = s.slice(3).replace(/^\//, "");
    return {
      type: "file",
      url: `${B2_DIRECT_URL}/file/${B2_BUCKET_NAME}/${key}`,
    };
  }

  // ImageKit Video
  if (s.startsWith("ik:")) {
    return isImageKitConfigured() ? { type: "file", url: getProductImage(s) } : null;
  }

  // Direct MP4 / WebM video files
  return { type: "file", url: s };
}
