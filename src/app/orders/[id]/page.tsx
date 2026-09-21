import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { Check, MapPin, Phone, RotateCcw, Truck, XCircle } from "lucide-react";
import { db } from "@/db";
import { orderItems, orders, productVariants, products, stores } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { cancelOrder, requestReturn } from "@/actions/orders";
import { resolveThumbnail } from "@/lib/media-resolver";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order details" };

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
const STEP_LABEL: Record<string, string> = { pending: "Placed", confirmed: "Confirmed", processing: "Packed", shipped: "Shipped", delivered: "Delivered" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const isUuid = /^[0-9a-f-]{36}$/i.test(id);
  if (!isUuid) notFound();

  const where = user.role === "admin" ? eq(orders.id, id) : and(eq(orders.id, id), eq(orders.customerId, user.id));
  const [row] = await db
    .select({
      order: orders,
      store: stores,
      canReturn: sql<boolean>`CASE WHEN ${orders.status} = 'delivered' AND ${orders.updatedAt} >= NOW() - INTERVAL '7 days' THEN true ELSE false END`,
    })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .where(where)
    .limit(1);
  if (!row) notFound();
  const { order, store, canReturn } = row;

  const items = await db
    .select({ item: orderItems, product: products, variant: productVariants })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .where(eq(orderItems.orderId, order.id));

  const addr = order.shippingAddress;
  const terminal = order.status === "cancelled" || order.status === "returned";
  const stepIndex = STEPS.indexOf(order.status);
  const canCancel = ["pending", "confirmed", "processing"].includes(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/orders" className="text-sm font-semibold text-maroon-700 hover:underline">
        ← All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-maroon-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            Placed {formatDate(order.createdAt)} · Sold by{" "}
            {store ? (
              <Link href={`/stores/${store.slug}`} className="text-maroon-700 hover:underline">
                {store.storeName}
              </Link>
            ) : (
              "—"
            )}
          </p>
        </div>
        <span className={cn("badge px-3 py-1 text-xs capitalize", statusStyle(order.status))}>{order.status}</span>
      </div>

      {/* Timeline */}
      <div className="card mt-6 p-5">
        {terminal ? (
          <div className="flex items-center gap-3 text-sm">
            <XCircle className="h-6 w-6 text-rose-600" />
            <div>
              <p className="font-semibold capitalize text-slate-900">{order.status}</p>
              <p className="text-slate-500">Updated {formatDate(order.updatedAt)}</p>
            </div>
          </div>
        ) : (
          <ol className="grid grid-cols-5 gap-1">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              return (
                <li key={s} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={cn("absolute left-0 right-1/2 top-3.5 -z-0 h-0.5", i <= stepIndex ? "bg-maroon-700" : "bg-cream-200")} />}
                  {i < STEPS.length - 1 && <span className={cn("absolute left-1/2 right-0 top-3.5 -z-0 h-0.5", i < stepIndex ? "bg-maroon-700" : "bg-cream-200")} />}
                  <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-xs", done ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white text-slate-400")}>
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={cn("mt-1.5 text-[11px] font-medium", done ? "text-maroon-900" : "text-slate-400")}>{STEP_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        )}
        {(order.trackingNumber || order.courier) && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2 text-sm text-slate-700">
            <Truck className="h-4 w-4 text-maroon-700" /> {order.courier ?? "Courier"} · Tracking ID <span className="font-mono font-semibold">{order.trackingNumber ?? "pending"}</span>
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="card divide-y divide-cream-200">
          {items.map(({ item, product, variant }) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveThumbnail(product?.images?.[0])} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 text-sm">
                {product ? (
                  <Link href={`/products/${product.slug}`} className="font-medium text-slate-800 hover:text-maroon-800">
                    {product.title}
                  </Link>
                ) : (
                  <p className="font-medium text-slate-800">Product unavailable</p>
                )}
                {variant && (
                  <p className="text-xs text-slate-500">
                    {variant.size && `Size: ${variant.size}`} {variant.color && `· Colour: ${variant.color}`}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formatINR(item.price)} × {item.quantity}
                </p>
                {order.status === "delivered" && product && (
                  <Link href={`/products/${product.slug}#reviews`} className="mt-1 inline-block text-xs font-semibold text-maroon-700 hover:underline">
                    Write a review
                  </Link>
                )}
              </div>
              <p className="font-semibold text-slate-900">{formatINR(item.total)}</p>
            </div>
          ))}
          <dl className="space-y-1.5 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery</dt>
              <dd>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</dd>
            </div>
            {order.subtotal + order.shippingFee > order.total && (
              <div className="flex justify-between text-emerald-700">
                <dt>Coupon discount</dt>
                <dd>-{formatINR(order.subtotal + order.shippingFee - order.total)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-bold text-maroon-900">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
            <p className="pt-1 text-xs text-slate-500">
              Payment: <span className="uppercase">{order.paymentMethod}</span> · {order.paymentStatus}
            </p>
          </dl>
        </section>

        <aside className="space-y-4">
          <div className="card p-4 text-sm">
            <p className="mb-2 flex items-center gap-1.5 font-semibold text-maroon-900">
              <MapPin className="h-4 w-4" /> Delivery address
            </p>
            <p className="font-medium">{addr.fullName}</p>
            <p className="text-slate-600">
              {addr.addressLine}
              {addr.landmark ? `, ${addr.landmark}` : ""}
            </p>
            <p className="text-slate-600">
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
            <p className="mt-1 flex items-center gap-1 text-slate-600">
              <Phone className="h-3 w-3" /> {addr.phone}
            </p>
          </div>

          {order.notes && (
            <div className="card p-4 text-sm">
              <p className="font-semibold text-maroon-900">Notes</p>
              <p className="mt-1 text-slate-600">{order.notes}</p>
            </div>
          )}

          {canCancel && (
            <form action={cancelOrder} className="card p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <p className="text-sm text-slate-600">Changed your mind? You can cancel before the order is shipped.</p>
              <SubmitButton variant="outline" className="mt-3 w-full" pendingText="Cancelling…">
                <XCircle className="h-4 w-4" /> Cancel order
              </SubmitButton>
            </form>
          )}

          {canReturn && (
            <form action={requestReturn} className="card p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <p className="text-sm font-semibold text-maroon-900">7-day easy return</p>
              <p className="mt-1 text-xs text-slate-600">Not happy with the fit or quality? Request a return and we&apos;ll arrange a pickup.</p>
              <textarea name="reason" className="input mt-3 min-h-16" placeholder="Reason (optional)" maxLength={300} />
              <SubmitButton variant="outline" className="mt-3 w-full" pendingText="Requesting…">
                <RotateCcw className="h-4 w-4" /> Request return
              </SubmitButton>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
