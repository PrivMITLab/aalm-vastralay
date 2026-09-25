import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth/cached";
import { isValidPushSubscription } from "@/lib/push";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const pushSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(10).max(500),
    auth: z.string().min(10).max(500),
  }),
});

/**
 * POST /api/notifications/push-subscribe — real production subscription store.
 * Rate-limited 10/min, zod-validated, persists to push_subscriptions table.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`push-sub:${ip}`, 10, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate, undefined, "Too many subscription requests. Please try again later.");
  }
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => null);

    if (!isValidPushSubscription(body)) {
      return NextResponse.json({ success: false, error: "Invalid subscription" }, { status: 400 });
    }
    const parsed = pushSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid subscription" }, { status: 400 });
    }
    const { endpoint, keys } = parsed.data;
    await db.execute(
      sql`INSERT INTO "push_subscriptions" ("user_id", "endpoint", "keys_p256dh", "keys_auth") VALUES (${user?.id ?? null}, ${endpoint}, ${keys.p256dh}, ${keys.auth}) ON CONFLICT ("endpoint") DO NOTHING;`,
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Push] subscribe failed:", err);
    return NextResponse.json({ success: false, error: "Could not save subscription" }, { status: 500 });
  }
}
