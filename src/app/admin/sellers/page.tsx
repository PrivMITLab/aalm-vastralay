import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ilike, or } from "drizzle-orm";
import { CheckCircle2, ExternalLink, MapPin, Search, ShieldX, Store } from "lucide-react";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { toggleStoreActive } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller Management – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let storeList: {
    store: typeof stores.$inferSelect;
    ownerEmail: string | null;
    ownerName: string | null;
  }[] = [];

  try {
    const baseQuery = db
      .select({
        store: stores,
        ownerEmail: users.email,
        ownerName: users.fullName,
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id));

    if (q) {
      storeList = await baseQuery
        .where(
          or(
            ilike(stores.storeName, `%${q}%`),
            ilike(stores.slug, `%${q}%`),
            ilike(stores.city, `%${q}%`),
            ilike(stores.state, `%${q}%`),
            ilike(users.email, `%${q}%`),
          ),
        )
        .orderBy(desc(stores.createdAt))
        .limit(100);
    } else {
      storeList = await baseQuery.orderBy(desc(stores.createdAt)).limit(100);
    }
  } catch (err) {
    console.warn("[AdminSellers] DB error:", err instanceof Error ? err.message : err);
  }

  const activeCount = storeList.filter((s) => s.store.isActive).length;
  const suspendedCount = storeList.filter((s) => !s.store.isActive).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Seller Management</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Review, verify, and moderate multi-vendor stores and artisan boutiques.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Total Stores</p>
          <p className="mt-2 font-display text-2xl font-bold text-[color:var(--brand)]">{storeList.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Active Stores</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Suspended</p>
          <p className="mt-2 font-display text-2xl font-bold text-rose-700">{suspendedCount}</p>
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
              placeholder="Search stores by name, location, or owner email..."
              className="input w-full pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary text-xs">
            Search
          </button>
          {q && (
            <a href="/admin/sellers" className="btn btn-outline text-xs">
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Stores Table */}
      <div className="card overflow-hidden">
        {storeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Store className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No stores found</p>
            <p className="text-xs text-[color:var(--text-soft)]">No vendor stores match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Location & GSTIN</th>
                  <th className="px-4 py-3">Sales & Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {storeList.map(({ store, ownerEmail, ownerName }) => (
                  <tr key={store.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-[color:var(--text)]">{store.storeName}</div>
                          <div className="font-mono text-xs text-[color:var(--text-soft)]">/stores/{store.slug}</div>
                        </div>
                        <Link
                          href={`/stores/${store.slug}`}
                          target="_blank"
                          className="text-[color:var(--text-soft)] hover:text-[color:var(--brand)]"
                          title="View storefront"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-[color:var(--text)]">{ownerName ?? "Vendor"}</div>
                      <div className="text-xs text-[color:var(--text-soft)]">{ownerEmail ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-[color:var(--text-soft)]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{store.city ? `${store.city}, ${store.state ?? "India"}` : "India"}</span>
                      </div>
                      <div className="font-mono text-[11px] text-[color:var(--text-soft)]">
                        GST: {store.gstNumber ?? "Unregistered"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-[color:var(--text)]">{store.totalSales} orders</div>
                      <div className="text-xs text-amber-600">★ {Number(store.rating || 0).toFixed(1)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          store.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {store.isActive ? <CheckCircle2 className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                        {store.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={toggleStoreActive} className="inline-block">
                        <input type="hidden" name="storeId" value={store.id} />
                        <button
                          type="submit"
                          className={`btn py-1 px-2.5 text-xs ${
                            store.isActive
                              ? "btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                              : "btn-primary bg-emerald-700 hover:bg-emerald-800 text-white"
                          }`}
                        >
                          {store.isActive ? "Suspend Store" : "Activate Store"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
