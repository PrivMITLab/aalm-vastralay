import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { b2IsConfigured, b2UploadBuffer, validateUploadMetadata } from "@/lib/b2";
import { canonicalizeImageUrl, resolveImage } from "@/lib/image-resolver";
import { db } from "@/db";
import { mediaAssets, type MediaAsset } from "@/db/schema";
import { mediaCache } from "@/lib/media-cache";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — UNIVERSAL MEDIA UPLOAD & REGISTRATION ENDPOINT
 * POST /api/media/upload
 *
 * Supports:
 *  1. Direct Binary / Multipart File Upload (Stored in B2 + cached in PostgreSQL)
 *  2. Google Drive / External URL Registration (Direct canonicalization + cached in PostgreSQL)
 *
 * Guarantees:
 *  - Captured B2 fileId for hard permanent deletes
 *  - 0 B2 Class C listing overhead
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to upload media." },
        { status: 401 }
      );
    }

    const ip = clientIp(req.headers);
    const rate = memoryRateLimit(`media-upload:${user.id}:${ip}`, 30, 60); // 30 uploads / min
    if (!rate.ok) {
      return rateLimitResponse(rate);
    }

    const contentType = req.headers.get("content-type") || "";

    // ─────────────────────────────────────────────
    // CASE A: JSON Payload (Google Drive, External URL, or Base64)
    // ─────────────────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as {
        source?: "gdrive" | "external" | "b2";
        url?: string;
        data?: string;
        filename?: string;
        folder?: "products" | "brand" | "avatars";
      } | null;

      if (!body) {
        return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
      }

      const folder = (["products", "brand", "avatars"] as const).includes(body.folder as "products" | "brand" | "avatars")
        ? (body.folder as "products" | "brand" | "avatars")
        : "products";

      // Sub-case A1: Google Drive or External URL link
      if (body.url && (body.source === "gdrive" || body.source === "external" || !body.data)) {
        const rawUrl = body.url.trim();
        const canonicalUrl = canonicalizeImageUrl(rawUrl);
        if (!canonicalUrl) {
          return NextResponse.json({ success: false, error: "Invalid or unsupported media URL." }, { status: 400 });
        }

        // CodeQL fix: use URL.hostname instead of .includes() to prevent
        // substring bypass attacks like "evil.com/lh3.googleusercontent.com"
        let detectedSource: "gdrive" | "external" = "external";
        try {
          const parsed = new URL(canonicalUrl);
          const hostname = parsed.hostname.toLowerCase();
          const isGdrive =
            hostname === "lh3.googleusercontent.com" ||
            hostname.endsWith(".googleusercontent.com") ||
            hostname === "drive.google.com" ||
            hostname === "docs.google.com";
          detectedSource = isGdrive ? "gdrive" : "external";
        } catch {
          // canonicalizeImageUrl already validated this — safe fallback
          detectedSource = "external";
        }

        const dummyFileName = `${folder}/${detectedSource}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const [newAsset] = await db
          .insert(mediaAssets)
          .values({
            fileId: null,
            fileName: dummyFileName,
            servableUrl: canonicalUrl,
            sizeBytes: 0,
            mimeType: "image/webp",
            source: detectedSource,
            folder,
            uploadedBy: user.id,
            metadata: { originalUrl: rawUrl },
          })
          .returning();

        mediaCache.set(newAsset.id, newAsset as MediaAsset);

        return NextResponse.json({
          success: true,
          asset: newAsset,
        });
      }

      // Sub-case A2: Base64 Data URI upload to B2
      if (body.data && body.data.startsWith("data:")) {
        const comma = body.data.indexOf(",");
        const rawBase64 = comma >= 0 ? body.data.slice(comma + 1) : body.data;
        const mimeMatch = body.data.match(/data:([^;]+);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const buffer = Buffer.from(rawBase64, "base64");
        const filename = body.filename || `upload-${Date.now()}.jpg`;

        const val = validateUploadMetadata(filename, mime, buffer.length, folder);
        if (!val.isValid || !val.key) {
          return NextResponse.json({ success: false, error: val.error || "Validation failed." }, { status: 400 });
        }

        let fileId: string | null = null;
        let servableUrl = "";

        if (b2IsConfigured()) {
          const b2Res = await b2UploadBuffer(buffer, val.key, mime);
          fileId = b2Res.fileId;
          servableUrl = resolveImage(`b2:${val.key}`);
        } else {
          // Fallback data URI if B2 not configured
          servableUrl = `data:${mime};base64,${rawBase64}`;
        }

        const [newAsset] = await db
          .insert(mediaAssets)
          .values({
            fileId,
            fileName: val.key,
            servableUrl,
            sizeBytes: buffer.length,
            mimeType: mime,
            source: b2IsConfigured() ? "b2" : "local",
            folder,
            uploadedBy: user.id,
          })
          .returning();

        mediaCache.set(newAsset.id, newAsset as MediaAsset);

        return NextResponse.json({
          success: true,
          asset: newAsset,
        });
      }
    }

    // ─────────────────────────────────────────────
    // CASE B: Multipart / FormData File Upload
    // ─────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderInput = formData.get("folder") as string | null;
    const folder = (["products", "brand", "avatars"] as const).includes(folderInput as "products" | "brand" | "avatars")
      ? (folderInput as "products" | "brand" | "avatars")
      : "products";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided in form-data." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const val = validateUploadMetadata(file.name, file.type, buffer.length, folder);
    if (!val.isValid || !val.key) {
      return NextResponse.json({ success: false, error: val.error || "File validation failed." }, { status: 400 });
    }

    let fileId: string | null = null;
    let servableUrl = "";

    if (b2IsConfigured()) {
      const b2Res = await b2UploadBuffer(buffer, val.key, file.type);
      fileId = b2Res.fileId;
      servableUrl = resolveImage(`b2:${val.key}`);
    } else {
      // Data URI fallback for development if B2 unset
      servableUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const [newAsset] = await db
      .insert(mediaAssets)
      .values({
        fileId,
        fileName: val.key,
        servableUrl,
        sizeBytes: buffer.length,
        mimeType: file.type,
        source: b2IsConfigured() ? "b2" : "local",
        folder,
        uploadedBy: user.id,
      })
      .returning();

    mediaCache.set(newAsset.id, newAsset as MediaAsset);

    return NextResponse.json({
      success: true,
      asset: newAsset,
    });
  } catch (err) {
    const reqId = crypto.randomUUID();
    console.error(`[Media:Upload] [${reqId}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please check storage configuration." },
      { status: 500, headers: { "X-Request-Id": reqId } }
    );
  }
}
