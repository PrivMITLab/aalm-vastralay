import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { AlertTriangle, BadgePercent, IndianRupee, Package, PlusCircle, ShoppingCart, Star } from "lucide-react";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { commissionInfo, getSellerContext } from "@/lib/seller";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller Hub" };

export default async function SellerOverview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { store } = await getSellerContext();

  const [[productStats], [orderStats], recentOrders, lowStock] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where is_active)::int`,
      })
      .from(products)
      .where(eq(products.storeId, store.id)),
    db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where status in ('pending','confirmed','processing'))::int`,
        shipped: sql<number>`count(*) filter (where status = 'shipped')::int`,
        delivered: sql<number>`count(*) filter (where status = 'delivered')::int`,
        revenue: sql<number>`coalesce(sum(total) filter (where status not in ('cancelled','returned')), 0)::float`,
      })
      .from(orders)
      .where(eq(orders.storeId, store.id)),
    db.select().from(orders).where(eq(orders.storeId, store.id)).orderBy(desc(orders.createdAt)).limit(5),
    db
      .select({ id: products.id, title: products.title, stock: products.stock, slug: products.slug })
      .from(products)
      .where(and(eq(products.storeId, store.id), eq(products.isActive, true), lte(products.stock, 5)))
      .orderBy(products.stock)
      .limit(5),
  ]);

  const commission = await commissionInfo(store.createdAt);

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Your store is live! 🎉</p>
          <p>Add your first product to start receiving orders. Customers can already find your storefront.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon-900">Overview</h1>
          <p className="text-sm text-slate-600">Welcome back – here&apos;s how {store.storeName} is doing.</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-primary">
          <PlusCircle className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={formatINR(orderStats?.revenue ?? 0)} sub="excl. cancelled/returned" />
        <Stat icon={<ShoppingCart className="h-5 w-5" />} label="Orders" value={String(orderStats?.total ?? 0)} sub={`${orderStats?.pending ?? 0} need action`} highlight={(orderStats?.pending ?? 0) > 0} />
        <Stat icon={<Package className="h-5 w-5" />} label="Products" value={String(productStats?.total ?? 0)} sub={`${productStats?.active ?? 0} live`} />
        <Stat icon={<Star className="h-5 w-5" />} label="Store rating" value={Number(store.rating ?? 0).toFixed(1)} sub={`${store.totalSales} total sales`} />
      </div>

      <div className={cn("flex flex-wrap items-center gap-3 rounded-2xl border p-4 text-sm", commission.isFree ? "border-gold-300 bg-gold-100/40" : "border-cream-200 bg-white")}>
        <BadgePercent className="h-5 w-5 text-gold-600" />
        {commission.isFree ? (
          <p>
            <span className="font-semibold text-maroon-900">0% commission</span> on every order until <span className="font-semibold">{formatDate(commission.freeUntil).split(",")[0]}</span>. After that,
            a flat 2–3% per order.
          </p>
        ) : (
          <p>
            Platform fee: <span className="font-semibold">{commission.rate}%</span> per delivered order. You keep the rest. Every order here is settled in INR.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card">
          <header className="flex items-center justify-between border-b border-cream-200 px-5 py-3">
            <h2 className="font-semibold text-maroon-900">Recent orders</h2>
            <Link href="/seller/orders" className="text-sm font-semibold text-maroon-700 hover:underline">
              Manage orders
            </Link>
          </header>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No orders yet. Share your storefront link with customers!</p>
          ) : (
            <ul className="divide-y divide-cream-200">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-mono text-xs text-slate-500">{o.orderNumber}</p>
                    <p className="font-medium">{o.shippingAddress.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(o.createdAt)} · <span className="uppercase">{o.paymentMethod}</span>
                    </p>
                  </div>
                  <span className={cn("badge capitalize", statusStyle(o.status))}>{o.status}</span>
                  <span className="font-semibold">{formatINR(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <header className="flex items-center gap-2 border-b border-cream-200 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-maroon-900">Low stock</h2>
          </header>
          {lowStock.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-cream-200 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-2.5">
                  <Link href={`/seller/products/${p.id}/edit`} className="line-clamp-1 hover:text-maroon-800">
                    {p.title}
                  </Link>
                  <span className={cn("badge", p.stock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800")}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={cn("card flex items-center gap-4 p-4", highlight && "border-amber-300")}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-maroon-50 text-maroon-700">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-maroon-900">{value}</p>
        <p className="text-xs text-slate-500">
          {label} · {sub}
        </p>
      </div>
    </div>
  );
}
