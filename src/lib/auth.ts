import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { loginAttempts, users, type User } from "@/db/schema";
import { getSettingBool, getSettingNumber } from "./settings";

export { hashPassword, verifyPassword } from "./password";

/**
 * Session layer with hardened tokens.
 *
 * The cookie is a signed, expiring token:  userId.expiry.signature
 * The signature is derived from (userId + expiry + a per-user secret) where the
 * per-user secret is a hash of the stored password hash. Rotating the password
 * instantly invalidates every existing session for that account – a stolen cookie
 * cannot be replayed after a reset, and tampering breaks the HMAC.
 *
 * The public API (getCurrentUser / requireUser / requireRole) mirrors Clerk so the
 * provider can be swapped without touching the pages.
 */

export const SESSION_COOKIE = "av_session";
const SECRET = (() => {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[CRITICAL SECURITY WARNING] AUTH_SECRET is not configured in production! Please set AUTH_SECRET in your environment variables to prevent cookie forgery.");
  }
  return secret || "aalm-vastralay-dev-secret-change-me";
})();

async function sessionDays() {
  const days = await getSettingNumber("security.sessionDays", 30);
  return Math.min(180, Math.max(1, days || 30));
}

function sessionVersion(user: Pick<User, "id" | "passwordHash" | "clerkId">) {
  return createHash("sha256")
    .update(`${user.id}:${SECRET}:${user.passwordHash ?? user.clerkId}`)
    .digest("base64url")
    .slice(0, 24);
}

function signPayload(payload: string, version: string) {
  return createHmac("sha256", `${SECRET}:${version}`).update(payload).digest("base64url");
}

export function createSessionToken(user: Pick<User, "id" | "passwordHash" | "clerkId">, days: number) {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `${user.id}.${exp}`;
  return `${payload}.${signPayload(payload, sessionVersion(user))}`;
}

/** Reads the (unverified) user id so we can look up the per-user secret. */
export function readTokenUserId(token: string | undefined): string | null {
  if (!token) return null;
  const [userId, exp, sig] = token.split(".");
  if (!userId || !exp || !sig) return null;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

export function verifySessionToken(token: string | undefined, user: Pick<User, "id" | "passwordHash" | "clerkId">) {
  if (!token) return false;
  const [userId, exp, sig] = token.split(".");
  if (!userId || !exp || !sig || userId !== user.id) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = signPayload(`${userId}.${exp}`, sessionVersion(user));
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setSessionCookie(user: Pick<User, "id" | "passwordHash" | "clerkId">) {
  const days = await sessionDays();
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user, days), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const userId = readTokenUserId(token);
  if (!userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  if (!verifySessionToken(token, user)) return null;
  return user;
});

export async function requireUser(redirectTo?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo ? `/sign-in?redirect_url=${encodeURIComponent(redirectTo)}` : "/sign-in");
  return user;
}

export async function requireRole(roles: Array<"customer" | "seller" | "admin">, redirectTo?: string): Promise<User> {
  const user = await requireUser(redirectTo);
  if (!roles.includes(user.role as "customer" | "seller" | "admin")) redirect("/dashboard?error=forbidden");
  return user;
}

export function isAdmin(user: User | null | undefined) {
  return user?.role === "admin";
}

export function isSeller(user: User | null | undefined) {
  return user?.role === "seller" || user?.role === "admin";
}

/* --------------------------- brute-force guard --------------------------- */

export async function recentFailures(identifier: string, minutes: number) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.identifier, identifier), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, since)));
  return row?.n ?? 0;
}

export async function recordAttempt(identifier: string, ip: string, success: boolean) {
  await db.insert(loginAttempts).values({ identifier, ip, success });
  if (success) await db.delete(loginAttempts).where(and(eq(loginAttempts.identifier, identifier), eq(loginAttempts.success, false)));
}

export async function isLocked(identifier: string) {
  const threshold = await getSettingNumber("security.lockThreshold", 6);
  const minutes = await getSettingNumber("security.lockMinutes", 15);
  const failures = await recentFailures(identifier, minutes);
  return { locked: failures >= threshold, failures, threshold, minutes };
}

export async function passwordPolicy() {
  const strong = await getSettingBool("security.requireStrongPassword", true);
  return { strong, min: strong ? 8 : 6 };
}
