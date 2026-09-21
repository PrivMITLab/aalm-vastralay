"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { getCurrentUser, setSessionCookie, verifyPassword, hashPassword } from "@/lib/auth";
import { assertSameOrigin, honeypotFilled } from "@/lib/csrf";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { isStrongPassword } from "@/lib/format";
import type { ActionState } from "./auth";

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(20).default("Home"),
  fullName: z.string().trim().min(2, "Enter the recipient name").max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine: z.string().trim().min(6, "Enter the full address").max(200),
  landmark: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().trim().min(2, "Select state").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional(),
});

export async function saveAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };
  const origin = await assertSameOrigin();
  if (!origin.ok) return { error: origin.error };
  if (honeypotFilled(formData)) return { error: "Submission rejected." };
  const rl = await rateLimit({ key: `address-save:${user.id}`, limit: 30, windowSeconds: 600 });
  if (!rl.ok) return { error: "Too many changes. Please try again shortly." };

  const parsed = addressSchema.safeParse({
    id: formData.get("id") || undefined,
    label: formData.get("label") || "Home",
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    landmark: formData.get("landmark") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  const d = parsed.data;
  const id = String(formData.get("id") ?? "");
  const validId = /^[0-9a-f-]{36}$/i.test(id) ? id : null;

  if (d.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));

  if (validId) {
    const [existing] = await db.select().from(addresses).where(and(eq(addresses.id, validId), eq(addresses.userId, user.id))).limit(1);
    if (!existing) return { error: "Address not found." };
    await db
      .update(addresses)
      .set({ ...d, isDefault: d.isDefault ?? existing.isDefault, updatedAt: new Date() })
      .where(eq(addresses.id, validId));
  } else {
    const [{ count }] = await db.select({ count: sqlCount() }).from(addresses).where(eq(addresses.userId, user.id));
    if (Number(count) >= 10) return { error: "You can save up to 10 addresses." };
    const [created] = await db
      .insert(addresses)
      .values({
        userId: user.id,
        label: d.label,
        fullName: d.fullName,
        phone: d.phone,
        addressLine: d.addressLine,
        landmark: d.landmark || null,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        isDefault: d.isDefault ?? Number(count) === 0,
      })
      .returning();
    if (Number(count) === 0 && !d.isDefault) {
      await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, created.id));
    }
  }
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "address.save", target: d.label });
  revalidatePath("/dashboard");
  revalidatePath("/checkout");
  return { success: "Address saved." };
}

export async function deleteAddress(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const origin = await assertSameOrigin();
  if (!origin.ok) return;
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "address.delete" });
  revalidatePath("/dashboard");
  revalidatePath("/checkout");
}

export async function setDefaultAddress(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const origin = await assertSameOrigin();
  if (!origin.ok) return;
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const [own] = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id))).limit(1);
  if (!own) return;
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db.update(addresses).set({ isDefault: true, updatedAt: new Date() }).where(eq(addresses.id, id));
  revalidatePath("/dashboard");
  revalidatePath("/checkout");
}

/* ----------------------------- password change ----------------------------- */

const changePasswordSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: z.string().min(8, "New password must be at least 8 characters"),
  confirm: z.string().min(1, "Confirm the new password"),
});

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };
  const origin = await assertSameOrigin();
  if (!origin.ok) return { error: origin.error };
  const rl = await rateLimit({ key: `password:${user.id}`, limit: 5, windowSeconds: 600 });
  if (!rl.ok) return { error: "Too many attempts. Please try again later." };

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { current, next, confirm } = parsed.data;
  if (!verifyPassword(current, user.passwordHash)) return { error: "Your current password is incorrect." };
  if (current === next) return { error: "New password must be different from the current one." };
  if (next !== confirm) return { error: "The new passwords do not match." };
  if (!isStrongPassword(next)) return { error: "Use 8+ characters with upper case, lower case and a number." };

  await db.update(users).set({ passwordHash: hashPassword(next), updatedAt: new Date() }).where(eq(users.id, user.id));

  // Re-read the rotated user so the new session token is bound to the new password hash
  const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  await setSessionCookie(fresh);
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "user.password" });
  return { success: "Password changed. All other sessions were signed out." };
}

function sqlCount() {
  return sql<number>`count(*)::int`;
}
