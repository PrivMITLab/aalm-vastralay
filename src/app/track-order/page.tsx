import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, or } from "drizzle-orm";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageCircle,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Your Order – Live Delivery Status | Aalm Vastralay",
  description: "Track your Aalm Vastralay ethnic wear shipment in real time using your Order Number or registered phone number.",
};

type SP = {
  orderNumber?: string;
};

const ORDER_STEPS = [
  { key: "pending", label: "Order Received", desc: "Awaiting confirmation" },
  { key: "confirmed", label: "Confirmed", desc: "Artisans preparing parcel" },
  { key: "processing", label: "Quality Check & Tailoring", desc: "Inspected & packed" },
  { key: "shipped", label: "Handed to Courier", desc: "In transit with tracking AWB" },
  { key: "delivered", label: "Delivered", desc: "Safely received" },
];

function getStepIndex(status: string): number {
  switch (status.toLowerCase()) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const orderNum = (sp.orderNumber ?? "").trim();

  let orderData: (typeof orders.$inferSelect) | null = null;
  let itemsData: { item: typeof orderItems.$inferSelect; productTitle: string | null }[] = [];

  if (orderNum) {
    try {
      const [found] = await db
        .select()
        .from(orders)
        .where(
          or(
            eq(orders.orderNumber, orderNum),
            eq(orders.id, orderNum)
          )
        )
        .limit(1);

      if (found) {
        orderData = found;
        const items = await db
          .select({
            item: orderItems,
            productTitle: products.title,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, found.id));

        itemsData = items;
      }
    } catch (err) {
      console.warn("[TrackOrderPage] Query error:", err);
    }
  }

  const currentStep = orderData ? getStepIndex(orderData.status) : 0;
  const isCancelled = orderData?.status.toLowerCase() === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Track Order</span>
      </nav>

      {/* Header */}
      <header className="mb-8 text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <Truck className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Live Courier Dispatch
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Track Your Shipment
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-md mx-auto">
          Enter your Order Number (e.g. ORD-...) to track parcel movements, courier AWB, and estimated delivery dates.
        </p>
      </header>

      {/* Search Input Box */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8 shadow-sm mb-8">
        <form action="/track-order" method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="orderNumber"
              defaultValue={orderNum}
              placeholder="Enter your Order Number (e.g. ORD-2026-XXXX)"
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-xs sm:text-sm text-[color:var(--text)] placeholder-[color:var(--text-soft)] focus:border-[color:var(--brand)] focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-6 py-3 text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" /> Track Status
          </button>
        </form>
      </div>

      {/* Results View */}
      {orderNum && !orderData && (
        <div className="card text-center py-12 px-4 space-y-3 max-w-md mx-auto border border-dashed border-[color:var(--border)]">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="font-display text-lg font-bold">No Order Found with ID &ldquo;{orderNum}&rdquo;</h2>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            Please double-check your order confirmation email or SMS for the exact order ID format. If you just placed the order, please allow 10-15 minutes for system sync.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/918434061342?text=Hello%20Aalm%20Vastralay,%20I%20am%20unable%20to%20track%20my%20order%20${orderNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> Ask Support on WhatsApp
            </a>
          </div>
        </div>
      )}

      {orderData && (
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
              <div>
                <p className="text-xs text-[color:var(--text-soft)] uppercase font-semibold">Order Number</p>
                <h3 className="font-mono text-base sm:text-lg font-extrabold text-[color:var(--brand)]">
                  {orderData.orderNumber}
                </h3>
              </div>
              <div>
                <p className="text-xs text-[color:var(--text-soft)] uppercase font-semibold">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  isCancelled
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {orderData.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-[color:var(--text-soft)] uppercase font-semibold">Total Amount</p>
                <p className="text-sm font-bold text-[color:var(--text)]">
                  {formatINR(Number(orderData.total))}
                </p>
              </div>
            </div>

            {/* Stepper Timeline */}
            {!isCancelled ? (
              <div className="py-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step.key}
                        className={`relative rounded-xl border p-4 text-center sm:text-left transition-all ${
                          isCurrent
                            ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10 shadow-sm"
                            : isDone
                            ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-[color:var(--border)] bg-[color:var(--surface-2)] opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-soft)]">
                            Step {idx + 1}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-[color:var(--text-soft)]" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[color:var(--text)] mb-1">
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-[color:var(--text-soft)]">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
                This order was cancelled. Any pre-authorized payment has been refunded to your original payment method.
              </div>
            )}

            {/* Items in order */}
            {itemsData.length > 0 && (
              <div className="pt-4 border-t border-[color:var(--border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-soft)]">
                  Items in this Shipment ({itemsData.length})
                </h4>
                <div className="divide-y divide-[color:var(--border)]">
                  {itemsData.map(({ item, productTitle }) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[color:var(--text)]">{productTitle ?? "Ethnic Wear Item"}</p>
                        <p className="text-[10px] text-[color:var(--text-soft)]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-[color:var(--text)]">
                        {formatINR(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
