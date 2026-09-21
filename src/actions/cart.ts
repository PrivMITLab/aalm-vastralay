"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cart, productVariants, products, wishlist } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export type CartActionResult = { ok: boolean; error?: string; requiresAuth?: boolean; wishlisted?: boolean };

function revalidateShop() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
}

export async function addToCart(productId: string, variantId: string | null, quantity = 1): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true, error: "Please sign in to add items to your bag." };
  const rl = await rateLimit({ key: `cart:${user.id}`, limit: 90, windowSeconds: 60 });
  if (!rl.ok) return { ok: false, error: `Too many bag updates. Please wait ${rl.retryAfterSeconds}s.` };
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return { ok: false, error: "Invalid product." };
  const qty = Math.max(1, Math.min(10, Math.floor(quantity)));

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || !product.isActive) return { ok: false, error: "This product is currently unavailable." };

  let available = product.stock;
  if (variantId) {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
    if (!variant || variant.productId !== productId) return { ok: false, error: "Please select a valid size/colour." };
    available = variant.stock;
  }

  const variantCondition = variantId ? eq(cart.variantId, variantId) : isNull(cart.variantId);
  const [existing] = await db
    .select()
    .from(cart)
    .where(and(eq(cart.userId, user.id), eq(cart.productId, productId), variantCondition))
    .limit(1);

  const newQty = (existing?.quantity ?? 0) + qty;
  if (newQty > available) return { ok: false, error: available === 0 ? "Out of stock." : `Only ${available} left in stock.` };

  if (existing) {
    await db.update(cart).set({ quantity: newQty }).where(eq(cart.id, existing.id));
  } else {
    await db.insert(cart).values({ userId: user.id, productId, variantId, quantity: qty });
  }
  revalidateShop();
  return { ok: true };
}

export async function updateCartQuantity(itemId: string, quantity: number): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };
  if (quantity <= 0) return removeCartItem(itemId);

  const [row] = await db
    .select({ item: cart, productStock: products.stock, variantStock: productVariants.stock })
    .from(cart)
    .innerJoin(products, eq(cart.productId, products.id))
    .leftJoin(productVariants, eq(cart.variantId, productVariants.id))
    .where(and(eq(cart.id, itemId), eq(cart.userId, user.id)))
    .limit(1);
  if (!row) return { ok: false, error: "Item not found." };
  const available = row.variantStock ?? row.productStock;
  const qty = Math.min(Math.floor(quantity), 10);
  if (qty > available) return { ok: false, error: `Only ${available} left in stock.` };

  await db.update(cart).set({ quantity: qty }).where(eq(cart.id, itemId));
  revalidateShop();
  return { ok: true };
}

export async function removeCartItem(itemId: string): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };
  await db.delete(cart).where(and(eq(cart.id, itemId), eq(cart.userId, user.id)));
  revalidateShop();
  return { ok: true };
}

export async function toggleWishlist(productId: string): Promise<CartActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true, error: "Sign in to save items to your wishlist." };
  const [existing] = await db
    .select({ id: wishlist.id })
    .from(wishlist)
    .where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId)))
    .limit(1);
  if (existing) {
    await db.delete(wishlist).where(eq(wishlist.id, existing.id));
    revalidatePath("/wishlist");
    return { ok: true, wishlisted: false };
  }
  await db.insert(wishlist).values({ userId: user.id, productId }).onConflictDoNothing();
  revalidatePath("/wishlist");
  return { ok: true, wishlisted: true };
}

export async function removeFromWishlist(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const productId = String(formData.get("productId") ?? "");
  await db.delete(wishlist).where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId)));
  revalidatePath("/wishlist");
}

export async function moveWishlistItemToCart(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const productId = String(formData.get("productId") ?? "");
  const [variant] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), sql`${productVariants.stock} > 0`))
    .limit(1);
  const result = await addToCart(productId, variant?.id ?? null, 1);
  if (result.ok) {
    await db.delete(wishlist).where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId)));
    revalidatePath("/wishlist");
  }
}
