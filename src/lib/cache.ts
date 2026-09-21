import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";

/**
 * Tag-based data cache for catalogue reads.
 *
 * Pages are dynamic (the header shows personal cart counts) but these
 * catalogue fragments rarely change, so we cache them at the data layer and
 * bust the "catalog" tag from server actions whenever a product/store/category
 * changes. Result: navigation + homepage render without hammering the DB.
 */
export const CATALOG_TAG = "catalog";
export const STORES_TAG = "stores";

export type NavCategory = { name: string; slug: string; children: { name: string; slug: string }[] };

export const getNavCategories = unstable_cache(
  async (): Promise<NavCategory[]> => {
    try {
      const all = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
      return all
        .filter((c) => !c.parentId)
        .map((p) => ({
          name: p.name,
          slug: p.slug,
          children: all.filter((c) => c.parentId === p.id).map((c) => ({ name: c.name, slug: c.slug })),
        }));
    } catch (err) {
      console.warn("[getNavCategories] Database unavailable, falling back to empty navigation:", err instanceof Error ? err.message : err);
      return [];
    }
  },
  ["nav-categories"],
  { revalidate: 900, tags: [CATALOG_TAG] },
);

export type CatalogProductCard = {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp: number | null;
  discountPercent: number | null;
  rating: number | null;
  totalReviews: number;
  stock: number;
  images: string[];
  tags: string[] | null;
  isFeatured: boolean;
  storeName: string | null;
  storeSlug: string | null;
};

async function cardQuery(where: SQL | undefined, order: "featured" | "new", limit: number) {
  try {
    const rows = await db
      .select({ product: products, storeName: stores.storeName, storeSlug: stores.slug })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(where)
      .orderBy(
        ...(order === "featured"
          ? [desc(products.isFeatured), desc(products.rating), desc(products.totalReviews), desc(products.createdAt)]
          : [desc(products.createdAt), desc(products.rating)]),
      )
      .limit(limit);
    return rows.map(({ product, storeName, storeSlug }) => ({ ...product, storeName, storeSlug }) as CatalogProductCard);
  } catch (err) {
    console.warn("[cardQuery] Database unavailable, returning empty list:", err instanceof Error ? err.message : err);
    return [];
  }
}

export const getFeaturedProducts = unstable_cache(
  async (limit = 8) =>
    cardQuery(and(eq(products.isActive, true), eq(products.isFeatured, true), eq(stores.isActive, true)), "featured", limit),
  ["featured-products"],
  { revalidate: 600, tags: [CATALOG_TAG] },
);

export const getNewProducts = unstable_cache(
  async (limit = 8) => cardQuery(and(eq(products.isActive, true), eq(stores.isActive, true)), "new", limit),
  ["new-products"],
  { revalidate: 300, tags: [CATALOG_TAG] },
);

export type StoreCard = {
  id: string;
  storeName: string;
  slug: string;
  city: string | null;
  state: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  rating: number | null;
  totalSales: number;
  productCount: number;
};

export const getTopStores = unstable_cache(
  async (limit = 4): Promise<StoreCard[]> => {
    try {
      const rows = await db
        .select({
          store: stores,
          productCount: sql<number>`(select count(*) from products p where p.store_id = stores.id and p.is_active = true)::int`,
        })
        .from(stores)
        .where(eq(stores.isActive, true))
        .orderBy(desc(stores.rating), desc(stores.totalSales))
        .limit(limit);
      return rows.map(({ store, productCount }) => ({ ...store, productCount }));
    } catch (err) {
      console.warn("[getTopStores] Database unavailable, returning empty list:", err instanceof Error ? err.message : err);
      return [];
    }
  },
  ["top-stores"],
  { revalidate: 600, tags: [CATALOG_TAG, STORES_TAG] },
);

export const getCategoryParents = unstable_cache(
  async () => {
    try {
      return await db.select().from(categories).where(and(isNull(categories.parentId), eq(categories.isActive, true))).orderBy(categories.sortOrder);
    } catch (err) {
      console.warn("[getCategoryParents] Database unavailable, returning empty list:", err instanceof Error ? err.message : err);
      return [];
    }
  },
  ["category-parents"],
  { revalidate: 1800, tags: [CATALOG_TAG] },
);

/**
 * Call from Server Actions after catalogue mutations – Next 16's
 * read-your-own-writes invalidation (works without a cache profile).
 */
export async function invalidateCatalog() {
  const { updateTag } = await import("next/cache");
  updateTag(CATALOG_TAG);
  updateTag(STORES_TAG);
}
