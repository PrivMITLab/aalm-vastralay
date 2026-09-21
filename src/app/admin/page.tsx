import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { IndianRupee, Package, ShoppingCart, Store, Users } from "lucide-react";
import { db } from "@/db";
import { categories, coupons, orders, products, stores, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { toggleCoupon, toggleStoreActive, updateUserRole } from "@/actions/admin";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";
import { CategoryForm, CouponForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const admin = await requireRole(["admin"], "/admin");

  const [[stats], userRows, storeRows, couponRows, categoryRows, recentOrders] = await Promise.all([
    db
      .select({
        users: sql<number>`(select count(*) from users)::int`,
        sellers: sql<number>`(select count(*) from users where role = 'seller')::int`,
        stores: sql<number>`(select count(*) from stores)::int`,
        products: sql<number>`(select count(*) from products where is_active)::int`,
        orders: sql<number>`(select count(*) from orders)::int`,
        pending: sql<number>`(select count(*) from orders where status in ('pending','confirmed','processing'))::int`,
        gmv: sql<number>`(select coalesce(sum(total),0) from orders where status not in ('cancelled','returned'))::float`,
      })
      .from(sql`(select 1) as one`),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(50),
    db
      .select({ store: stores, ownerEmail: users.email, productCount: sql<number>`(select count(*) from products p where p.store_id = ${stores.id})::int` })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .orderBy(desc(stores.createdAt)),
    db.select().from(coupons).orderBy(desc(coupons.isActive), coupons.code),
    db.select().from(categories).orderBy(categories.sortOrder, categories.name),
    db
      .select({ order: orders, storeName: stores.storeName })
      .from(orders)
      .leftJoin(stores, eq(orders.storeId, stores.id))
      .orderBy(desc(orders.createdAt))
      .limit(8),
  ]);

  const parents = categoryRows.filter((c) => !c.parentId);
  const commissionRate = 0.025;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Admin</p>
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Marketplace control panel</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={<Users className="h-5 w-5" />} label="Users" value={String(stats.users)} sub={`${stats.sellers} sellers`} />
        <Stat icon={<Store className="h-5 w-5" />} label="Stores" value={String(stats.stores)} sub="registered" />
        <Stat icon={<Package className="h-5 w-5" />} label="Live products" value={String(stats.products)} sub="active listings" />
        <Stat icon={<ShoppingCart className="h-5 w-5" />} label="Orders" value={String(stats.orders)} sub={`${stats.pending} in progress`} />
        <Stat icon={<IndianRupee className="h-5 w-5" />} label="GMV" value={formatINR(stats.gmv)} sub={`≈ ${formatINR(stats.gmv * commissionRate)} at 2.5% post-launch`} />
      </div>

      <section className="card">
        <header className="border-b border-cream-200 px-5 py-3">
          <h2 className="font-semibold text-maroon-900">Recent orders</h2>
        </header>
        <ul className="divide-y divide-cream-200 text-sm">
          {recentOrders.map(({ order: o, storeName }) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
              <Link href={`/orders/${o.id}`} className="font-mono text-xs text-maroon-700 hover:underline">
                {o.orderNumber}
              </Link>
              <span className="text-slate-600">{storeName}</span>
              <span className="text-xs text-slate-500">{formatDate(o.createdAt)}</span>
              <span className={cn("badge capitalize", statusStyle(o.status))}>{o.status}</span>
              <span className="font-semibold">{formatINR(o.total)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <header className="border-b border-cream-200 px-5 py-3">
            <h2 className="font-semibold text-maroon-900">Users & roles</h2>
          </header>
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-cream-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {userRows.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2">
                      <p className="font-medium">{u.fullName ?? "—"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-2">
                      {u.id === admin.id ? (
                        <span className="badge bg-maroon-50 text-maroon-800">admin (you)</span>
                      ) : (
                        <form action={updateUserRole} className="flex items-center gap-1">
                          <input type="hidden" name="userId" value={u.id} />
                          <select name="role" defaultValue={u.role} className="input w-28 py-1 text-xs">
                            <option value="customer">customer</option>
                            <option value="seller">seller</option>
                            <option value="admin">admin</option>
                          </select>
                          <SubmitButton variant="ghost" className="btn-sm" pendingText="…">
                            Save
                          </SubmitButton>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{formatDate(u.createdAt).split(",")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card overflow-hidden">
          <header className="border-b border-cream-200 px-5 py-3">
            <h2 className="font-semibold text-maroon-900">Stores</h2>
          </header>
          <ul className="divide-y divide-cream-200 text-sm">
            {storeRows.map(({ store: s, ownerEmail, productCount }) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <Link href={`/stores/${s.slug}`} className="font-medium text-slate-900 hover:text-maroon-800">
                    {s.storeName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {ownerEmail} · {s.city} · {productCount} products · {s.totalSales} sales · {Number(s.rating ?? 0).toFixed(1)} ★
                  </p>
                </div>
                <form action={toggleStoreActive} className="flex items-center gap-2">
                  <input type="hidden" name="storeId" value={s.id} />
                  <span className={cn("badge", s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-100 text-rose-800")}>{s.isActive ? "Active" : "Suspended"}</span>
                  <SubmitButton variant="outline" className="btn-sm" pendingText="…">
                    {s.isActive ? "Suspend" : "Activate"}
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-maroon-900">Coupons</h2>
          <ul className="mt-3 divide-y divide-cream-200 text-sm">
            {couponRows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <span className="font-mono font-semibold">{c.code}</span>
                  <span className="ml-2 text-slate-600">
                    {c.discountType === "percentage" ? `${c.discountValue}% off` : `${formatINR(c.discountValue)} off`}
                    {c.minOrderValue > 0 && ` · min ${formatINR(c.minOrderValue)}`}
                    {c.maxDiscount != null && ` · max ${formatINR(c.maxDiscount)}`}
                  </span>
                  <p className="text-xs text-slate-500">
                    Used {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    {c.validUntil ? ` · until ${formatDate(c.validUntil).split(",")[0]}` : ""}
                  </p>
                </div>
                <form action={toggleCoupon}>
                  <input type="hidden" name="couponId" value={c.id} />
                  <SubmitButton variant={c.isActive ? "outline" : "gold"} className="btn-sm" pendingText="…">
                    {c.isActive ? "Disable" : "Enable"}
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-cream-200 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">New coupon</p>
            <CouponForm />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-maroon-900">Categories</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {parents.map((p) => (
              <li key={p.id} className="rounded-xl border border-cream-200 p-3">
                <p className="font-semibold text-maroon-900">{p.name}</p>
                <p className="text-xs text-slate-600">
                  {categoryRows
                    .filter((c) => c.parentId === p.id)
                    .map((c) => c.name)
                    .join(" · ") || "No sub-categories"}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-cream-200 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Add category</p>
            <CategoryForm parents={parents.map((p) => ({ id: p.id, name: p.name }))} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon-50 text-maroon-700">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold text-maroon-900">{value}</p>
        <p className="truncate text-xs text-slate-500">
          {label} · {sub}
        </p>
      </div>
    </div>
  );
}
