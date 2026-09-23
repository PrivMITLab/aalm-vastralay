/**
 * 👑 AALM VASTRALAY — BACKBLAZE B2 COLD STORAGE ENGINE
 *
 * Handles direct-to-B2 uploads, presigned upload URLs, and file verification.
 * Completely bypasses Vercel 4.5MB serverless payload limit by letting clients
 * stream large media assets directly to Backblaze B2.
 */

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export interface PresignResult {
  uploadUrl: string;
  authorizationToken: string;
  key: string;
  fileName: string;
  maxBytes: number;
}

/**
 * Validates upload metadata against strict safety rules before generating presigned URLs.
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

  const cleanMime = contentType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${contentType}. Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM.`,
    };
  }

  const isVideo = cleanMime.startsWith("video/");
  const maxAllowed = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (sizeBytes > maxAllowed) {
    const limitMb = maxAllowed / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds ${limitMb}MB limit for ${isVideo ? "videos" : "images"}.`,
    };
  }

  // Sanitize filename and extract extension
  const ext = filename.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "webp");
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const key = `${folder}/${Date.now()}-${randomSuffix}.${ext}`;

  return { isValid: true, key };
}

/**
 * Generates an upload destination token for direct-to-B2 client upload.
 */
export async function getB2DirectUploadCredentials(
  key: string
): Promise<PresignResult> {
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APP_KEY;
  const bucketId = process.env.B2_BUCKET_ID;

  // In local development or if credentials aren't set yet, return local upload fallback
  if (!keyId || !appKey || !bucketId) {
    return {
      uploadUrl: `/api/upload/direct-fallback?key=${encodeURIComponent(key)}`,
      authorizationToken: "dev-fallback-token",
      key,
      fileName: key,
      maxBytes: MAX_IMAGE_BYTES,
    };
  }

  // 1. Authorize with Backblaze B2
  const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
    },
  });

  if (!authRes.ok) {
    throw new Error(`Failed to authorize with B2: ${authRes.status}`);
  }

  const authJson = (await authRes.json()) as { apiUrl: string; authorizationToken: string };

  // 2. Get upload URL for the target private bucket
  const uploadRes = await fetch(`${authJson.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: authJson.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to get B2 upload URL: ${uploadRes.status}`);
  }

  const uploadJson = (await uploadRes.json()) as {
    uploadUrl: string;
    authorizationToken: string;
  };

  return {
    uploadUrl: uploadJson.uploadUrl,
    authorizationToken: uploadJson.authorizationToken,
    key,
    fileName: key,
    maxBytes: MAX_IMAGE_BYTES,
  };
}
