import { createHmac, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * ImageKit client-side upload authentication.
 * Returns { token, expire, signature } – signature = HMAC-SHA1(token + expire, IMAGEKIT_PRIVATE_KEY).
 * Only sellers/admins may upload. Rate limited to 30 requests/min.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`upload-auth:${user.id}:${ip}`, 30, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("[UploadAuth] IMAGEKIT_PRIVATE_KEY is missing from environment");
    return NextResponse.json({ success: false, error: "Upload service temporarily unavailable." }, { status: 503 });
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 10;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return NextResponse.json({ token, expire, signature });
}
