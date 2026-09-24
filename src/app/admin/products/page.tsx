import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ilike, or } from "drizzle-orm";
import { CheckCircle2, ExternalLink, Package, Search, Star, XCircle } from "lucide-react";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { toggleProductActive, toggleProductFeatured } from "@/actions/admin";
import { formatINR } from "@/lib/utils";
import { resolveImage } from "@/lib/media-resolver";

export const metadata: Metadata = { title: "Product Catalog – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let productList: {
    product: typeof products.$inferSelect;
    storeName: string | null;
    categoryName: string | null;
  }[] = [];

  try {
    const baseQuery = db
      .select({
        product: products,
        storeName: stores.storeName,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (q) {
      productList = await baseQuery
        .where(
          or(
            ilike(products.title, `%${q}%`),
            ilike(products.slug, `%${q}%`),
            ilike(products.sku, `%${q}%`),
            ilike(stores.storeName, `%${q}%`),
          ),
        )
        .orderBy(desc(products.createdAt))
        .limit(100);
    } else {
      productList = await baseQuery.orderBy(desc(products.createdAt)).limit(100);
    }
  } catch (err) {
    console.warn("[AdminProducts] DB error:", err instanceof Error ? err.message : err);
  }

  const activeCount = productList.filter((p) => p.product.isActive).length;
  const featuredCount = productList.filter((p) => p.product.isFeatured).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Product Catalog</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Manage marketplace listings, feature wedding collections, and moderate stock.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Total Listings</p>
          <p className="mt-2 font-display text-2xl font-bold text-[color:var(--brand)]">{productList.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Active Listings</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Featured</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{featuredCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <form method="get" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-soft)]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products by title, SKU, or seller..."
              className="input w-full pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary text-xs">
            Search
          </button>
          {q && (
            <a href="/admin/products" className="btn btn-outline text-xs">
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {productList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Package className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No products found</p>
            <p className="text-xs text-[color:var(--text-soft)]">No products match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price & Stock</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {productList.map(({ product, storeName, categoryName }) => {
                  const thumb = product.images?.[0] ? resolveImage(product.images[0]) : "/brand/logo-mark.svg";

                  return (
                    <tr key={product.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover border border-[color:var(--border)] bg-[color:var(--surface-2)]"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-[color:var(--text)] line-clamp-1">{product.title}</div>
                            <div className="flex items-center gap-2 text-xs text-[color:var(--text-soft)]">
                              <span className="font-mono">SKU: {product.sku ?? "—"}</span>
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-0.5 text-[color:var(--brand)] hover:underline"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                        {categoryName ?? "Uncategorized"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[color:var(--text)]">{formatINR(product.price)}</div>
                        <div className="text-xs text-[color:var(--text-soft)]">
                          Stock: <span className={product.stock <= 5 ? "font-bold text-rose-600" : ""}>{product.stock}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                        {storeName ?? "Platform"}
                      </td>
                      <td className="px-4 py-3">
                        <form action={toggleProductFeatured} className="inline-block">
                          <input type="hidden" name="productId" value={product.id} />
                          <button
                            type="submit"
                            title="Toggle featured status"
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                              product.isFeatured
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <Star className={`h-3 w-3 ${product.isFeatured ? "fill-amber-600 text-amber-600" : ""}`} />
                            {product.isFeatured ? "Featured" : "Standard"}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            product.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {product.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {product.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={toggleProductActive} className="inline-block">
                          <input type="hidden" name="productId" value={product.id} />
                          <button
                            type="submit"
                            className={`btn py-1 px-2.5 text-xs ${
                              product.isActive
                                ? "btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                                : "btn-primary bg-emerald-700 hover:bg-emerald-800 text-white"
                            }`}
                          >
                            {product.isActive ? "Hide" : "Publish"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
