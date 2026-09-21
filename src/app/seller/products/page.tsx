import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { Eye, EyeOff, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getSellerContext } from "@/lib/seller";
import { deleteProduct, toggleProductActive } from "@/actions/seller";
import { resolveThumbnail } from "@/lib/media-resolver";
import { cn, formatINR } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";

export const metadata: Metadata = { title: "My Products" };

export default async function SellerProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { store } = await getSellerContext();
  const rows = await db
    .select({
      product: products,
      categoryName: categories.name,
      variantCount: sql<number>`(select count(*) from product_variants v where v.product_id = ${products.id})::int`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.storeId, store.id))
    .orderBy(desc(products.updatedAt));

  return (
    <div className="space-y-5">
      {saved && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Product saved successfully.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon-900">Products</h1>
          <p className="text-sm text-slate-600">{rows.length} listings</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-primary">
          <PlusCircle className="h-4 w-4" /> Add product
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-xl text-maroon-900">No products yet</p>
          <p className="mt-1 text-sm text-slate-500">Add your first lehenga, saree or sherwani – it takes 2 minutes.</p>
          <Link href="/seller/products/new" className="btn btn-primary mt-5">
            Add product
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {rows.map(({ product: p, categoryName, variantCount }) => (
                <tr key={p.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveThumbnail(p.images[0])} alt="" className="h-14 w-11 rounded-lg object-cover" />
                      <div>
                        <Link href={`/products/${p.slug}`} className="line-clamp-2 font-medium text-slate-800 hover:text-maroon-800">
                          {p.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {p.sku ?? "no SKU"} · {variantCount} variants{p.isFeatured ? " · Featured" : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatINR(p.price)}</p>
                    {(p.mrp ?? 0) > p.price && <p className="text-xs text-slate-400 line-through">{formatINR(p.mrp)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", p.stock === 0 ? "bg-rose-100 text-rose-800" : p.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700")}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {Number(p.rating ?? 0) > 0 ? `${Number(p.rating).toFixed(1)} ★ (${p.totalReviews})` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{p.isActive ? "Live" : "Hidden"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/seller/products/${p.id}/edit`} className="btn btn-ghost btn-sm" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="productId" value={p.id} />
                        <SubmitButton variant="ghost" className="btn-sm" pendingText="…">
                          {p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </SubmitButton>
                      </form>
                      <form action={deleteProduct}>
                        <input type="hidden" name="productId" value={p.id} />
                        <SubmitButton variant="ghost" className="btn-sm text-rose-700" pendingText="…">
                          <Trash2 className="h-4 w-4" />
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
