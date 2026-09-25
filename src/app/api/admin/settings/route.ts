import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-settings:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  try {
    const all = await getSettings();
    return NextResponse.json({ success: true, settings: all });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/settings] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
