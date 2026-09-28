import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userActivity } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = (await req.json()) as {
      guestId?: string;
      activityType: "view" | "search" | "cart";
      productId?: string;
      searchQuery?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.activityType) {
      return NextResponse.json({ error: "activityType is required" }, { status: 400 });
    }

    // Fire and forget insert into user_activity
    await db.insert(userActivity).values({
      userId: user?.id ?? null,
      guestId: body.guestId ?? null,
      activityType: body.activityType,
      productId: body.productId ?? null,
      searchQuery: body.searchQuery ?? null,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Non-fatal telemetry error
    console.warn("[activity-track error]:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
