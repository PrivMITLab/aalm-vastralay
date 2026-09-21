import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { db } from "@/db";
import { cart, productVariants, products, stores } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { resolveThumbnail } from "@/lib/media-resolver";
import { formatINR, freeShippingThreshold, round2, shippingFor } from "@/lib/utils";
import CartItemControls from "@/components/cart/CartItemControls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Bag" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const rows = await db
    .select({ item: cart, product: products, variant: productVariants, storeName: stores.storeName, storeId: stores.id })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(productVariants, eq(cart.variantId, productVariants.id))
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(eq(cart.userId, user.id))
    .orderBy(desc(cart.createdAt));

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream-100 text-maroon-700">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-maroon-900">Your bag is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Looks like you haven&apos;t added anything yet. Explore our wedding collection.</p>
        <Link href="/products" className="btn btn-primary mt-6">
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const groups = new Map<string, { storeName: string; rows: typeof rows }>();
  for (const r of rows) {
    const key = r.storeId ?? "unknown";
    const g = groups.get(key) ?? { storeName: r.storeName ?? "Store", rows: [] };
    g.rows.push(r);
    groups.set(key, g);
  }
  const unit = (r: (typeof rows)[number]) => round2(r.product.price + (r.variant?.priceAdjustment ?? 0));
  const subtotal = round2(rows.reduce((s, r) => s + unit(r) * r.item.quantity, 0));
  const mrpTotal = round2(rows.reduce((s, r) => s + (r.product.mrp ?? r.product.price) * r.item.quantity, 0));
  let shipping = 0;
  for (const g of groups.values()) shipping += shippingFor(round2(g.rows.reduce((s, r) => s + unit(r) * r.item.quantity, 0)));
  const total = round2(subtotal + shipping);
  const itemCount = rows.reduce((s, r) => s + r.item.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-maroon-900">
        Your Bag <span className="text-base font-normal text-slate-500">({itemCount} items)</span>
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {[...groups.entries()].map(([storeId, g]) => {
            const storeSubtotal = round2(g.rows.reduce((s, r) => s + unit(r) * r.item.quantity, 0));
            const storeShip = shippingFor(storeSubtotal);
            return (
              <section key={storeId} className="card overflow-hidden">
                <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-maroon-900">Sold by {g.storeName}</span>
                  <span className={storeShip === 0 ? "text-emerald-700" : "text-slate-500"}>
                    {storeShip === 0 ? "Free delivery" : `${formatINR(storeShip)} delivery · add ${formatINR(freeShippingThreshold() - storeSubtotal)} more for free`}
                  </span>
                </header>
                <ul className="divide-y divide-cream-200">
                  {g.rows.map((r) => {
                    const available = r.variant ? r.variant.stock : r.product.stock;
                    return (
                      <li key={r.item.id} className="flex gap-4 p-4">
                        <Link href={`/products/${r.product.slug}`} className="h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-cream-100" style={{ width: 88 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={resolveThumbnail(r.product.images[0])} alt={r.product.title} className="h-full w-full object-cover" />
                        </Link>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <Link href={`/products/${r.product.slug}`} className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-maroon-800">
                            {r.product.title}
                          </Link>
                          {r.variant && (
                            <p className="text-xs text-slate-500">
                              {r.variant.size && <>Size: {r.variant.size}</>}
                              {r.variant.size && r.variant.color && " · "}
                              {r.variant.color && <>Colour: {r.variant.color}</>}
                            </p>
                          )}
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-maroon-900">{formatINR(unit(r))}</span>
                            {(r.product.mrp ?? 0) > r.product.price && <span className="text-xs text-slate-400 line-through">{formatINR(r.product.mrp)}</span>}
                          </div>
                          {available < r.item.quantity && <p className="text-xs font-medium text-rose-700">Only {available} left – please reduce quantity.</p>}
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                            <CartItemControls itemId={r.item.id} quantity={r.item.quantity} max={available} />
                            <span className="text-sm font-semibold text-slate-800">{formatINR(unit(r) * r.item.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-40">
          <h2 className="font-display text-lg font-semibold text-maroon-900">Price details</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Total MRP</dt>
              <dd>{formatINR(mrpTotal)}</dd>
            </div>
            {mrpTotal > subtotal && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount on MRP</dt>
                <dd>-{formatINR(mrpTotal - subtotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery</dt>
              <dd className={shipping === 0 ? "text-emerald-700" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-maroon-900">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
            <Tag className="h-3 w-3" /> Apply coupons like WELCOME10 at checkout
          </p>
          <Link href="/checkout" className="btn btn-primary mt-5 w-full">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/products" className="btn btn-ghost mt-2 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
