import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ChevronRight, Filter, Sparkles } from "lucide-react";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!cat) {
    return { title: "Category Not Found – Aalm Vastralay" };
  }

  return {
    title: `${cat.name} – Handcrafted Ethnic Collection | Aalm Vastralay`,
    description: `Shop authentic ${cat.name} online at Aalm Vastralay. Direct artisan prices, bridal curation, Cash on Delivery, and pan-India shipping.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  let allCats: (typeof categories.$inferSelect)[] = [];
  try {
    allCats = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true));
  } catch (err) {
    console.warn("[CategoryDetailPage] DB error fetching categories:", err);
  }

  const currentCat = allCats.find((c) => c.slug === slug);
  if (!currentCat) {
    notFound();
  }

  // Find parent or children
  const isParent = !currentCat.parentId;
  const parentCat = currentCat.parentId
    ? allCats.find((c) => c.id === currentCat.parentId)
    : null;
  const subcategories = allCats.filter((c) => c.parentId === currentCat.id);
  const siblingSubcategories = parentCat
    ? allCats.filter((c) => c.parentId === parentCat.id)
    : [];

  const targetCategoryIds = isParent
    ? [currentCat.id, ...subcategories.map((c) => c.id)]
    : [currentCat.id];

  let catProducts: {
    product: typeof products.$inferSelect;
    storeName: string | null;
    storeSlug: string | null;
  }[] = [];

  try {
    const rows = await db
      .select({
        product: products,
        storeName: stores.storeName,
        storeSlug: stores.slug,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .where(
        and(
          eq(products.isActive, true),
          inArray(products.categoryId, targetCategoryIds)
        )
      )
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(48);

    catProducts = rows;
  } catch (err) {
    console.warn("[CategoryDetailPage] DB error fetching products:", err);
  }

  const chips = isParent ? subcategories : siblingSubcategories;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/categories" className="hover:text-[color:var(--brand)]">
          Categories
        </Link>
        {parentCat && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/categories/${parentCat.slug}`}
              className="hover:text-[color:var(--brand)]"
            >
              {parentCat.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">
          {currentCat.name}
        </span>
      </nav>

      {/* Hero Header */}
      <header className="mb-8 rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[color:var(--brand)]/10 via-[color:var(--surface)] to-[color:var(--accent)]/10 p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
              <Sparkles className="h-3.5 w-3.5 fill-[color:var(--accent)]" />{" "}
              {parentCat ? parentCat.name : "Category Showcase"}
            </span>
            <h1 className="font-display text-2xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
              {currentCat.name}
            </h1>
            <p className="text-sm text-[color:var(--text-soft)]">
              Showing {catProducts.length} curated designs in {currentCat.name}. Handpicked bridal and festive collections.
            </p>
          </div>

          <Link
            href={`/products?category=${currentCat.slug}`}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--border)] px-4 py-2.5 text-xs font-bold hover:border-[color:var(--accent)] transition-colors shadow-sm"
          >
            <Filter className="h-4 w-4 text-[color:var(--accent)]" /> Advanced Filters
          </Link>
        </div>

        {/* Subcategory Chips */}
        {chips.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[color:var(--border)] flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-soft)] self-center mr-1">
              Explore Sub-collections:
            </span>
            {isParent && (
              <span className="rounded-lg bg-[color:var(--brand)] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                All {currentCat.name}
              </span>
            )}
            {chips.map((chip) => {
              const isActive = chip.slug === currentCat.slug;
              return (
                <Link
                  key={chip.id}
                  href={`/categories/${chip.slug}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[color:var(--brand)] text-white shadow-sm"
                      : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  {chip.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Products Grid */}
      {catProducts.length === 0 ? (
        <div className="card my-12 text-center py-16 px-4 space-y-4 max-w-lg mx-auto border border-dashed border-[color:var(--border)]">
          <Sparkles className="h-10 w-10 text-[color:var(--accent)] mx-auto opacity-70" />
          <h2 className="font-display text-xl font-bold">New Designs Coming Soon</h2>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            Our master artisans in Varanasi & Surat are crafting new additions for the {currentCat.name} collection. In the meantime, browse our other categories or check back soon!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/categories"
              className="rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--border)] px-4 py-2 text-xs font-bold hover:bg-[color:var(--border)]"
            >
              All Categories
            </Link>
            <Link
              href="/products"
              className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-md"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {catProducts.map(({ product, storeName, storeSlug }) => (
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
