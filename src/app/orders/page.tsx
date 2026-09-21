import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { CheckCircle2, ChevronRight, Package } from "lucide-react";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const { placed } = await searchParams;
  const user = await requireUser("/orders");
  const rows = await db
    .select({
      order: orders,
      storeName: stores.storeName,
      storeSlug: stores.slug,
      itemCount: sql<number>`(select coalesce(sum(oi.quantity),0) from order_items oi where oi.order_id = ${orders.id})::int`,
      titles: sql<string>`(select string_agg(p.title, ' · ') from order_items oi join products p on p.id = oi.product_id where oi.order_id = ${orders.id})`,
      thumb: sql<string | null>`(select p.images->>0 from order_items oi join products p on p.id = oi.product_id where oi.order_id = ${orders.id} limit 1)`,
    })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .where(eq(orders.customerId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {placed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Order placed successfully!</p>
            <p className="text-sm text-emerald-800">
              Order {placed.split(",").length > 1 ? "numbers" : "number"} <span className="font-mono font-semibold">{placed.split(",").join(", ")}</span>. A confirmation email is on
              its way.
            </p>
          </div>
        </div>
      )}

      <h1 className="font-display text-3xl font-semibold text-maroon-900">My Orders</h1>
      <p className="text-sm text-slate-600">{rows.length} orders</p>

      {rows.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center p-12 text-center">
          <Package className="h-10 w-10 text-maroon-300" />
          <p className="mt-3 font-display text-xl text-maroon-900">No orders yet</p>
          <Link href="/products" className="btn btn-primary mt-5">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map(({ order, storeName, itemCount, titles, thumb }) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb && thumb.startsWith("/") ? thumb : thumb ? `https://wsrv.nl/?url=${encodeURIComponent(thumb)}&w=200` : "/images/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{order.orderNumber}</span>
                    <span className={cn("badge capitalize", statusStyle(order.status))}>{order.status}</span>
                    <span className="badge bg-cream-100 uppercase text-maroon-800">{order.paymentMethod}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-800">{titles}</p>
                  <p className="text-xs text-slate-500">
                    {itemCount} item{itemCount === 1 ? "" : "s"} · {storeName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-maroon-900">{formatINR(order.total)}</p>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
