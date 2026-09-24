"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { categories, notifications, orders, productVariants, products, stores, users, ORDER_STATUSES } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getSettingBool, getSettingNumber } from "@/lib/settings";
import { invalidateCatalog } from "@/lib/cache";
import { formatINR, slugify, uniqueSlug } from "@/lib/utils";
import { restock } from "./orders";
import { transitionOrderStatus } from "@/lib/orders-lifecycle";
import type { ActionState } from "./auth";

async function getOwnStore(userId: string) {
  const [store] = await db.select().from(stores).where(eq(stores.ownerId, userId)).limit(1);
  return store ?? null;
}

/* -------------------------------- store -------------------------------- */

const storeSchema = z.object({
  storeName: z.string().trim().min(3, "Store name must be at least 3 characters").max(60),
  description: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Select your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  gstNumber: z.string().trim().max(15).optional(),
  logoUrl: z.string().trim().optional(),
  bannerUrl: z.string().trim().optional(),
});

export async function saveStore(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };
  const rl = await rateLimit({ key: `store-save:${user.id}`, limit: 15, windowSeconds: 600 });
  if (!rl.ok) return { error: `Too many store updates. Please wait ${rl.retryAfterSeconds}s.` };
  if (!(await getSettingBool("seller.registrationOpen", true))) return { error: "Seller registration is temporarily paused." };
  if (await getSettingBool("seller.requireGst", false)) {
    const gst = String(formData.get("gstNumber") ?? "").trim();
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/i.test(gst)) return { error: "A valid 15-character GSTIN is required to sell right now." };
  }
  const parsed = storeSchema.safeParse({
    storeName: formData.get("storeName"),
    description: formData.get("description") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    gstNumber: formData.get("gstNumber") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    bannerUrl: formData.get("bannerUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const existing = await getOwnStore(user.id);
  if (existing) {
    await recordAudit({ actorId: user.id, actorEmail: user.email, action: "store.update", target: existing.storeName });
    await db
      .update(stores)
      .set({
        storeName: d.storeName,
        description: d.description ?? null,
        address: d.address ?? null,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        gstNumber: d.gstNumber ?? null,
        logoUrl: d.logoUrl ?? null,
        bannerUrl: d.bannerUrl ?? null,
      })
      .where(eq(stores.id, existing.id));
    revalidatePath("/seller");
    revalidatePath(`/stores/${existing.slug}`);
    return { success: "Store details updated." };
  }

  let slug = slugify(d.storeName);
  const clash = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
  if (clash.length) slug = uniqueSlug(d.storeName);

  await db.insert(stores).values({
    ownerId: user.id,
    storeName: d.storeName,
    slug,
    description: d.description ?? null,
    address: d.address ?? null,
    city: d.city,
    state: d.state,
    pincode: d.pincode,
    gstNumber: d.gstNumber ?? null,
    logoUrl: d.logoUrl ?? null,
    bannerUrl: d.bannerUrl ?? null,
  });
  if (user.role === "customer") {
    await db.update(users).set({ role: "seller", updatedAt: new Date() }).where(eq(users.id, user.id));
  }
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "store.create", target: d.storeName });
  await db.insert(notifications).values({
    userId: user.id,
    type: "store_created",
    title: "Your store is live!",
    body: "Add your first product to start selling. 0% commission for your first 6 months.",
  });
  revalidatePath("/", "layout");
  redirect("/seller?welcome=1");
}

/* ------------------------------- products ------------------------------- */

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().trim().max(30).optional().default(""),
  color: z.string().trim().max(30).optional().default(""),
  stock: z.coerce.number().int().min(0).default(0),
  priceAdjustment: z.coerce.number().default(0),
  sku: z.string().trim().max(60).optional().default(""),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(160),
  categoryId: z.string().uuid("Select a category"),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().positive("Enter a valid selling price"),
  mrp: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().min(0),
  shippingWeightGrams: z.coerce.number().int().min(0).max(500000).default(0),
  sku: z.string().trim().max(60).optional(),
  images: z.string().optional(),
  videoUrl: z.string().trim().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).default([]),
});

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };
  const store = await getOwnStore(user.id);
  if (!store) return { error: "Create your store before adding products." };
  if (!store.isActive) return { error: "Your store is currently deactivated. Contact support." };
  const rl = await rateLimit({ key: `product-save:${user.id}`, limit: 40, windowSeconds: 600 });
  if (!rl.ok) return { error: `Too many product changes. Please wait ${rl.retryAfterSeconds}s.` };
  const autoApprove = await getSettingBool("seller.autoApproveProducts", true);
  const maxImages = await getSettingNumber("seller.maxImagesPerProduct", 8);

  let variantsRaw: unknown = [];
  try {
    variantsRaw = JSON.parse(String(formData.get("variants") || "[]"));
  } catch {
    return { error: "Invalid variants data." };
  }

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    mrp: formData.get("mrp") || undefined,
    stock: formData.get("stock") || 0,
    shippingWeightGrams: formData.get("shippingWeightGrams") || 0,
    sku: formData.get("sku") || undefined,
    images: formData.get("images") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    tags: formData.get("tags") || undefined,
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") !== "off",
    variants: variantsRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;
  if (d.mrp && d.mrp < d.price) return { error: "MRP cannot be lower than the selling price." };

  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, d.categoryId)).limit(1);
  if (!category) return { error: "Select a valid category." };

  const images = (d.images ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, Math.max(1, Math.min(12, maxImages)));
  const tags = (d.tags ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 15);
  const cleanVariants = d.variants.filter((v) => v.size || v.color);
  const totalVariantStock = cleanVariants.reduce((s, v) => s + v.stock, 0);

  const values = {
    categoryId: d.categoryId,
    title: d.title,
    description: d.description ?? null,
    price: d.price,
    mrp: d.mrp && d.mrp > 0 ? d.mrp : d.price,
    stock: cleanVariants.length ? totalVariantStock : d.stock,
    shippingWeightGrams: d.shippingWeightGrams,
    sku: d.sku || null,
    images,
    videoUrl: d.videoUrl || null,
    tags,
    isFeatured: d.isFeatured,
    isActive: autoApprove ? d.isActive : false,
    updatedAt: new Date(),
  };

  let productId = d.id;
  try {
    if (productId) {
      const [own] = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.id, productId), eq(products.storeId, store.id)))
        .limit(1);
      if (!own) return { error: "Product not found in your store." };
      await db.update(products).set(values).where(eq(products.id, productId));
    } else {
      let slug = slugify(d.title);
      const clash = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
      if (clash.length) slug = uniqueSlug(d.title);
      const [created] = await db
        .insert(products)
        .values({ ...values, storeId: store.id, slug })
        .returning({ id: products.id });
      productId = created.id;
    }

    // Sync variants
    const existing = await db.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
    const existingIds = new Set(existing.map((v) => v.id));
    const keptIds = new Set<string>();
    for (const v of cleanVariants) {
      const payload = {
        size: v.size || null,
        color: v.color || null,
        stock: v.stock,
        priceAdjustment: v.priceAdjustment,
        sku: v.sku || null,
      };
      if (v.id && existingIds.has(v.id)) {
        await db.update(productVariants).set(payload).where(eq(productVariants.id, v.id));
        keptIds.add(v.id);
      } else {
        const [row] = await db.insert(productVariants).values({ ...payload, productId }).returning({ id: productVariants.id });
        keptIds.add(row.id);
      }
    }
    const toRemove = [...existingIds].filter((id) => !keptIds.has(id));
    for (const id of toRemove) {
      try {
        await db.delete(productVariants).where(eq(productVariants.id, id));
      } catch {
        // Variant is referenced by past orders – keep it but hide it.
        await db.update(productVariants).set({ stock: 0 }).where(eq(productVariants.id, id));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("sku")) return { error: "That SKU is already in use. Choose a unique SKU." };
    console.error("[saveProduct]", err);
    return { error: "Could not save the product. Please try again." };
  }

  await recordAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: d.id ? "product.update" : "product.create",
    target: d.title,
    detail: `${formatINR(d.price)} · stock ${values.stock}${autoApprove ? "" : " · pending moderation"}`,
  });
  await invalidateCatalog();
  revalidatePath("/seller/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/seller/products?saved=1");
}

export async function toggleProductActive(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const store = await getOwnStore(user.id);
  if (!store) return;
  const productId = String(formData.get("productId") ?? "");
  const [p] = await db
    .select({ isActive: products.isActive })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, store.id)))
    .limit(1);
  if (!p) return;
  await db.update(products).set({ isActive: !p.isActive, updatedAt: new Date() }).where(eq(products.id, productId));
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "product.toggle", target: productId, detail: p.isActive ? "Hidden" : "Published" });
  await invalidateCatalog();
  revalidatePath("/seller/products");
  revalidatePath("/products");
}

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const store = await getOwnStore(user.id);
  if (!store) return;
  const productId = String(formData.get("productId") ?? "");
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "product.delete", target: productId });
  try {
    await db.delete(products).where(and(eq(products.id, productId), eq(products.storeId, store.id)));
  } catch {
    // Referenced by order history – soft delete instead
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.storeId, store.id)));
  }
  revalidatePath("/seller/products");
  revalidatePath("/products");
}

/* -------------------------------- orders -------------------------------- */

export async function updateOrderStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const courier = String(formData.get("courier") ?? "").trim();
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;

  const storeIds: string[] = [];
  if (user.role === "admin") {
    const all = await db.select({ id: stores.id }).from(stores);
    storeIds.push(...all.map((s) => s.id));
  } else {
    const store = await getOwnStore(user.id);
    if (!store) return;
    storeIds.push(store.id);
  }
  if (!storeIds.length) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), inArray(orders.storeId, storeIds)))
    .limit(1);
  if (!order) return;
  const rl = await rateLimit({ key: `order-status:${user.id}`, limit: 60, windowSeconds: 300 });
  if (!rl.ok) return;

  await transitionOrderStatus({
    orderId,
    status,
    trackingNumber: trackingNumber || undefined,
    courier: courier || undefined,
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role === "admin" ? "admin" : "seller",
  });

  revalidatePath("/seller/orders");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
}
