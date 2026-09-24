import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { CheckCircle2, Plus, Tag, XCircle } from "lucide-react";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { createCouponDirect, toggleCoupon } from "@/actions/admin";
import { formatDate, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Coupons & Discounts – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  let couponList: (typeof coupons.$inferSelect)[] = [];
  try {
    couponList = await db.select().from(coupons).orderBy(desc(coupons.isActive), desc(coupons.code));
  } catch (err) {
    console.warn("[AdminCoupons] DB error:", err instanceof Error ? err.message : err);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Coupons & Discounts</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Create promotional voucher codes, set minimum cart thresholds, and configure discount limits.
          </p>
        </div>
      </header>

      {/* Create Coupon Form */}
      <div className="card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--accent)] mb-3">
          Create New Discount Coupon
        </h2>
        <form action={createCouponDirect} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Coupon Code</label>
            <input
              type="text"
              name="code"
              required
              placeholder="e.g. WEDDING20"
              className="input w-full uppercase font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Discount Type</label>
            <select name="discountType" className="input w-full text-sm bg-[color:var(--surface)]">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Discount Value</label>
            <input
              type="number"
              name="discountValue"
              required
              min="1"
              placeholder="e.g. 20 (for 20% or ₹20)"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Min Order Value (₹)</label>
            <input
              type="number"
              name="minOrderValue"
              defaultValue="0"
              placeholder="0 for no minimum"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Max Discount Cap (₹)</label>
            <input
              type="number"
              name="maxDiscount"
              placeholder="Optional cap for %"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              placeholder="Unlimited if empty"
              className="input w-full text-sm"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" className="btn btn-primary text-sm flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Create Coupon
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="card overflow-hidden">
        {couponList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Tag className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No active coupons</p>
            <p className="text-xs text-[color:var(--text-soft)]">Create your first promotional discount voucher above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Benefit</th>
                  <th className="px-4 py-3">Thresholds</th>
                  <th className="px-4 py-3">Redemptions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {couponList.map((c) => (
                  <tr key={c.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[color:var(--brand)] bg-[color:var(--surface-2)] px-2 py-1 rounded-md border border-[color:var(--border)]">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[color:var(--text)]">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `${formatINR(c.discountValue)} FLAT OFF`}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                      <div>Min order: {formatINR(c.minOrderValue)}</div>
                      {c.maxDiscount && <div>Max cap: {formatINR(c.maxDiscount)}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                      {c.usedCount} used {c.usageLimit ? `/ ${c.usageLimit} max` : "(Unlimited)"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {c.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={toggleCoupon} className="inline-block">
                        <input type="hidden" name="couponId" value={c.id} />
                        <button
                          type="submit"
                          className={`btn py-1 px-2.5 text-xs ${
                            c.isActive
                              ? "btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                              : "btn-primary bg-emerald-700 hover:bg-emerald-800 text-white"
                          }`}
                        >
                          {c.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
