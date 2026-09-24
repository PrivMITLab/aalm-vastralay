import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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
      .limit(100);

    return NextResponse.json({ products: rows, count: rows.length });
  } catch (err) {
    console.error("[api/admin/products] Error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
