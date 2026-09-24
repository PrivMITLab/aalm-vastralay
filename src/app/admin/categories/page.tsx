import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { CheckCircle2, FolderTree, Plus, XCircle } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { createCategoryDirect, toggleCategoryActive } from "@/actions/admin";

export const metadata: Metadata = { title: "Category Hierarchy – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let allCats: typeof categories.$inferSelect[] = [];
  let productCounts: Record<string, number> = {};

  try {
    allCats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    const countRows = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.categoryId);

    for (const row of countRows) {
      if (row.categoryId) {
        productCounts[row.categoryId] = row.count;
      }
    }
  } catch (err) {
    console.warn("[AdminCategories] DB error:", err instanceof Error ? err.message : err);
  }

  const parents = allCats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => allCats.filter((c) => c.parentId === id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Category Management</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Manage ethnic wear catalog taxonomies, parent-child hierarchies, and navigation order.
          </p>
        </div>
      </header>

      {/* Add Category Form */}
      <div className="card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--accent)] mb-3">
          Add New Ethnic Category
        </h2>
        <form action={createCategoryDirect} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Category Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Silk Dupattas"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Parent Category</label>
            <select
              name="parentId"
              className="input w-full text-sm bg-[color:var(--surface)]"
            >
              <option value="">None (Top-Level Parent)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn btn-primary w-full text-sm flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Categories Hierarchy List */}
      <div className="card overflow-hidden">
        <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--text-soft)]">
          Catalog Taxonomies ({allCats.length} total)
        </div>

        {allCats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FolderTree className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border)]">
            {parents.map((parent) => {
              const children = childrenOf(parent.id);
              const parentProducts = productCounts[parent.id] ?? 0;

              return (
                <div key={parent.id} className="p-4 hover:bg-[color:var(--surface-2)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-[color:var(--accent)]" />
                      <div>
                        <span className="font-semibold text-[color:var(--text)]">{parent.name}</span>
                        <span className="ml-2 font-mono text-xs text-[color:var(--text-soft)]">/{parent.slug}</span>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {parentProducts} products
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          parent.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {parent.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {parent.isActive ? "Active" : "Disabled"}
                      </span>

                      <form action={toggleCategoryActive}>
                        <input type="hidden" name="categoryId" value={parent.id} />
                        <button
                          type="submit"
                          className="btn btn-outline py-1 px-2.5 text-xs"
                        >
                          {parent.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {children.length > 0 && (
                    <div className="mt-3 ml-6 space-y-2 border-l-2 border-[color:var(--accent)]/30 pl-4">
                      {children.map((child) => {
                        const childProducts = productCounts[child.id] ?? 0;

                        return (
                          <div
                            key={child.id}
                            className="flex items-center justify-between text-xs py-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[color:var(--text)] font-medium">{child.name}</span>
                              <span className="font-mono text-[11px] text-[color:var(--text-soft)]">
                                /{child.slug}
                              </span>
                              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                                {childProducts} products
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                                  child.isActive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                                }`}
                              >
                                {child.isActive ? "Active" : "Disabled"}
                              </span>

                              <form action={toggleCategoryActive}>
                                <input type="hidden" name="categoryId" value={child.id} />
                                <button
                                  type="submit"
                                  className="text-[11px] text-[color:var(--brand)] hover:underline"
                                >
                                  {child.isActive ? "Disable" : "Enable"}
                                </button>
                              </form>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
