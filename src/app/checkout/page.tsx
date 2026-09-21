import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses, cart, orders, productVariants, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { resolveThumbnail } from "@/lib/media-resolver";
import { formatINR, INDIAN_STATES, round2, shippingFor } from "@/lib/utils";
import { getCommerce } from "@/lib/settings";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const rows = await db
    .select({ item: cart, product: products, variant: productVariants })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(productVariants, eq(cart.variantId, productVariants.id))
    .where(eq(cart.userId, user.id));
  if (rows.length === 0) redirect("/cart");

  const savedAddresses = await db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
  const [lastOrder] = await db
    .select({ shippingAddress: orders.shippingAddress })
    .from(orders)
    .where(eq(orders.customerId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  const unit = (r: (typeof rows)[number]) => round2(r.product.price + (r.variant?.priceAdjustment ?? 0));
  const subtotal = round2(rows.reduce((s, r) => s + unit(r) * r.item.quantity, 0));
  const byStore = new Map<string, number>();
  for (const r of rows) byStore.set(r.product.storeId ?? "x", (byStore.get(r.product.storeId ?? "x") ?? 0) + unit(r) * r.item.quantity);
  let shipping = 0;
  for (const s of byStore.values()) shipping += shippingFor(round2(s));
  const itemCount = rows.reduce((s, r) => s + r.item.quantity, 0);
  const commerce = await getCommerce();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Checkout</h1>
        <Link href="/cart" className="text-sm font-semibold text-maroon-700 hover:underline">
          ← Back to bag
        </Link>
      </div>

      <div className="card mb-6 flex gap-3 overflow-x-auto p-3">
        {rows.map((r) => (
          <div key={r.item.id} className="flex w-56 shrink-0 items-center gap-3 rounded-xl border border-cream-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveThumbnail(r.product.images[0])} alt="" className="h-14 w-11 rounded-lg object-cover" />
            <div className="min-w-0 text-xs">
              <p className="line-clamp-2 font-medium text-slate-800">{r.product.title}</p>
              <p className="text-slate-500">
                {r.variant?.size ? `${r.variant.size} · ` : ""}Qty {r.item.quantity} · {formatINR(unit(r) * r.item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <CheckoutForm
        defaults={{ fullName: user.fullName ?? "", phone: user.phone ?? "" }}
        savedAddress={lastOrder?.shippingAddress ?? null}
        subtotal={subtotal}
        shipping={shipping}
        codFee={commerce.codFee}
        returnWindowDays={commerce.returnWindowDays}
        states={INDIAN_STATES}
        itemCount={itemCount}
        savedAddresses={savedAddresses}
      />
    </div>
  );
}
