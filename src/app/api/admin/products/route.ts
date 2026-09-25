import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const rate = await rateLimit({ key: `admin-products:${current.id}`, limit: 60, windowSeconds: 60, failClosed: true });
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 100));

  try {
    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        rating: products.rating,
        totalReviews: products.totalReviews,
        createdAt: products.createdAt,
        storeName: stores.storeName,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, products: rows, count: rows.length });
  } catch (err) {
    const requestId = crypto.randomUUID();
    console.error(`[api/admin/products] [${requestId}] Error:`, err);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500, headers: { "X-Request-Id": requestId } });
  }
}
