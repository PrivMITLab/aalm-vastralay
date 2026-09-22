"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  isLocked,
  passwordPolicy,
  recordAttempt,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { isStrongPassword } from "@/lib/format";
import { verifyPayload } from "@/lib/pow";
import { rateLimit } from "@/lib/rate-limit";
import { requestMeta } from "@/lib/request";
import { getSetting, getSettingBool, getSettingNumber } from "@/lib/settings";
import { assertSameOrigin, honeypotFilled } from "@/lib/csrf";

export type ActionState = { error?: string; success?: string } | null;

function safeRedirect(target: FormDataEntryValue | null, fallback: string) {
  const value = typeof target === "string" ? target.trim() : "";
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.includes("://") || value.includes("\r") || value.includes("\n")) {
    return fallback;
  }
  return value;
}

/** Shared gate for every public form: proof-of-work + per-IP rate limit. */
async function gate(formData: FormData, bucket: string, limitKey = "security.formRateLimit") {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false as const, error: origin.error, meta: { ip: "0.0.0.0", userAgent: "", trustProxy: true } };
  if (honeypotFilled(formData)) return { ok: false as const, error: "Submission rejected.", meta: { ip: "0.0.0.0", userAgent: "", trustProxy: true } };
  const meta = await requestMeta();
  const limit = await getSettingNumber(limitKey, 8);
  const rl = await rateLimit({ key: `${bucket}:${meta.ip}`, limit, windowSeconds: bucket.startsWith("auth") ? 600 : 60 });
  if (!rl.ok) return { ok: false as const, error: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.`, meta };

  const botProtection = (await getSetting("security.botProtection", "pow")) === "pow";
  if (botProtection) {
    const verdict = verifyPayload(String(formData.get("botPayload") ?? ""));
    if (!verdict.ok) return { ok: false as const, error: verdict.error ?? "Security check failed.", meta };
  }
  return { ok: true as const, meta };
}

/* ------------------------------- sign up ------------------------------- */

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gateResult = await gate(formData, "auth:signup");
  if (!gateResult.ok) return { error: gateResult.error };

  const policy = await passwordPolicy();
  const schema = z.object({
    fullName: z.string().trim().min(2, "Please enter your full name").max(80),
    email: z.string().trim().email("Please enter a valid email address").max(200),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
      .optional()
      .or(z.literal("")),
    password: policy.strong
      ? z.string().min(8, "Password must be at least 8 characters").refine(isStrongPassword, "Use at least 8 characters with upper case, lower case and a number")
      : z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: (formData.get("phone") as string) || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const email = parsed.data.email.toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "An account with this email already exists. Please sign in instead." };

  let created: typeof users.$inferSelect;
  try {
    const [user] = await db
      .insert(users)
      .values({
        clerkId: `local_${randomUUID()}`,
        email,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone || null,
        passwordHash: hashPassword(parsed.data.password),
        role: "customer",
      })
      .returning();
    created = user;
  } catch {
    return { error: "Could not create your account right now. Please try again." };
  }

  await db.insert(notifications).values({
    userId: created.id,
    type: "welcome",
    title: "Welcome to Aalm Vastralay! 🎉",
    body: "Use code WELCOME10 for 10% off your first order. Cash on Delivery and 7-day easy returns included.",
  });
  await recordAudit({ actorId: created.id, actorEmail: created.email, action: "auth.sign_up" });
  await setSessionCookie(created);

  const intent = formData.get("intent");
  const sellerRegistrationOpen = await getSettingBool("seller.registrationOpen", true);
  redirect(safeRedirect(formData.get("redirect_url"), intent === "seller" && sellerRegistrationOpen ? "/onboarding" : "/dashboard"));
}

/* ------------------------------- sign in ------------------------------- */

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gateResult = await gate(formData, "auth:signin", "security.authRateLimit");
  if (!gateResult.ok) return { error: gateResult.error };
  const { meta } = gateResult;

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) || email.length > 200 || password.length > 200)
    return { error: "Invalid email or password." };

  const lock = await isLocked(email);
  if (lock.locked) {
    await recordAudit({ actorEmail: email, action: "auth.locked", detail: `${lock.failures} failed attempts` });
    return { error: `Too many failed attempts. Your account is locked for ${lock.minutes} minutes.` };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Constant-ish work either way + one generic message so accounts can't be enumerated.
  const ok = user ? verifyPassword(password, user.passwordHash) : verifyPassword(password, "deadbeef:deadbeef");
  if (!user || !ok) {
    await recordAttempt(email, meta.ip, false);
    const after = await isLocked(email);
    await recordAudit({ actorEmail: email, action: "auth.sign_in_failed", detail: `failures=${after.failures}` });
    return {
      error: after.locked
        ? `Incorrect credentials. Too many attempts – locked for ${after.minutes} minutes.`
        : `Incorrect email or password. ${Math.max(0, after.threshold - after.failures)} attempt(s) left before lockout.`,
    };
  }

  // Throttle successful sign-ins for one account too (credential-stuffing storms).
  const perAccount = await getSettingNumber("security.maxActivePerAccount", 20);
  const rl = await rateLimit({ key: `login-account:${email}`, limit: Math.max(5, perAccount), windowSeconds: 600 });
  if (!rl.ok) return { error: "Too many sign-ins for this account. Please try again shortly." };

  await recordAttempt(email, meta.ip, true);
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "auth.sign_in" });
  await setSessionCookie(user);
  const fallback = user.role === "admin" ? "/admin" : user.role === "seller" ? "/seller" : "/dashboard";
  redirect(safeRedirect(formData.get("redirect_url"), fallback));
}

export async function signOut() {
  const user = await getCurrentUser();
  if (user) await recordAudit({ actorId: user.id, actorEmail: user.email, action: "auth.sign_out" });
  await clearSessionCookie();
  redirect("/");
}

/* ------------------------------- profile ------------------------------- */

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };
  const origin = await assertSameOrigin();
  if (!origin.ok) return { error: origin.error };
  const rl = await rateLimit({ key: `profile:${user.id}`, limit: 20, windowSeconds: 600 });
  if (!rl.ok) return { error: "Too many updates. Please wait a few minutes." };

  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName"), phone: (formData.get("phone") as string) || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db
    .update(users)
    .set({ fullName: parsed.data.fullName, phone: parsed.data.phone || null, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}

export async function markNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
