/**
 * 👑 AALM VASTRALAY — CLIENT-SIDE DIRECT B2 UPLOADER
 * Bypasses Vercel serverless function body size limitations (4.5 MB) by uploading
 * directly from browser to Backblaze B2 using authorized presigned tokens.
 */

export interface UploadResult {
  /** Database-storable opaque reference (e.g. b2:products/123-abc.webp) */
  key: string;
  /** Cloudflare Worker cached servable image URL */
  servableUrl: string;
}

export async function uploadToB2(
  file: File,
  folder: "products" | "brand" | "avatars" = "products"
): Promise<UploadResult> {
  // 1. Request presigned upload credentials from our server
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      folder,
    }),
  });

  if (!presignRes.ok) {
    const errorJson = (await presignRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorJson.error || "Failed to obtain upload authorization.");
  }

  const { uploadUrl, authorizationToken, key } = (await presignRes.json()) as {
    uploadUrl: string;
    authorizationToken: string;
    key: string;
  };

  // 2. Stream directly to Backblaze B2 (or direct upload handler)
  const isDirectB2 = uploadUrl.includes("backblazeb2.com");
  const uploadHeaders: Record<string, string> = {
    Authorization: authorizationToken,
    "Content-Type": file.type || "application/octet-stream",
  };

  if (isDirectB2) {
    // Backblaze native upload headers
    uploadHeaders["X-Bz-File-Name"] = encodeURIComponent(key);
    uploadHeaders["X-Bz-Content-Sha1"] = "do_not_verify";
  }

  const directUploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: uploadHeaders,
    body: file,
  });

  if (!directUploadRes.ok) {
    throw new Error(`Direct upload failed with status: ${directUploadRes.status}`);
  }

  // 3. Verify upload on server and get servable URL
  const verifyRes = await fetch("/api/upload/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!verifyRes.ok) {
    const errorJson = (await verifyRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorJson.error || "Upload verification failed.");
  }

  const verifyJson = (await verifyRes.json()) as UploadResult;
  return verifyJson;
}
