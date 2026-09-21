import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireUser } from "./auth";

/** Resolves the signed-in seller and their store; redirects to onboarding when no store exists. */
export const getSellerContext = cache(async () => {
  const user = await requireUser("/seller");
  const [store] = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  if (!store) redirect("/onboarding");
  return { user, store };
});

import { getSettingNumber } from "./settings";

export const COMMISSION_FREE_MONTHS = 6;

/** Commission schedule is fully admin-configurable. */
export async function commissionInfo(storeCreatedAt: Date) {
  const months = await getSettingNumber("seller.freeMonths", COMMISSION_FREE_MONTHS);
  const rate = await getSettingNumber("seller.commissionPercent", 2.5);
  const freeUntil = new Date(storeCreatedAt);
  freeUntil.setMonth(freeUntil.getMonth() + Math.max(0, Math.round(months)));
  const isFree = freeUntil.getTime() > Date.now();
  return { freeUntil, isFree, rate: isFree ? 0 : rate, months, postRate: rate };
}
