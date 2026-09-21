import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { resolveImage } from "@/lib/media-resolver";

export const dynamic = "force-dynamic";

/** Public JSON search API – GET /api/products?q=lehenga&category=women&limit=12 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim();
  const category = searchParams.get("category");
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 12));

  const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];
  if (q) {
    conditions.push(
      or(
        sql`to_tsvector('english', ${products.title} || ' ' || coalesce(${products.description}, '')) @@ plainto_tsquery('english', ${q})`,
        ilike(products.title, `%${q}%`),
      )!,
    );
  }
  if (category) {
    const cats = await db.select({ id: categories.id, parentId: categories.parentId, slug: categories.slug }).from(categories);
    const root = cats.find((c) => c.slug === category);
    if (root) {
      conditions.push(inArray(products.categoryId, [root.id, ...cats.filter((c) => c.parentId === root.id).map((c) => c.id)]));
    } else {
      return NextResponse.json({ count: 0, products: [] });
    }
  }

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
    .orderBy(desc(products.isFeatured), desc(products.totalReviews))
    .limit(limit);

  return NextResponse.json(
    {
      count: rows.length,
      products: rows.map((r) => ({ ...r, image: resolveImage(r.images[0], { width: 600 }), url: `/products/${r.slug}` })),
    },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
  );
}
