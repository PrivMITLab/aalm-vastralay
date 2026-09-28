import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { ChevronRight, Search, SearchX, Sparkles, Tag } from "lucide-react";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import ProductCard from "@/components/ProductCard";
import { parseEthnicQueryDeterministic, type ParsedSearchIntent } from "@/lib/ai/search-parser";

export const revalidate = 300;

type SP = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  if (q) {
    return {
      title: `Search: "${q}" – Ethnic & Bridal Collection | Aalm Vastralay`,
      description: `Explore search results for "${q}" across authentic Banarasi sarees, bridal lehengas, sherwanis, and wedding accessories.`,
    };
  }
  return {
    title: "Search Indian Ethnic Wear | Aalm Vastralay",
    description: "Search across hundreds of handcrafted Banarasi sarees, bridal couture, sherwanis, and festive wear.",
  };
}

const POPULAR_SEARCHES = [
  "Banarasi Saree",
  "Bridal Lehenga",
  "Groom Sherwani",
  "Anarkali Suit",
  "Kundan Jewellery",
  "Silk Dupatta",
  "Haldi Yellow Kurta",
  "Velvet Lehenga",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const intent: ParsedSearchIntent | null = q ? parseEthnicQueryDeterministic(q) : null;
  const hasAiFilters = Boolean(
    intent && (intent.maxPrice || intent.minPrice || intent.occasion || intent.color || intent.fabric || intent.categorySlug)
  );

  let results: {
    product: typeof products.$inferSelect;
    storeName: string | null;
    storeSlug: string | null;
  }[] = [];

  if (q) {
    try {
      const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];

      if (intent?.maxPrice) {
        conditions.push(lte(products.price, intent.maxPrice));
      }
      if (intent?.minPrice) {
        conditions.push(gte(products.price, intent.minPrice));
      }

      const searchTerms = [
        ...(intent?.color ? [intent.color.toLowerCase()] : []),
        ...(intent?.fabric ? [intent.fabric.toLowerCase()] : []),
        ...(intent?.occasion ? [intent.occasion.toLowerCase()] : []),
        ...(intent?.categoryName ? [intent.categoryName.toLowerCase()] : []),
        ...(intent?.keywords ?? []).map((k) => k.toLowerCase()),
      ];

      if (searchTerms.length > 0) {
        const termOrs: SQL[] = [];
        for (const t of searchTerms.slice(0, 6)) {
          termOrs.push(
            ilike(products.title, `%${t}%`),
            ilike(products.description, `%${t}%`),
            sql`${t} = ANY(${products.tags})`
          );
        }
        conditions.push(or(...termOrs)!);
      } else {
        conditions.push(
          or(
            ilike(products.title, `%${q}%`),
            ilike(products.description, `%${q}%`),
            sql`${q.toLowerCase()} = ANY(${products.tags})`
          )!
        );
      }

      results = await db
        .select({
          product: products,
          storeName: stores.storeName,
          storeSlug: stores.slug,
        })
        .from(products)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(48);

      // Fallback if 0 results were found
      if (results.length === 0) {
        results = await db
          .select({
            product: products,
            storeName: stores.storeName,
            storeSlug: stores.slug,
          })
          .from(products)
          .leftJoin(stores, eq(products.storeId, stores.id))
          .where(and(eq(products.isActive, true), eq(stores.isActive, true), or(ilike(products.title, `%${q}%`), ilike(products.description, `%${q}%`))))
          .orderBy(desc(products.isFeatured), desc(products.createdAt))
          .limit(48);
      }
    } catch (err) {
      console.warn("[SearchPage] Search query error:", err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Search</span>
        {q && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[color:var(--brand)] font-semibold truncate max-w-[200px]">
              &quot;{q}&quot;
            </span>
          </>
        )}
      </nav>

      {/* Search Header Banner */}
      <header className="mb-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)] mb-2">
              <Search className="h-3.5 w-3.5" /> Marketplace Search
            </span>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl text-[color:var(--brand)]">
              {q ? (
                <>
                  Results for &ldquo;<span className="text-[color:var(--accent)]">{q}</span>&rdquo;
                </>
              ) : (
                "Search Ethnic Wear & Bridal Couture"
              )}
            </h1>
            <p className="text-xs text-[color:var(--text-soft)] mt-1">
              {q
                ? `Found ${results.length} authentic products matching your criteria.`
                : "Type keywords or select a popular ethnic search term below."}
            </p>

            {/* Smart AI Filter Intent Chips */}
            {hasAiFilters && intent && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                  <Sparkles className="h-3 w-3" /> AI Filters:
                </span>
                {intent.occasion && (
                  <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] text-[color:var(--text)]">
                    🎉 {intent.occasion}
                  </span>
                )}
                {intent.categoryName && (
                  <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] text-[color:var(--text)]">
                    👗 {intent.categoryName}
                  </span>
                )}
                {intent.color && (
                  <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] text-[color:var(--text)]">
                    🎨 {intent.color}
                  </span>
                )}
                {intent.fabric && (
                  <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] text-[color:var(--text)]">
                    🧵 {intent.fabric}
                  </span>
                )}
                {intent.maxPrice && (
                  <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    💰 Max: ₹{intent.maxPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search form in page */}
          <form action="/search" method="GET" className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search sarees, lehengas, sherwanis..."
                className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2.5 text-xs text-[color:var(--text)] placeholder-[color:var(--text-soft)] focus:border-[color:var(--brand)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-gold px-4 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </form>
        </div>

        {/* Popular Searches */}
        <div className="mt-6 pt-5 border-t border-[color:var(--border)] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-soft)] flex items-center gap-1">
            <Tag className="h-3 w-3" /> Trending:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2.5 py-1 text-xs text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </header>

      {/* Results or Empty State */}
      {!q ? (
        <div className="card text-center py-16 px-4 space-y-4 max-w-lg mx-auto border border-dashed border-[color:var(--border)]">
          <Sparkles className="h-10 w-10 text-[color:var(--accent)] mx-auto opacity-70" />
          <h2 className="font-display text-xl font-bold">Discover Handcrafted Luxury</h2>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            Enter a style, fabric, or occasion above to explore our artisan-direct collections, or browse our curated categories.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/categories"
              className="rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--border)] px-4 py-2 text-xs font-bold hover:bg-[color:var(--border)]"
            >
              Browse Categories
            </Link>
            <Link
              href="/products"
              className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-md"
            >
              All Products
            </Link>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center py-16 px-4 space-y-4 max-w-lg mx-auto border border-dashed border-[color:var(--border)]">
          <SearchX className="h-10 w-10 text-[color:var(--text-soft)] mx-auto" />
          <h2 className="font-display text-xl font-bold">No exact matches found</h2>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            We couldn&apos;t find any products matching &ldquo;{q}&rdquo;. Try checking your spelling or using broader search terms like &quot;Saree&quot;, &quot;Lehenga&quot;, or &quot;Sherwani&quot;.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/products"
              className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-md"
            >
              Browse All Products
            </Link>
            <Link
              href="/categories"
              className="rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--border)] px-4 py-2 text-xs font-bold hover:bg-[color:var(--border)]"
            >
              View Categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {results.map(({ product, storeName, storeSlug }) => (
            <ProductCard
              key={product.id}
              product={{ ...product, storeName, storeSlug }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
