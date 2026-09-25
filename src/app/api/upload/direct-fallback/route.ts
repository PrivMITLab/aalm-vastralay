import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { persistUpload, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const directFallbackSchema = z.object({
  key: z.string().min(1).max(250),
  data: z.string().min(1),
  mime: z.string().min(1).max(100),
});

/**
 * 👑 AALM VASTRALAY — DIRECT UPLOAD LOCAL FALLBACK ENDPOINT
 * POST /api/upload/direct-fallback
 *
 * Catches direct-to-B2 uploads when Backblaze B2 environment credentials
 * (B2_KEY_ID, B2_APP_KEY, B2_BUCKET_ID) are missing or in local development.
 * Safely persists assets to local disk or memory via persistUpload without 404ing.
 *
 * Security:
 *  - Enforces Seller or Admin authentication
 *  - Rate limited to 30 req/min
 *  - Strict path traversal protection (blocks `..`, `/`, `\`)
 *  - 5MB maximum file size limit
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Authentication (Seller or Admin only)
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller or Admin access required." },
        { status: 401 }
      );
    }

    // 2. Rate Limiting (30 requests/minute per authenticated user IP)
    const ip = clientIp(req.headers);
    const rate = memoryRateLimit(`upload-direct-fallback:${user.id}:${ip}`, 30, 60);
    if (!rate.ok) {
      return rateLimitResponse(rate);
    }

    let key: string;
    let dataUri: string;
    let mime: string;

    const contentType = req.headers.get("content-type") || "";

    // 3. Handle JSON Body { key, data, mime }
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => null);
      const parsed = directFallbackSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid payload: key, data, and mime are required." },
          { status: 400 }
        );
      }
      key = parsed.data.key;
      mime = parsed.data.mime;
      dataUri = parsed.data.data.startsWith("data:")
        ? parsed.data.data
        : `data:${mime};base64,${parsed.data.data}`;
    } else {
      // 4. Handle Direct Raw Stream (Browser fetch body: file from uploadToB2 client)
      const url = new URL(req.url);
      const queryKey = url.searchParams.get("key");
      if (!queryKey) {
        return NextResponse.json(
          { success: false, error: "Missing required 'key' parameter." },
          { status: 400 }
        );
      }
      key = decodeURIComponent(queryKey);
      mime = contentType.split(";")[0].trim() || "image/webp";

      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return NextResponse.json({ success: false, error: "Empty file." }, { status: 400 });
      }
      if (arrayBuffer.byteLength > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, error: "File exceeds 5MB limit." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(arrayBuffer);
      dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // 5. Strict Key Sanitization (blocks path traversal)
    if (!key || key.includes("..") || key.startsWith(".") || key.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Invalid key: path traversal not allowed." },
        { status: 400 }
      );
    }

    // 6. Extract Bucket Folder
    const segments = key.split("/");
    const bucket = segments.length > 1 ? segments.slice(0, -1).join("/") : "products";

    // 7. Persist Upload (Reuses existing server-side disk/fallback pipeline)
    const result = await persistUpload({
      bucket,
      data: dataUri,
      mime,
    });

    return NextResponse.json({
      success: true,
      key,
      uploadUrl: result.url,
      servableUrl: result.url,
      bytes: result.bytes,
    });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[Upload:DirectFallback] [${requestId}] Failed:`, err);
    return NextResponse.json(
      { success: false, error: "Fallback upload failed. Please try again." },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
