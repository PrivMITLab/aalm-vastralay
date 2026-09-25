import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-users:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 100));

  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, users: rows, count: rows.length });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/users] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
