"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  cart,
  coupons,
  notifications,
  orderItems,
  orders,
  productVariants,
  products,
  reviews,
  stores,
  type ShippingAddress,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { verifyPayload } from "@/lib/pow";
import { rateLimit } from "@/lib/rate-limit";
import { getCommerce, getSetting, getSettingBool } from "@/lib/settings";
import { orderConfirmationHtml, sendEmail } from "@/lib/email";
import { formatINR, generateOrderNumber, round2, shippingFor } from "@/lib/utils";
import type { ActionState } from "./auth";

/* ------------------------------- coupons ------------------------------- */

export type CouponResult = { ok: boolean; discount: number; message: string; code?: string };

async function evaluateCoupon(rawCode: string, subtotal: number) {
  const code = rawCode.trim().toUpperCase();
  const [c] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  if (!c || !c.isActive) return { ok: false as const, discount: 0, message: "Invalid coupon code." };
  const now = new Date();
  if (c.validFrom && c.validFrom > now) return { ok: false as const, discount: 0, message: "This coupon is not active yet." };
  if (c.validUntil && c.validUntil < now) return { ok: false as const, discount: 0, message: "This coupon has expired." };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit)
    return { ok: false as const, discount: 0, message: "This coupon has reached its usage limit." };
  if (subtotal < c.minOrderValue)
    return { ok: false as const, discount: 0, message: `Add items worth ₹${c.minOrderValue} or more to use ${code}.` };

  let discount = c.discountType === "percentage" ? (subtotal * c.discountValue) / 100 : c.discountValue;
  if (c.maxDiscount != null) discount = Math.min(discount, c.maxDiscount);
  discount = round2(Math.min(discount, subtotal));
  return { ok: true as const, discount, message: `Coupon ${code} applied — you save ₹${discount}!`, coupon: c };
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const user = await getCurrentUser();
  const rl = await rateLimit({ key: `coupon-check:${user?.id ?? "guest"}`, limit: 20, windowSeconds: 300 });
  if (!rl.ok) return { ok: false, discount: 0, message: "Too many coupon attempts. Please wait a minute." };
  if (!(await getSettingBool("features.coupons", true))) return { ok: false, discount: 0, message: "Coupons are currently unavailable." };
  if (!code.trim()) return { ok: false, discount: 0, message: "Enter a coupon code." };
  if (code.length > 24) return { ok: false, discount: 0, message: "Invalid coupon code." };
  const res = await evaluateCoupon(code, subtotal);
  return { ok: res.ok, discount: res.discount, message: res.message, code: code.trim().toUpperCase() };
}

/* ------------------------------ checkout ------------------------------ */

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine: z.string().trim().min(5, "Enter your full address"),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Select your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["cod", "upi", "online"]),
  couponCode: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
});

type CartRow = {
  item: typeof cart.$inferSelect;
  product: typeof products.$inferSelect;
  variant: typeof productVariants.$inferSelect | null;
};

const unitPrice = (r: CartRow) => round2(r.product.price + (r.variant?.priceAdjustment ?? 0));

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to continue." };

  // Abuse protection: per-user throttle + proof-of-work verification
  const rl = await rateLimit({ key: `order:${user.id}`, limit: 6, windowSeconds: 300 });
  if (!rl.ok) return { error: `Too many order attempts. Please try again in ${rl.retryAfterSeconds}s.` };
  if ((await getSetting("security.botProtection", "pow")) === "pow") {
    const verdict = verifyPayload(String(formData.get("botPayload") ?? ""));
    if (!verdict.ok) return { error: verdict.error ?? "Security check failed." };
  }
  const commerce = await getCommerce();
  const codEnabled = await getSettingBool("features.cod", true);
  const onlineEnabled = await getSettingBool("features.onlinePayment", true);

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    landmark: formData.get("landmark") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    paymentMethod: formData.get("paymentMethod"),
    couponCode: formData.get("couponCode") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const data = parsed.data;
  if (data.paymentMethod === "cod" && !codEnabled) return { error: "Cash on Delivery is temporarily unavailable. Please pay online." };
  if (data.paymentMethod !== "cod" && !onlineEnabled) return { error: "Online payment is temporarily unavailable. Please choose Cash on Delivery." };

  const rows: CartRow[] = await db
    .select({ item: cart, product: products, variant: productVariants })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(productVariants, eq(cart.variantId, productVariants.id))
    .where(eq(cart.userId, user.id));
  if (!rows.length) return { error: "Your bag is empty." };

  for (const r of rows) {
    if (!r.product.isActive || !r.product.storeId) return { error: `${r.product.title} is no longer available.` };
    const available = r.variant ? r.variant.stock : r.product.stock;
    if (available < r.item.quantity) return { error: `Only ${available} left for ${r.product.title}. Please update your bag.` };
  }

  const grandSubtotal = round2(rows.reduce((s, r) => s + unitPrice(r) * r.item.quantity, 0));
  if (commerce.minOrderValue > 0 && grandSubtotal < commerce.minOrderValue)
    return { error: `Minimum order value is ${formatINR(commerce.minOrderValue)}. Please add more items.` };
  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  if (data.couponCode && (await getSettingBool("features.coupons", true))) {
    const res = await evaluateCoupon(data.couponCode, grandSubtotal);
    if (!res.ok) return { error: res.message };
    discount = res.discount;
    couponId = res.coupon.id;
    couponCode = res.coupon.code;
  }

  const groups = new Map<string, CartRow[]>();
  for (const r of rows) {
    const list = groups.get(r.product.storeId!) ?? [];
    list.push(r);
    groups.set(r.product.storeId!, list);
  }

  const shippingAddress: ShippingAddress = {
    fullName: data.fullName,
    phone: data.phone,
    addressLine: data.addressLine,
    landmark: data.landmark,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
  };

  const orderNumbers: string[] = [];
  let grandTotal = 0;

  try {
    await db.transaction(async (tx) => {
      for (const [storeId, items] of groups) {
        const subtotal = round2(items.reduce((s, r) => s + unitPrice(r) * r.item.quantity, 0));
        const shipping = shippingFor(subtotal, data.paymentMethod);
        const share = discount > 0 ? round2(discount * (subtotal / grandSubtotal)) : 0;
        const total = round2(Math.max(0, subtotal + shipping - share));
        const orderNumber = generateOrderNumber();
        const notes = [data.notes, share > 0 ? `Coupon ${couponCode} applied: -₹${share}` : null].filter(Boolean).join(" | ");

        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber,
            customerId: user.id,
            storeId,
            status: "pending",
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentMethod === "cod" ? "pending" : "paid",
            subtotal,
            shippingFee: shipping,
            total,
            shippingAddress,
            notes: notes || null,
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(
          items.map((r) => ({
            orderId: order.id,
            productId: r.product.id,
            variantId: r.variant?.id ?? null,
            quantity: r.item.quantity,
            price: unitPrice(r),
            total: round2(unitPrice(r) * r.item.quantity),
          })),
        );

        for (const r of items) {
          const updatedProduct = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${r.item.quantity}`, updatedAt: new Date() })
            .where(and(eq(products.id, r.product.id), sql`${products.stock} >= ${r.item.quantity}`))
            .returning({ id: products.id });
          if (!updatedProduct.length) {
            throw new Error(`Insufficient stock for "${r.product.title}". Please adjust your cart.`);
          }
          if (r.variant) {
            const updatedVariant = await tx
              .update(productVariants)
              .set({ stock: sql`${productVariants.stock} - ${r.item.quantity}` })
              .where(and(eq(productVariants.id, r.variant.id), sql`${productVariants.stock} >= ${r.item.quantity}`))
              .returning({ id: productVariants.id });
            if (!updatedVariant.length) {
              throw new Error(`Insufficient stock for selected variant of "${r.product.title}". Please adjust your cart.`);
            }
          }
        }

        await tx.update(stores).set({ totalSales: sql`${stores.totalSales} + 1` }).where(eq(stores.id, storeId));
        const [store] = await tx.select({ ownerId: stores.ownerId }).from(stores).where(eq(stores.id, storeId)).limit(1);
        if (store?.ownerId) {
          await tx.insert(notifications).values({
            userId: store.ownerId,
            type: "new_order",
            title: `New order ${orderNumber}`,
            body: `${items.length} item(s) · ₹${total} · ${data.paymentMethod.toUpperCase()}`,
            data: { orderId: order.id },
          });
        }
        orderNumbers.push(orderNumber);
        grandTotal += total;
      }

      if (couponId) {
        const updatedCoupon = await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(
            and(
              eq(coupons.id, couponId),
              sql`(${coupons.usageLimit} IS NULL OR ${coupons.usedCount} < ${coupons.usageLimit})`
            )
          )
          .returning({ id: coupons.id });
        if (!updatedCoupon.length) {
          throw new Error("This coupon has just reached its usage limit.");
        }
      }
      await tx.delete(cart).where(eq(cart.userId, user.id));
      await tx.insert(notifications).values({
        userId: user.id,
        type: "order_placed",
        title: "Order placed successfully",
        body: `${orderNumbers.join(", ")} · Total ₹${round2(grandTotal)}`,
        data: { orderNumbers },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to place order. Please try again." };
  }

  if (orderNumbers.length === 0) {
    return { error: "Could not place order. Please check item stock or coupon validity." };
  }

  await sendEmail({
    to: user.email,
    subject: `Your Aalm Vastralay order ${orderNumbers.join(", ")} is confirmed`,
    html: orderConfirmationHtml({
      name: user.fullName ?? "there",
      orderNumbers,
      total: round2(grandTotal),
      paymentMethod: data.paymentMethod,
    }),
  });

  await recordAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "order.place",
    target: orderNumbers.join(","),
    detail: `${data.paymentMethod.toUpperCase()} · ${formatINR(grandTotal)}`,
  });

  revalidatePath("/", "layout");
  redirect(`/orders?placed=${encodeURIComponent(orderNumbers.join(","))}`);
}

/* --------------------------- order lifecycle --------------------------- */

export async function restock(orderId: string) {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const it of items) {
    if (it.productId)
      await db.update(products).set({ stock: sql`${products.stock} + ${it.quantity}` }).where(eq(products.id, it.productId));
    if (it.variantId)
      await db
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${it.quantity}` })
        .where(eq(productVariants.id, it.variantId));
  }
}

export async function cancelOrder(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const orderId = String(formData.get("orderId") ?? "");
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.customerId, user.id))).limit(1);
  if (!order || !["pending", "confirmed", "processing"].includes(order.status)) return;
  await db.update(orders).set({ status: "cancelled", updatedAt: new Date() }).where(eq(orders.id, orderId));
  await restock(orderId);
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "order.cancel", target: order.orderNumber });
  const [store] = await db.select({ ownerId: stores.ownerId }).from(stores).where(eq(stores.id, order.storeId!)).limit(1);
  if (store?.ownerId)
    await db.insert(notifications).values({
      userId: store.ownerId,
      type: "order_cancelled",
      title: `Order ${order.orderNumber} cancelled`,
      body: "The customer cancelled this order.",
      data: { orderId },
    });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/seller/orders");
}

export async function requestReturn(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").slice(0, 300);
  const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.customerId, user.id))).limit(1);
  if (!order || order.status !== "delivered") return;
  const commerce = await getCommerce();
  const deliveredAt = order.updatedAt ?? order.createdAt;
  const withinWindow = Date.now() - new Date(deliveredAt).getTime() <= commerce.returnWindowDays * 24 * 60 * 60 * 1000;
  if (!withinWindow) return;
  await db
    .update(orders)
    .set({
      status: "returned",
      notes: [order.notes, `Return requested: ${reason || "No reason given"}`].filter(Boolean).join(" | "),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
  const [store] = await db.select({ ownerId: stores.ownerId }).from(stores).where(eq(stores.id, order.storeId!)).limit(1);
  if (store?.ownerId)
    await db.insert(notifications).values({
      userId: store.ownerId,
      type: "order_returned",
      title: `Return requested for ${order.orderNumber}`,
      body: reason || "Customer requested a return within the 7-day window.",
      data: { orderId },
    });
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "order.return", target: order.orderNumber, detail: reason.slice(0, 200) });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/seller/orders");
}

/* -------------------------------- reviews -------------------------------- */

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(2000),
});

export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to write a review." };
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  const { productId, rating, title, body } = parsed.data;

  const rl = await rateLimit({ key: `review:${user.id}`, limit: 5, windowSeconds: 3600 });
  if (!rl.ok) return { error: "You have submitted several reviews already. Please try again later." };

  const [product] = await db.select({ slug: products.slug, storeId: products.storeId }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "Product not found." };

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.userId, user.id)))
    .limit(1);
  if (existing.length) return { error: "You have already reviewed this product." };

  // Verified purchase: a delivered order by this user containing the product
  const delivered = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.customerId, user.id), eq(orderItems.productId, productId), inArray(orders.status, ["delivered", "returned"])))
    .limit(1);

  await db.insert(reviews).values({
    productId,
    userId: user.id,
    orderId: delivered[0]?.id ?? null,
    rating,
    title: title ?? null,
    body,
    isVerified: delivered.length > 0,
  });

  await db.execute(sql`
    UPDATE products SET
      rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = ${productId}),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = ${productId})
    WHERE id = ${productId}`);
  if (product.storeId) {
    await db.execute(sql`
      UPDATE stores SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM products WHERE store_id = ${product.storeId} AND total_reviews > 0), 0)
      WHERE id = ${product.storeId}`);
  }

  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "review.create", target: productId, detail: `${rating}★` });
  revalidatePath(`/products/${product.slug}`);
  return { success: "Thank you! Your review has been published." };
}
