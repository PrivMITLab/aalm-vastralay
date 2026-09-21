import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { resolveThumbnail } from "@/lib/media-resolver";
import { getSettingNumber } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Lightweight autocomplete endpoint used by the header search box. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ products: [] });

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const limitPerMin = (await getSettingNumber("security.apiRateLimit", 120)) * 2;
  const limit = await rateLimit({ key: `suggest:${ip}`, limit: Math.max(30, limitPerMin), windowSeconds: 60 });
  if (!limit.ok) return NextResponse.json({ products: [] }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

  const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];
  const escaped = q.replace(/[%_\\]/g, "\\$&");
  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 4);
  conditions.push(
    or(
      ilike(products.title, `%${escaped}%`),
      ilike(products.description, `%${escaped}%`),
      sql`${q.toLowerCase()} = ANY(${products.tags})`,
      ...words.map((w) => sql`${products.tags} && ARRAY[${w}]::text[]`),
    )!,
  );

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      price: products.price,
      images: products.images,
      storeName: stores.storeName,
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(and(...conditions))
    .orderBy(desc(products.isFeatured), desc(products.totalReviews))
    .limit(6);

  return NextResponse.json({
    products: rows.map((r) => ({ ...r, image: resolveThumbnail(r.images[0]), storeName: r.storeName })),
  });
}
