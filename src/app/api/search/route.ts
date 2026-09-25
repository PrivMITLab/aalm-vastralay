import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { resolveImage } from "@/lib/media-resolver";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Full Search API
 * GET /api/search?q=...&limit=24
 * Rate limited to 120/min, max query length 60, escapes SQL wildcards.
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`search:${ip}`, 60, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate, undefined, "Too many search queries. Please slow down.");
  }

  const { searchParams } = req.nextUrl;
  const rawQ = (searchParams.get("q") ?? "").trim();
  const q = rawQ.slice(0, 60);
  const limit = Math.min(60, Math.max(1, Number(searchParams.get("limit")) || 24));

  if (!q) {
    return NextResponse.json({ query: "", count: 0, products: [] });
  }

  const escapedQ = q.replace(/[%_\\]/g, "\\$&");

  try {
    const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];

    conditions.push(
      or(
        sql`to_tsvector('english', ${products.title} || ' ' || coalesce(${products.description}, '')) @@ plainto_tsquery('english', ${q})`,
        ilike(products.title, `%${escapedQ}%`),
        ilike(products.description, `%${escapedQ}%`),
        sql`${q.toLowerCase()} = ANY(${products.tags})`
      )!
    );

    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        price: products.price,
        mrp: products.mrp,
        discountPercent: products.discountPercent,
        rating: products.rating,
        totalReviews: products.totalReviews,
        stock: products.stock,
        images: products.images,
        storeName: stores.storeName,
        storeSlug: stores.slug,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(and(...conditions))
      .orderBy(desc(products.isFeatured), desc(products.rating), desc(products.createdAt))
      .limit(limit);

    return NextResponse.json(
      {
        query: q,
        count: rows.length,
        products: rows.map((r) => ({
          ...r,
          image: resolveImage(r.images[0], { width: 500 }),
          url: `/products/${r.slug}`,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[api/search] Error:", err);
    return NextResponse.json(
      { error: "Search query failed" },
      { status: 500 }
    );
  }
}
