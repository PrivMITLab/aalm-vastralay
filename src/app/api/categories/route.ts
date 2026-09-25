import { asc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public JSON Categories API
 * GET /api/categories
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`categories:${ip}`, 120, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  try {
    const allCats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    const countRows = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.categoryId);

    const productCounts: Record<string, number> = {};
    for (const row of countRows) {
      if (row.categoryId) productCounts[row.categoryId] = row.count;
    }

    const parents = allCats.filter((c) => !c.parentId);
    const tree = parents.map((parent) => {
      const children = allCats
        .filter((c) => c.parentId === parent.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          productCount: productCounts[child.id] ?? 0,
        }));

      const totalCount =
        (productCounts[parent.id] ?? 0) +
        children.reduce((acc, ch) => acc + ch.productCount, 0);

      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        iconUrl: parent.iconUrl,
        productCount: totalCount,
        subcategories: children,
      };
    });

    return NextResponse.json(
      {
        count: allCats.length,
        categories: tree,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
        },
      }
    );
  } catch (err) {
    console.error("[api/categories] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
