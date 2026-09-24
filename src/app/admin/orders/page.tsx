import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ilike, or } from "drizzle-orm";
import { Eye, PackageCheck, Search, Truck } from "lucide-react";
import { db } from "@/db";
import { orders, stores, users } from "@/db/schema";
import { updateAdminOrderStatus } from "@/actions/admin";
import { formatDate, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Management – Admin Console" };
export const dynamic = "force-dynamic";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status ?? "all";
  const q = (sp.q ?? "").trim();

  let orderList: {
    order: typeof orders.$inferSelect;
    customerName: string | null;
    customerEmail: string | null;
    storeName: string | null;
  }[] = [];

  try {
    const baseQuery = db
      .select({
        order: orders,
        customerName: users.fullName,
        customerEmail: users.email,
        storeName: stores.storeName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(stores, eq(orders.storeId, stores.id));

    if (q) {
      orderList = await baseQuery
        .where(
          or(
            ilike(orders.orderNumber, `%${q}%`),
            ilike(users.fullName, `%${q}%`),
            ilike(users.email, `%${q}%`),
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(100);
    } else if (statusFilter !== "all") {
      orderList = await baseQuery
        .where(eq(orders.status, statusFilter))
        .orderBy(desc(orders.createdAt))
        .limit(100);
    } else {
      orderList = await baseQuery.orderBy(desc(orders.createdAt)).limit(100);
    }
  } catch (err) {
    console.warn("[AdminOrders] DB error:", err instanceof Error ? err.message : err);
  }

  const counts = {
    total: orderList.length,
    pending: orderList.filter((o) => o.order.status === "pending").length,
    shipped: orderList.filter((o) => o.order.status === "shipped").length,
    delivered: orderList.filter((o) => o.order.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Order Management</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Monitor shipments, update fulfillment statuses, and inspect transactions across all stores.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Total Orders</p>
          <p className="mt-2 font-display text-2xl font-bold text-[color:var(--brand)]">{counts.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Pending</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">In Transit</p>
          <p className="mt-2 font-display text-2xl font-bold text-sky-600">{counts.shipped}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Delivered</p>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-700">{counts.delivered}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-[color:var(--text-soft)] mr-1">Status:</span>
          {STATUSES.map((st) => (
            <Link
              key={st}
              href={`/admin/orders${st === "all" ? "" : `?status=${st}`}`}
              className={`rounded-full px-3 py-1 font-medium capitalize transition ${
                statusFilter === st
                  ? "bg-[color:var(--brand)] text-white"
                  : "bg-[color:var(--surface-2)] text-[color:var(--text-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        <form method="get" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-soft)]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by order # or name..."
              className="input pl-8 py-1 text-xs w-48 sm:w-60"
            />
          </div>
          <button type="submit" className="btn btn-outline py-1 px-2 text-xs">
            Filter
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {orderList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PackageCheck className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No orders found</p>
            <p className="text-xs text-[color:var(--text-soft)]">No orders match the selected status or query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {orderList.map(({ order, customerName, customerEmail, storeName }) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-800",
                    confirmed: "bg-blue-100 text-blue-800",
                    processing: "bg-indigo-100 text-indigo-800",
                    shipped: "bg-sky-100 text-sky-800",
                    delivered: "bg-emerald-100 text-emerald-800",
                    cancelled: "bg-rose-100 text-rose-800",
                    returned: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-[color:var(--brand)]">{order.orderNumber}</div>
                        <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
                          <span className="uppercase">{order.paymentMethod}</span>
                          <span>•</span>
                          <span className="capitalize">{order.paymentStatus}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[color:var(--text)]">{customerName ?? "Customer"}</div>
                        <div className="text-xs text-[color:var(--text-soft)]">{customerEmail ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                        {storeName ?? "Direct"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[color:var(--text)]">{formatINR(order.total)}</div>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1 text-[11px] text-[color:var(--accent)] font-mono">
                            <Truck className="h-3 w-3" />
                            {order.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            statusColors[order.status] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="btn btn-outline py-1 px-2 text-xs"
                            title="Inspect order details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <form action={updateAdminOrderStatus} className="inline-flex items-center gap-1">
                            <input type="hidden" name="orderId" value={order.id} />
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-xs text-[color:var(--text)]"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button type="submit" className="btn btn-primary py-1 px-2 text-xs">
                              Save
                            </button>
                          </form>
                        </div>
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
