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
  folder: "products" | "brand" | "avatars" | "reviews" = "products"
): Promise<UploadResult> {
  // Fallback handler: streams through server if direct B2 or CORS preflight fails
  const uploadViaFallback = async (): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorJson = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorJson.error || "Server upload fallback failed.");
    }

    const json = (await res.json()) as {
      success?: boolean;
      asset?: {
        id?: string;
        fileName?: string;
        servableUrl?: string;
      };
      error?: string;
    };

    if (!json.success || !json.asset?.servableUrl) {
      throw new Error(json.error || "Server upload fallback failed.");
    }

    const key = json.asset.fileName
      ? (json.asset.fileName.startsWith("b2:") ? json.asset.fileName : `b2:${json.asset.fileName}`)
      : json.asset.id || `local:${Date.now()}`;

    return {
      key,
      servableUrl: json.asset.servableUrl,
    };
  };

  // 1. Request presigned upload credentials from our server
  let presignRes: Response;
  try {
    presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        folder,
      }),
    });
  } catch (netErr) {
    console.warn("[Upload] Presign request encountered network error, falling back to server upload:", netErr);
    return uploadViaFallback();
  }

  if (!presignRes.ok) {
    console.warn(`[Upload] Presign failed with status ${presignRes.status}, falling back to server upload.`);
    try {
      return await uploadViaFallback();
    } catch {
      const errorJson = (await presignRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorJson.error || "Failed to obtain upload authorization.");
    }
  }

  const { uploadUrl, authorizationToken, key } = (await presignRes.json()) as {
    uploadUrl: string;
    authorizationToken: string;
    key: string;
  };

  // 2. Stream directly to Backblaze B2 (or direct upload handler)
  let isDirectB2 = false;
  try {
    const parsedHost = new URL(uploadUrl).hostname.toLowerCase();
    isDirectB2 = parsedHost === "backblazeb2.com" || parsedHost.endsWith(".backblazeb2.com");
  } catch {
    isDirectB2 = false;
  }
  const uploadHeaders: Record<string, string> = {
    Authorization: authorizationToken,
    "Content-Type": file.type || "application/octet-stream",
  };

  if (isDirectB2) {
    uploadHeaders["X-Bz-File-Name"] = encodeURIComponent(key);
    uploadHeaders["X-Bz-Content-Sha1"] = "do_not_verify";
  }

  try {
    const directUploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: uploadHeaders,
      body: file,
    });

    if (!directUploadRes.ok) {
      console.warn(`[Upload] Direct B2 returned status ${directUploadRes.status}, falling back to server upload.`);
      return await uploadViaFallback();
    }
  } catch (corsOrNetErr) {
    console.warn("[Upload] Direct upload to storage provider failed (likely CORS or network), falling back to server upload:", corsOrNetErr);
    return await uploadViaFallback();
  }

  // 3. Verify upload on server and get servable URL
  try {
    const verifyRes = await fetch("/api/upload/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (!verifyRes.ok) {
      console.warn(`[Upload] Verification failed with status ${verifyRes.status}, falling back to server upload.`);
      return await uploadViaFallback();
    }

    const verifyJson = (await verifyRes.json()) as UploadResult;
    return verifyJson;
  } catch (verifyErr) {
    console.warn("[Upload] Verification network error, falling back to server upload:", verifyErr);
    return await uploadViaFallback();
  }
}
