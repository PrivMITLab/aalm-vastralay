/**
 * 👑 AALM VASTRALAY — BACKBLAZE B2 COLD STORAGE ENGINE
 *
 * Handles direct-to-B2 uploads, presigned upload URLs, and file verification.
 * Completely bypasses Vercel 4.5MB serverless payload limit by letting clients
 * stream large media assets directly to Backblaze B2.
 *
 * Security contract:
 *  - Missing B2 credentials → throws B2StorageNotConfiguredError (caller must 503).
 *  - No hardcoded fake tokens — any request with missing creds fails explicitly.
 *  - validateUploadMetadata covers gif/mp4/webm with 10 MB image / 100 MB video caps.
 */

/** Sentinel error thrown when B2 env vars are absent. Presign route must return 503. */
export class B2StorageNotConfiguredError extends Error {
  readonly code = "B2_NOT_CONFIGURED" as const;
  constructor() {
    super("Storage not configured. Set B2_KEY_ID, B2_APP_KEY and B2_BUCKET_ID in environment.");
    this.name = "B2StorageNotConfiguredError";
  }
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10 MB
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
 * Covers image/gif + video/mp4/webm with separate size caps.
 * Rejects path traversal, disallowed MIME types, and empty files.
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

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { isValid: false, error: "Invalid filename: path traversal not allowed." };
  }

  const cleanMime = contentType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${contentType}. Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM.`,
    };
  }

  if (sizeBytes <= 0) {
    return { isValid: false, error: "File cannot be empty." };
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
  const ext = filename.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "webp");
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const safeFolder = (["products", "brand", "avatars"] as const).includes(
    folder as "products" | "brand" | "avatars"
  )
    ? folder
    : "products";
  const key = `${safeFolder}/${Date.now()}-${randomSuffix}.${ext}`;

  return { isValid: true, key };
}

/**
 * Generates an upload destination token for direct-to-B2 client upload.
 *
 * @throws {B2StorageNotConfiguredError} when B2 credentials are absent — caller must return 503.
 * @throws {Error} on B2 API failures.
 */
export async function getB2DirectUploadCredentials(
  key: string
): Promise<PresignResult> {
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY;
  const bucketId = process.env.B2_BUCKET_ID;

  // Fail explicitly — never return a fake token in any environment
  if (!keyId || !appKey || !bucketId) {
    throw new B2StorageNotConfiguredError();
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

export function b2IsConfigured(): boolean {
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY;
  const bucketId = process.env.B2_BUCKET_ID;
  return Boolean(keyId && appKey && bucketId);
}

/**
 * Uploads a binary buffer directly to Backblaze B2 cold storage.
 * Returns the unique fileId required for hard deletion without tombstone markers.
 */
export async function b2UploadBuffer(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{
  fileId: string;
  fileName: string;
  contentLength: number;
  contentType: string;
}> {
  const creds = await getB2DirectUploadCredentials(fileName);
  const cryptoMod = await import("node:crypto");
  const sha1 = cryptoMod.createHash("sha1").update(buffer).digest("hex");

  const b2Res = await fetch(creds.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: creds.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
      "X-Bz-Content-Sha1": sha1,
    },
    body: new Uint8Array(buffer),
  });

  if (!b2Res.ok) {
    const errText = await b2Res.text().catch(() => "");
    throw new Error(`B2 upload failed [${b2Res.status}]: ${errText}`);
  }

  const result = (await b2Res.json()) as {
    fileId: string;
    fileName: string;
    contentLength: number;
    contentType: string;
  };

  return {
    fileId: result.fileId,
    fileName: result.fileName,
    contentLength: result.contentLength,
    contentType: result.contentType,
  };
}

/**
 * Permanently hard-deletes a specific file version from Backblaze B2 using its unique fileId.
 * Does NOT generate tombstone / hide markers, conserving Class C transactions and storage.
 */
export async function b2DeleteFileVersion(
  fileName: string,
  fileId: string
): Promise<{ success: boolean; fileId: string; fileName: string }> {
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY;

  if (!keyId || !appKey) {
    throw new B2StorageNotConfiguredError();
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

  // 2. Permanently delete the specific file version
  const deleteRes = await fetch(`${authJson.apiUrl}/b2api/v2/b2_delete_file_version`, {
    method: "POST",
    headers: {
      Authorization: authJson.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileId }),
  });

  if (!deleteRes.ok) {
    const errBody = await deleteRes.json().catch(() => ({}));
    // If already deleted or file_not_present, consider idempotent success
    if (errBody && (errBody.code === "file_not_present" || deleteRes.status === 404)) {
      return { success: true, fileId, fileName };
    }
    throw new Error(`Failed to delete B2 file version [${deleteRes.status}]: ${JSON.stringify(errBody)}`);
  }

  return { success: true, fileId, fileName };
}

