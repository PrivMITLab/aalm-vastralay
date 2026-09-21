import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, sql } from "drizzle-orm";
import { MapPin, Phone } from "lucide-react";
import { db } from "@/db";
import { orders, ORDER_STATUSES } from "@/db/schema";
import { getSellerContext } from "@/lib/seller";
import { updateOrderStatus } from "@/actions/seller";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";

export const metadata: Metadata = { title: "Seller Orders" };

const COURIERS = ["Delhivery", "Bluedart", "DTDC", "Ekart", "XpressBees", "India Post", "Self-ship"];

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { store } = await getSellerContext();
  const filter = status && (ORDER_STATUSES as readonly string[]).includes(status) ? status : undefined;

  const rows = await db
    .select({
      order: orders,
      items: sql<string>`(select string_agg(p.title || ' × ' || oi.quantity || coalesce(' (' || nullif(concat_ws(' / ', v.size, v.color), '') || ')', ''), '; ')
        from order_items oi join products p on p.id = oi.product_id left join product_variants v on v.id = oi.variant_id where oi.order_id = orders.id)`,
    })
    .from(orders)
    .where(filter ? and(eq(orders.storeId, store.id), eq(orders.status, filter)) : eq(orders.storeId, store.id))
    .orderBy(desc(orders.createdAt));

  const counts = await db
    .select({ status: orders.status, n: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.storeId, store.id))
    .groupBy(orders.status);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Orders</h1>
        <p className="text-sm text-slate-600">Confirm, pack and ship – customers are notified at every step.</p>
      </div>

      <div className="flex flex-wrap gap-1 text-xs">
        <Link href="/seller/orders" className={cn("rounded-full border px-3 py-1", !filter ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white")}>
          All ({counts.reduce((s, c) => s + c.n, 0)})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/seller/orders?status=${s}`} className={cn("rounded-full border px-3 py-1 capitalize", filter === s ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white")}>
            {s} ({countOf(s)})
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-500">No orders here yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ order: o, items }) => {
            const a = o.shippingAddress;
            const closed = o.status === "cancelled" || o.status === "returned";
            return (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-maroon-900">{o.orderNumber}</span>
                      <span className={cn("badge capitalize", statusStyle(o.status))}>{o.status}</span>
                      <span className="badge bg-cream-100 uppercase text-maroon-800">
                        {o.paymentMethod} · {o.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Placed {formatDate(o.createdAt)}</p>
                  </div>
                  <p className="text-lg font-bold text-maroon-900">{formatINR(o.total)}</p>
                </div>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">Items</p>
                    <p className="text-slate-600">{items}</p>
                    {o.notes && <p className="mt-1 text-xs text-slate-500">Note: {o.notes}</p>}
                  </div>
                  <div className="text-sm">
                    <p className="flex items-center gap-1 font-semibold text-slate-800">
                      <MapPin className="h-3.5 w-3.5" /> Ship to
                    </p>
                    <p className="text-slate-600">
                      {a.fullName}, {a.addressLine}
                      {a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} – {a.pincode}
                    </p>
                    <p className="flex items-center gap-1 text-slate-600">
                      <Phone className="h-3 w-3" /> {a.phone}
                    </p>
                  </div>
                </div>

                {!closed && (
                  <form action={updateOrderStatus} className="mt-4 grid gap-2 rounded-2xl bg-cream-50 p-3 sm:grid-cols-[160px_1fr_1fr_auto]">
                    <input type="hidden" name="orderId" value={o.id} />
                    <select name="status" className="input py-2" defaultValue={o.status}>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                    <select name="courier" className="input py-2" defaultValue={o.courier ?? ""}>
                      <option value="">Courier</option>
                      {COURIERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input name="trackingNumber" className="input py-2" defaultValue={o.trackingNumber ?? ""} placeholder="Tracking / AWB number" />
                    <SubmitButton className="btn-sm" pendingText="Updating…">
                      Update
                    </SubmitButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
