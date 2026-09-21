import Link from "next/link";
import type { Metadata } from "next";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { getHomeConfig, getSettingNumber } from "@/lib/settings";
import { cn, gridClass } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = { q?: string; category?: string; sort?: string; min?: string; max?: string; page?: string; store?: string };

const SORTS: [string, string][] = [
  ["relevance", "Popular"],
  ["newest", "Newest"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
  ["discount", "Biggest Discount"],
  ["rating", "Top Rated"],
];
const PRICE_BANDS: [string, string, string][] = [
  ["Under ₹2,000", "", "2000"],
  ["₹2,000 – ₹5,000", "2000", "5000"],
  ["₹5,000 – ₹10,000", "5000", "10000"],
  ["₹10,000 – ₹20,000", "10000", "20000"],
  ["Above ₹20,000", "20000", ""],
];

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.q) return { title: `"${sp.q}" – Search results` };
  if (sp.category) return { title: `${sp.category.replace(/-/g, " ")} – Shop ethnic wear` };
  return { title: "All Products – Wedding & Ethnic Wear" };
}

async function getSettingsDefaultSort() {
  const { getSetting } = await import("@/lib/settings");
  return getSetting("products.defaultSort", "relevance");
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [home, pageSize, defaultSort] = await Promise.all([
    getHomeConfig(),
    getSettingNumber("products.pageSize", 24),
    getSettingsDefaultSort(),
  ]);
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort ?? defaultSort;

  let allCats: typeof categories.$inferSelect[] = [];
  let rows: { product: typeof products.$inferSelect; storeName: string | null; storeSlug: string | null }[] = [];
  let count = 0;

  try {
    allCats = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.name);
    const parents = allCats.filter((c) => !c.parentId);
    const childrenOf = (id: string) => allCats.filter((c) => c.parentId === id);
    const selectedCat = sp.category ? allCats.find((c) => c.slug === sp.category) : undefined;
    const selectedParent = selectedCat?.parentId ? allCats.find((c) => c.id === selectedCat.parentId) : selectedCat;

    const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];
    if (selectedCat) {
      conditions.push(inArray(products.categoryId, [selectedCat.id, ...childrenOf(selectedCat.id).map((c) => c.id)]));
    }
    if (q) {
      conditions.push(
        or(
          sql`to_tsvector('english', ${products.title} || ' ' || coalesce(${products.description}, '')) @@ plainto_tsquery('english', ${q})`,
          ilike(products.title, `%${q}%`),
          sql`${q.toLowerCase()} = ANY(${products.tags})`,
          ilike(stores.storeName, `%${q}%`),
        )!,
      );
    }
    if (sp.min && !Number.isNaN(Number(sp.min))) conditions.push(gte(products.price, Number(sp.min)));
    if (sp.max && !Number.isNaN(Number(sp.max))) conditions.push(lte(products.price, Number(sp.max)));
    if (sp.store) conditions.push(eq(stores.slug, sp.store));
    const where = and(...conditions);

    const orderBy =
      sort === "price_asc"
        ? [asc(products.price)]
        : sort === "price_desc"
          ? [desc(products.price)]
          : sort === "discount"
            ? [desc(products.discountPercent)]
            : sort === "rating"
              ? [desc(products.rating), desc(products.totalReviews)]
              : sort === "newest"
                ? [desc(products.createdAt)]
                : [desc(products.isFeatured), desc(products.totalReviews), desc(products.createdAt)];

    const PAGE_SIZE = Math.max(6, Math.min(60, Math.round(pageSize || 24)));
    const [fetchedRows, [{ count: fetchedCount }]] = await Promise.all([
      db
        .select({ product: products, storeName: stores.storeName, storeSlug: stores.slug })
        .from(products)
        .innerJoin(stores, eq(products.storeId, stores.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .innerJoin(stores, eq(products.storeId, stores.id))
        .where(where),
    ]);
    rows = fetchedRows;
    count = fetchedCount;
  } catch (err) {
    console.warn("[ProductsPage] Database unavailable:", err instanceof Error ? err.message : err);
  }
  const PAGE_SIZE = Math.max(6, Math.min(60, Math.round(pageSize || 24)));
  const parents = allCats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => allCats.filter((c) => c.parentId === id);
  const selectedCat = sp.category ? allCats.find((c) => c.slug === sp.category) : undefined;
  const selectedParent = selectedCat?.parentId ? allCats.find((c) => c.id === selectedCat.parentId) : selectedCat;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const buildUrl = (overrides: Partial<SP>) => {
    const params = new URLSearchParams();
    const merged: SP = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, String(v));
    if (!overrides.page) params.delete("page");
    const s = params.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  const heading = q ? `Results for “${q}”` : selectedCat ? selectedCat.name : sp.store ? rows[0]?.storeName ?? "Store products" : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-maroon-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/products" className="hover:text-maroon-700">
          Products
        </Link>
        {selectedParent && selectedParent.id !== selectedCat?.id && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={buildUrl({ category: selectedParent.slug })} className="hover:text-maroon-700">
              {selectedParent.name}
            </Link>
          </>
        )}
        {selectedCat && (
          <>
            <span className="mx-1.5">/</span>
            <span className="text-slate-800">{selectedCat.name}</span>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-4 lg:sticky lg:top-40 lg:h-fit">
          <details className="card p-4 lg:[&>summary]:hidden" open>
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-maroon-900">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </summary>
            <div className="space-y-6 lg:mt-0">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-maroon-800">Categories</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href={buildUrl({ category: undefined })} className={cn("block rounded-lg px-2 py-1 hover:bg-cream-100", !selectedCat && "bg-cream-100 font-semibold text-maroon-800")}>
                      All
                    </Link>
                  </li>
                  {parents.map((p) => (
                    <li key={p.id}>
                      <Link href={buildUrl({ category: p.slug })} className={cn("block rounded-lg px-2 py-1 hover:bg-cream-100", selectedCat?.id === p.id && "bg-cream-100 font-semibold text-maroon-800")}>
                        {p.name}
                      </Link>
                      {(selectedParent?.id === p.id || !selectedCat) && (
                        <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-cream-200 pl-2">
                          {childrenOf(p.id).map((c) => (
                            <li key={c.id}>
                              <Link href={buildUrl({ category: c.slug })} className={cn("block rounded-lg px-2 py-0.5 text-slate-600 hover:bg-cream-100 hover:text-maroon-800", selectedCat?.id === c.id && "bg-cream-100 font-semibold text-maroon-800")}>
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-maroon-800">Price</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href={buildUrl({ min: undefined, max: undefined })} className={cn("block rounded-lg px-2 py-1 hover:bg-cream-100", !sp.min && !sp.max && "bg-cream-100 font-semibold text-maroon-800")}>
                      Any price
                    </Link>
                  </li>
                  {PRICE_BANDS.map(([label, min, max]) => (
                    <li key={label}>
                      <Link href={buildUrl({ min: min || undefined, max: max || undefined })} className={cn("block rounded-lg px-2 py-1 hover:bg-cream-100", (sp.min ?? "") === min && (sp.max ?? "") === max && "bg-cream-100 font-semibold text-maroon-800")}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {(q || sp.store || sp.min || sp.max || selectedCat) && (
                <Link href="/products" className="btn btn-outline btn-sm w-full">
                  Clear all filters
                </Link>
              )}
            </div>
          </details>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold capitalize text-maroon-900">{heading}</h1>
              <p className="text-sm text-slate-500">{count} products</p>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="mr-1 text-slate-500">Sort:</span>
              {SORTS.map(([key, label]) => (
                <Link key={key} href={buildUrl({ sort: key === "relevance" ? undefined : key })} className={cn("rounded-full border px-3 py-1", sort === key ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white hover:border-maroon-400")}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <SearchX className="h-10 w-10 text-maroon-300" />
              <p className="mt-3 font-display text-xl text-maroon-900">No products found</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search term or remove some filters.</p>
              <Link href="/products" className="btn btn-primary mt-5">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className={gridClass(home.grid, "gap-3 sm:gap-4")}>
              {rows.map(({ product, storeName, storeSlug }, i) => (
                <Reveal key={product.id} delay={(i % 4) * 40}>
                  <ProductCard product={{ ...product, storeName, storeSlug }} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              <Link aria-disabled={page <= 1} href={buildUrl({ page: String(page - 1) })} className={cn("btn btn-outline btn-sm", page <= 1 && "pointer-events-none opacity-40")}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Link>
              <span className="px-3 text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Link aria-disabled={page >= totalPages} href={buildUrl({ page: String(page + 1) })} className={cn("btn btn-outline btn-sm", page >= totalPages && "pointer-events-none opacity-40")}>
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
