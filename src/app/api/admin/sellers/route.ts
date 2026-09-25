import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-sellers:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 100));

  try {
    const rows = await db
      .select({
        id: stores.id,
        storeName: stores.storeName,
        slug: stores.slug,
        city: stores.city,
        state: stores.state,
        isActive: stores.isActive,
        rating: stores.rating,
        totalSales: stores.totalSales,
        createdAt: stores.createdAt,
        ownerEmail: users.email,
        ownerName: users.fullName,
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .orderBy(desc(stores.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, sellers: rows, count: rows.length });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/sellers] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch sellers" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
