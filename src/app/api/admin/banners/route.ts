import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHomeConfig } from "@/lib/settings";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-banners:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  try {
    const homeConfig = await getHomeConfig();
    return NextResponse.json({
      success: true,
      banner: homeConfig.banner,
      homeConfig,
    });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/banners] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
