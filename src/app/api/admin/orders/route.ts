import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, stores, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-orders:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 100));

  try {
    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        total: orders.total,
        createdAt: orders.createdAt,
        customerEmail: users.email,
        customerName: users.fullName,
        storeName: stores.storeName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(stores, eq(orders.storeId, stores.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, orders: rows, count: rows.length });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/orders] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
