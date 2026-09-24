import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { ArrowRight, ChevronRight, FolderTree, Sparkles } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { resolveImage } from "@/lib/media-resolver";

export const metadata: Metadata = {
  title: "All Categories – Indian Ethnic Wear | Aalm Vastralay",
  description: "Browse authentic Banarasi sarees, bridal lehengas, groom sherwanis, festive kurtas and accessories at Aalm Vastralay.",
};

export const dynamic = "force-static";
export const revalidate = 3600;

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  women: "/images/bridal-lehenga.jpg",
  men: "/images/sherwani.jpg",
  kids: "/images/kids-lehenga.jpg",
  accessories: "/images/dupatta-jewellery.jpg",
  sarees: "/images/bridal-lehenga.jpg",
  lehengas: "/images/bridal-lehenga.jpg",
  sherwanis: "/images/sherwani.jpg",
};

export default async function CategoriesPage() {
  let allCats: (typeof categories.$inferSelect)[] = [];
  let productCounts: Record<string, number> = {};

  try {
    allCats = await db
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

    for (const row of countRows) {
      if (row.categoryId) productCounts[row.categoryId] = row.count;
    }
  } catch (err) {
    console.warn("[CategoriesPage] DB error:", err instanceof Error ? err.message : err);
  }

  const parents = allCats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => allCats.filter((c) => c.parentId === id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Categories</span>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <Sparkles className="h-3.5 w-3.5 fill-[color:var(--accent)]" /> Complete Ethnic Catalog
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl text-[color:var(--brand)]">
          Shop by Ethnic Category
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Explore handcrafted Banarasi sarees, heritage bridal lehengas, regal sherwanis, and festive wedding ensembles.
        </p>
      </header>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parents.map((parent) => {
          const children = childrenOf(parent.id);
          const totalProducts = (productCounts[parent.id] ?? 0) +
            children.reduce((acc, ch) => acc + (productCounts[ch.id] ?? 0), 0);
          const imgSrc = parent.iconUrl || DEFAULT_CATEGORY_IMAGES[parent.slug] || "/images/hero.jpg";

          return (
            <div
              key={parent.id}
              className="card group overflow-hidden border border-[color:var(--border)] hover:border-[color:var(--accent)]/50 transition-all duration-300 hover:shadow-xl"
            >
              {/* Category Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(imgSrc)}
                  alt={parent.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h2 className="font-display text-xl font-bold">{parent.name}</h2>
                    <p className="text-xs text-amber-200">{totalProducts} Products listed</p>
                  </div>
                  <Link
                    href={`/categories/${parent.slug}`}
                    className="rounded-full bg-[color:var(--accent)] p-2 text-slate-950 hover:scale-110 transition-transform shadow-md"
                    title={`View ${parent.name}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Subcategories list */}
              <div className="p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-soft)]">
                  Sub-collections:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/categories/${parent.slug}`}
                    className="rounded-lg bg-[color:var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--accent)]/20 transition-colors"
                  >
                    All {parent.name}
                  </Link>
                  {children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/categories/${child.slug}`}
                      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1 text-xs text-[color:var(--text-muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] transition-colors"
                    >
                      {child.name} ({productCounts[child.id] ?? 0})
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
