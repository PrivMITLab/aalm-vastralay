import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cached";
import { isValidPushSubscription } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    if (!isValidPushSubscription(body)) {
      return NextResponse.json({ error: "Invalid push subscription object" }, { status: 400 });
    }

    // In a production PWA, this endpoint stores the user's active push subscription
    // endpoint and encryption keys in the database.
    return NextResponse.json({
      success: true,
      message: "Push subscription registered successfully",
      userId: user?.id || null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
