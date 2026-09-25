import type { Metadata } from "next";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import BroadcastManager from "@/components/admin/BroadcastManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Marketing & Broadcasts — Admin Panel",
};

export default async function AdminMarketingPage() {
  const admin = await requireRole(["admin"], "/admin/marketing");

  const couponRows = await db
    .select({
      code: coupons.code,
      discountType: coupons.discountType,
      discountValue: coupons.discountValue,
    })
    .from(coupons)
    .where(eq(coupons.isActive, true))
    .orderBy(coupons.code)
    .limit(20);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 overflow-x-clip px-4 py-8 sm:px-6">
      <div className="flex min-w-0 items-center justify-between gap-3 overflow-hidden">
        <div className="min-w-0 flex-1">
          <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
            Campaigns & Offers
          </p>
          <h1 className="font-display min-w-0 flex-1 truncate text-xl font-semibold text-maroon-900 sm:text-2xl lg:text-3xl">
            1-Click Marketing Broadcast Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Send festival offers, coupon discounts, and new arrivals via Email, In-App Notifications, and Web Push.
          </p>
        </div>
      </div>

      <BroadcastManager
        adminEmail={admin.email}
        activeCoupons={couponRows.map((c) => ({
          code: c.code,
          discountType: c.discountType,
          discountValue: Number(c.discountValue),
        }))}
      />
    </div>
  );
}
