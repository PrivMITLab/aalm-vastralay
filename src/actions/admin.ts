"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, coupons, orders, products, settings as settingsTable, stores, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { SETTINGS_DEFAULTS, SETTINGS_FIELDS, ensureSettingsRows, invalidateSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { invalidateCatalog } from "@/lib/cache";
import { transitionOrderStatus } from "@/lib/orders-lifecycle";
import type { ActionState } from "./auth";

async function assertAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

/* ------------------------------- settings ------------------------------- */

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await assertAdmin();
  if (!admin) return { error: "Forbidden" };
  const rl = await rateLimit({ key: `settings:${admin.id}`, limit: 30, windowSeconds: 600 });
  if (!rl.ok) return { error: `Too many changes. Try again in ${rl.retryAfterSeconds}s.` };

  const group = String(formData.get("__group") ?? "general");
  const fields = SETTINGS_FIELDS.filter((f) => f.group === group);
  if (fields.length === 0) return { error: "Unknown settings group." };

  const changes: string[] = [];
  for (const field of fields) {
    let value: string | null = null;
    if (field.type === "boolean") {
      value = formData.get(`${field.key}__present`) === "1" ? (formData.get(field.key) === "on" ? "true" : "false") : "false";
    } else {
      const raw = formData.get(field.key);
      if (raw === null) continue;
      value = String(raw).slice(0, field.type === "json" || field.type === "textarea" ? 20000 : 1000);
      if (field.type === "number") {
        const n = Number(value);
        if (!Number.isFinite(n)) return { error: `${field.label} must be a number.` };
        if (field.min !== undefined && n < field.min) return { error: `${field.label} must be at least ${field.min}.` };
        if (field.max !== undefined && n > field.max) return { error: `${field.label} must be at most ${field.max}.` };
      }
      if (field.type === "color" && !/^#[0-9a-f]{3,8}$/i.test(value)) return { error: `${field.label} must be a hex colour like #7a1f2b.` };
      if (field.type === "json") {
        try {
          JSON.parse(value);
        } catch {
          return { error: `${field.label} must be valid JSON.` };
        }
      }
    }
    const current = SETTINGS_DEFAULTS[field.key];
    if (value !== current) changes.push(field.key);
    await db
      .insert(settingsTable)
      .values({ key: field.key, value, group: field.group, label: field.label, updatedBy: admin.id, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date(), updatedBy: admin.id } });
  }

  await invalidateSettings();
  revalidatePath("/admin/banners");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/theme");
  await recordAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "settings.update",
    target: group,
    detail: `${changes.length} value(s) changed: ${changes.slice(0, 25).join(", ")}`,
  });

  return { success: `Saved ${changes.length} change(s). They are live for every visitor now.` };
}

export async function resetSettingsGroup(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const group = String(formData.get("__group") ?? "");
  const fields = SETTINGS_FIELDS.filter((f) => f.group === group);
  if (!fields.length) return;
  for (const field of fields) {
    await db
      .insert(settingsTable)
      .values({ key: field.key, value: field.default, group: field.group, label: field.label, updatedBy: admin.id })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: field.default, updatedAt: new Date(), updatedBy: admin.id } });
  }
  await invalidateSettings();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.reset", target: group, detail: `Reset ${fields.length} key(s)` });
  revalidatePath("/admin/settings");
}

export async function backfillSettings() {
  const admin = await assertAdmin();
  if (!admin) return;
  const added = await ensureSettingsRows();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.update", detail: `Back-filled ${added} key(s)` });
  revalidatePath("/admin/settings");
}

/* ------------------------------ users/stores ------------------------------ */

export async function updateUserRole(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!["customer", "seller", "admin"].includes(role) || userId === admin.id) return;
  const rl = await rateLimit({ key: `role:${admin.id}`, limit: 40, windowSeconds: 600 });
  if (!rl.ok) return;
  const [target] = await db.select({ email: users.email, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return;
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "user.role", target: target.email, detail: `${target.role} → ${role}` });
  revalidatePath("/admin");
}

export async function toggleStoreActive(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const storeId = String(formData.get("storeId") ?? "");
  const [s] = await db.select({ isActive: stores.isActive, slug: stores.slug, name: stores.storeName }).from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!s) return;
  await db.update(stores).set({ isActive: !s.isActive }).where(eq(stores.id, storeId));
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "store.toggle", target: s.name, detail: s.isActive ? "Suspended" : "Activated" });
  await invalidateCatalog();
  revalidatePath("/admin");
  revalidatePath(`/stores/${s.slug}`);
}

/* -------------------------------- coupons -------------------------------- */

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, - or _ only")
    .transform((s) => s.toUpperCase()),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Enter a discount value"),
  minOrderValue: z.coerce.number().nonnegative().default(0),
  maxDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

export async function createCoupon(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await assertAdmin();
  if (!admin) return { error: "Forbidden" };
  const rl = await rateLimit({ key: `coupon:${admin.id}`, limit: 20, windowSeconds: 600 });
  if (!rl.ok) return { error: "Too many coupon changes. Please wait." };

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderValue: formData.get("minOrderValue") || 0,
    maxDiscount: formData.get("maxDiscount") || undefined,
    usageLimit: formData.get("usageLimit") || undefined,
    validUntil: formData.get("validUntil") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  if (d.discountType === "percentage" && d.discountValue > 90) return { error: "Percentage discount cannot exceed 90%." };
  if (d.discountType === "fixed" && d.discountValue > 100000) return { error: "Fixed discount is too large." };

  const clash = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, d.code)).limit(1);
  if (clash.length) return { error: "A coupon with this code already exists." };

  await db.insert(coupons).values({
    code: d.code,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minOrderValue: d.minOrderValue,
    maxDiscount: d.maxDiscount ?? null,
    usageLimit: d.usageLimit ?? null,
    validFrom: new Date(),
    validUntil: d.validUntil ? new Date(d.validUntil) : null,
  });
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "coupon.create", target: d.code, detail: `${d.discountType} ${d.discountValue}` });
  revalidatePath("/admin");
  return { success: `Coupon ${d.code} created and live.` };
}

export async function toggleCoupon(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const id = String(formData.get("couponId") ?? "");
  const [c] = await db.select({ isActive: coupons.isActive, code: coupons.code }).from(coupons).where(eq(coupons.id, id)).limit(1);
  if (!c) return;
  await db.update(coupons).set({ isActive: !c.isActive }).where(eq(coupons.id, id));
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "coupon.toggle", target: c.code, detail: c.isActive ? "Disabled" : "Enabled" });
  revalidatePath("/admin");
}

/* ------------------------------- categories ------------------------------- */

const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(40),
  parentId: z.string().uuid().optional(),
});

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await assertAdmin();
  if (!admin) return { error: "Forbidden" };
  const parsed = categorySchema.safeParse({ name: formData.get("name"), parentId: formData.get("parentId") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const slug = slugify(parsed.data.name);
  if (!slug) return { error: "Category name must contain letters or numbers." };
  const clash = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  if (clash.length) return { error: "A category with this name already exists." };
  await db.insert(categories).values({ name: parsed.data.name, slug, parentId: parsed.data.parentId ?? null, sortOrder: 99 });
  await invalidateCatalog();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "category.create", target: parsed.data.name });
  return { success: `Category "${parsed.data.name}" added.` };
}

export async function createCategoryDirect(formData: FormData): Promise<void> {
  await createCategory(null, formData);
}

export async function createCouponDirect(formData: FormData): Promise<void> {
  await createCoupon(null, formData);
}

export async function updateSettingsDirect(formData: FormData): Promise<void> {
  await updateSettings(null, formData);
}

export async function toggleCategoryActive(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const id = String(formData.get("categoryId") ?? "");
  const [c] = await db.select({ isActive: categories.isActive, name: categories.name }).from(categories).where(eq(categories.id, id)).limit(1);
  if (!c) return;
  await db.update(categories).set({ isActive: !c.isActive }).where(eq(categories.id, id));
  await invalidateCatalog();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "category.toggle", target: c.name, detail: c.isActive ? "Deactivated" : "Activated" });
  revalidatePath("/admin/categories");
}

/* -------------------------------- products -------------------------------- */

export async function toggleProductActive(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const id = String(formData.get("productId") ?? "");
  const [p] = await db.select({ isActive: products.isActive, title: products.title }).from(products).where(eq(products.id, id)).limit(1);
  if (!p) return;
  await db.update(products).set({ isActive: !p.isActive, updatedAt: new Date() }).where(eq(products.id, id));
  await invalidateCatalog();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "product.toggle", target: p.title, detail: p.isActive ? "Deactivated" : "Activated" });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductFeatured(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const id = String(formData.get("productId") ?? "");
  const [p] = await db.select({ isFeatured: products.isFeatured, title: products.title }).from(products).where(eq(products.id, id)).limit(1);
  if (!p) return;
  await db.update(products).set({ isFeatured: !p.isFeatured, updatedAt: new Date() }).where(eq(products.id, id));
  await invalidateCatalog();
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "product.feature", target: p.title, detail: p.isFeatured ? "Unfeatured" : "Featured" });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/* --------------------------------- orders --------------------------------- */

export async function adminUpdateOrderStatus(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const courier = String(formData.get("courier") ?? "").trim() || undefined;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim() || undefined;

  await transitionOrderStatus({
    orderId,
    status,
    courier,
    trackingNumber,
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: "admin",
  });
}

export const updateAdminOrderStatus = adminUpdateOrderStatus;

/* --------------------------- maintenance tasks --------------------------- */

export async function pruneRateLimits() {
  const admin = await assertAdmin();
  if (!admin) return;
  await db.execute(sql`DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour'`);
  await db.execute(sql`DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days'`);
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.update", detail: "Pruned rate-limit + login-attempt tables" });
  revalidatePath("/admin/security");
}

export async function clearOldAuditLogs() {
  const admin = await assertAdmin();
  if (!admin) return;
  await db.execute(sql`DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '180 days'`);
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.update", detail: "Cleared audit logs older than 180 days" });
  revalidatePath("/admin/security");
}

export async function seedMissingSettings() {
  const admin = await assertAdmin();
  if (!admin) return;
  const keys = SETTINGS_FIELDS.map((f) => f.key);
  const existing = await db.select({ key: settingsTable.key }).from(settingsTable).where(inArray(settingsTable.key, keys));
  const missing = SETTINGS_FIELDS.filter((f) => !existing.some((e) => e.key === f.key));
  for (const f of missing) {
    await db.insert(settingsTable).values({ key: f.key, value: f.default, group: f.group, label: f.label }).onConflictDoNothing();
  }
  await recordAudit({ actorId: admin.id, actorEmail: admin.email, action: "settings.update", detail: `Seeded ${missing.length} key(s)` });
  revalidatePath("/admin/settings");
}

/**
 * Verifies or rejects a customer UPI payment using the 12-digit UTR number.
 * Ensures the money is actually received before marking an order as paid.
 */
export async function verifyUpiPayment(orderId: string, action: "verify" | "reject"): Promise<{ ok: boolean; message: string }> {
  const admin = await assertAdmin();
  if (!admin) return { ok: false, message: "Unauthorized. Admin role required." };

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { ok: false, message: "Order not found." };

  if (action === "verify") {
    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: order.status === "pending" ? "confirmed" : order.status,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await recordAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "order.update_status",
      target: orderId,
      detail: `Verified UPI payment for order #${order.orderNumber}. UTR: ${order.upiUtr ?? "N/A"}`,
    });
  } else {
    await db
      .update(orders)
      .set({
        paymentStatus: "failed",
        notes: [order.notes, "UPI Payment Rejected by Admin (Invalid / Unmatched UTR)"].filter(Boolean).join(" | "),
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await recordAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "order.update_status",
      target: orderId,
      detail: `Rejected UPI payment for order #${order.orderNumber}. UTR: ${order.upiUtr ?? "N/A"}`,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true, message: action === "verify" ? "Payment verified successfully" : "Payment rejected" };
}

/**
 * Programmatic alias for verifying UPI orders.
 * @param orderId The UUID of the order
 * @param approve True to verify/accept payment, false to reject
 */
export async function verifyUpiOrder(orderId: string, approve: boolean): Promise<{ ok: boolean; message: string }> {
  return verifyUpiPayment(orderId, approve ? "verify" : "reject");
}


