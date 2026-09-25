import "server-only";
import { getB2DirectUploadCredentials } from "@/lib/b2";

export type UploadResult = { url: string; bytes: number; type: string };

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Allowlisted external image hosts. Any product/avatar/logo URL
 * outside this list is rejected with 400 to prevent stored XSS/phishing.
 */
export const ALLOWED_IMAGE_HOSTS = [
  "ik.imagekit.io",
  "wsrv.nl",
  "lh3.googleusercontent.com",
  "res.cloudinary.com",
];

/**
 * Checks whether an external https URL belongs to an allowlisted host
 * (supports leading *. backblaze pattern via suffix match).
 */
export function isAllowedImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_IMAGE_HOSTS.some((h) => {
      if (h.startsWith("*.")) return host.endsWith(h.slice(1).toLowerCase());
      return host === h || host.endsWith(`.${h}`);
    });
  } catch {
    return false;
  }
}

export const ALLOWED_UPLOAD_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

/**
 * Single authoritative upload metadata validator.
 * Enforces MIME allowlist, 5MB cap, and strict path traversal protection.
 */
export function validateUploadMetadata(
  filename: string,
  contentType: string,
  sizeBytes: number,
  folder: "products" | "brand" | "avatars" = "products"
): { isValid: boolean; error?: string; key?: string } {
  if (!filename || typeof filename !== "string") {
    return { isValid: false, error: "Filename is required." };
  }

  // Prevent path traversal attempts
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { isValid: false, error: "Invalid filename: path traversal not allowed." };
  }

  const cleanMime = contentType.toLowerCase().trim();
  if (!ALLOWED_UPLOAD_MIMES.has(cleanMime)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${contentType}. Allowed types: JPEG, PNG, WebP, AVIF, SVG, GIF.`,
    };
  }

  if (sizeBytes <= 0) {
    return { isValid: false, error: "File cannot be empty." };
  }

  if (sizeBytes > MAX_UPLOAD_BYTES) {
    return {
      isValid: false,
      error: "File size exceeds 5MB limit.",
    };
  }

  const ext = extFromMime(cleanMime) || ".webp";
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const safeFolder = ["products", "brand", "avatars"].includes(folder) ? folder : "products";
  const key = `${safeFolder}/${Date.now()}-${randomSuffix}${ext}`;

  return { isValid: true, key };
}

export async function persistUpload(input: {
  bucket: string;
  data: string;
  mime: string;
}): Promise<UploadResult> {
  if (!ALLOWED_UPLOAD_MIMES.has(input.mime))
    throw new Error(`Unsupported file type ${input.mime}`);

  if (!input.data.startsWith("data:"))
    throw new Error("Unsupported upload format");

  const comma = input.data.indexOf(",");
  const raw = comma >= 0 ? input.data.slice(comma + 1) : input.data;
  const buffer = Buffer.from(raw, "base64");
  if (buffer.length === 0) throw new Error("Empty file");
  if (buffer.length > MAX_UPLOAD_BYTES)
    throw new Error("File too large (max 5 MB)");
  if (!looksLikeImage(buffer, input.mime))
    throw new Error("File contents do not match an image");

  const ext = extFromMime(input.mime);
  const cryptoMod = await import("crypto");
  const hash = cryptoMod.randomBytes(8).toString("hex");
  const filename = `${hash}${ext}`;

  // 1. If Backblaze B2 is configured, upload directly to B2
  const hasB2 = Boolean(
    process.env.B2_KEY_ID &&
    process.env.B2_APP_KEY &&
    process.env.B2_BUCKET_ID
  );

  if (hasB2) {
    try {
      const b2Key = `${input.bucket}/${filename}`;
      const creds = await getB2DirectUploadCredentials(b2Key);
      const isDirectB2 = creds.uploadUrl.includes("backblazeb2.com");
      if (isDirectB2) {
        const cryptoMod2 = await import("node:crypto");
        const sha1 = cryptoMod2.createHash("sha1").update(buffer).digest("hex");
        const b2Res = await fetch(creds.uploadUrl, {
          method: "POST",
          headers: {
            Authorization: creds.authorizationToken,
            "X-Bz-File-Name": encodeURIComponent(b2Key),
            "Content-Type": input.mime,
            "Content-Length": String(buffer.length),
            "X-Bz-Content-Sha1": sha1,
          },
          body: buffer,
        });

        if (b2Res.ok) {
          return { url: `b2:${b2Key}`, bytes: buffer.length, type: input.mime };
        }
      }
    } catch (err) {
      console.warn("[Uploads] B2 upload failed, attempting fallback:", err);
    }
  }

  // 2. Local disk fallback (for self-hosted or Node.js environments)
  try {
    const fs = await import("fs/promises");
    const pathMod = await import("path");
    const { mkdir, writeFile } = fs;
    const { join, normalize, resolve } = pathMod;

    const publicRoot = resolve(process.cwd(), "public");
    const uploadsRoot = resolve(publicRoot, "uploads");
    const segments = input.bucket
      .split("/")
      .map((seg) =>
        seg
          .replace(/[^a-z0-9_-]/gi, "")
          .toLowerCase()
          .slice(0, 40),
      )
      .filter(Boolean)
      .slice(0, 4);
    const dir = resolve(join(uploadsRoot, ...segments));
    if (!dir.startsWith(uploadsRoot)) throw new Error("Upload path escape");
    await mkdir(dir, { recursive: true });

    const filepath = join(dir, filename);
    await writeFile(filepath, buffer);

    const relative = normalize(filepath)
      .slice(publicRoot.length)
      .replace(/\\/g, "/");
    return { url: relative, bytes: buffer.length, type: input.mime };
  } catch {
    // If on read-only filesystem (e.g. Vercel) and buffer is reasonable size, fallback to data URL
    if (buffer.length <= 2 * 1024 * 1024) {
      return {
        url: `data:${input.mime};base64,${raw}`,
        bytes: buffer.length,
        type: input.mime,
      };
    }
    throw new Error(
      "File storage is in read-only mode. Please configure Backblaze B2 or ImageKit in Vercel settings."
    );
  }
}

import { extFromMime, looksLikeImage } from "./image-inspector";
export { extFromMime, looksLikeImage };
