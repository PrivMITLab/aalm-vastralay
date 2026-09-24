import { cache } from "react";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 👑 AALM VASTRALAY — CACHED AUTHENTICATION HELPERS
 * Uses React cache() to deduplicate user authentication queries across
 * multiple Server Components within a single HTTP request lifecycle.
 * Eliminates duplicate database queries for the current user during SSR.
 */

export const getAuthUser = cache(async (): Promise<User | null> => {
  const { getCurrentUser } = await import("./full");
  return getCurrentUser();
});

export const getCurrentUser = getAuthUser;

/**
 * Request-deduped user profile retriever by id.
 */
export const getCachedUserProfile = cache(async (userId: string): Promise<User | null> => {
  if (!userId || !userId.trim()) return null;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
});
