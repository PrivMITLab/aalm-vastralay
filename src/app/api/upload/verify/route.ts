import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveImage } from "@/lib/image-resolver";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — UPLOAD VERIFICATION ENDPOINT
 * POST /api/upload/verify
 * Body: { key: string }
 * Restricted to seller/admin.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Seller or Admin access required." }, { status: 401 });
    }

    const ip = clientIp(req.headers);
    const rate = memoryRateLimit(`upload-verify:${user.id}:${ip}`, 60, 60);
    if (!rate.ok) {
      return rateLimitResponse(rate);
    }

    const body = (await req.json().catch(() => null)) as { key?: string } | null;
    const key = body?.key;

    if (!key || typeof key !== "string" || key.includes("..") || key.length > 250) {
      return NextResponse.json({ success: false, error: "Invalid file key provided." }, { status: 400 });
    }

    const b2Key = key.startsWith("b2:") ? key : `b2:${key}`;
    const servableUrl = resolveImage(b2Key);

    return NextResponse.json({
      success: true,
      key: b2Key,
      servableUrl,
    });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[Upload:Verify] [${requestId}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
