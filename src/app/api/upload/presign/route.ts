import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateUploadMetadata, getB2DirectUploadCredentials } from "@/lib/b2";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — PRESIGNED DIRECT UPLOAD ENDPOINT
 * POST /api/upload/presign
 * Body: { filename: string, contentType: string, sizeBytes: number, folder?: "products" | "brand" | "avatars" }
 * Enforces seller/admin role in all environments and rate limits to 30 req/min.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Seller or Admin access required." }, { status: 401 });
    }

    const ip = clientIp(req.headers);
    const rate = memoryRateLimit(`upload-presign:${user.id}:${ip}`, 30, 60);
    if (!rate.ok) {
      return rateLimitResponse(rate);
    }

    const body = (await req.json().catch(() => null)) as {
      filename?: string;
      contentType?: string;
      sizeBytes?: number;
      folder?: "products" | "brand" | "avatars";
    } | null;

    if (!body || !body.filename || !body.contentType || typeof body.sizeBytes !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields: filename, contentType, sizeBytes." },
        { status: 400 }
      );
    }

    const { filename, contentType, sizeBytes, folder } = body;
    const validation = validateUploadMetadata(filename, contentType, sizeBytes, folder);
    if (!validation.isValid || !validation.key) {
      return NextResponse.json({ success: false, error: validation.error ?? "Invalid upload metadata." }, { status: 400 });
    }

    const credentials = await getB2DirectUploadCredentials(validation.key);

    return NextResponse.json({
      success: true,
      ...credentials,
    });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[Upload:Presign] [${requestId}] Failed:`, err);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again later." },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
