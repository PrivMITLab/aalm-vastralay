"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState } from "react";
import { createCategory, createCoupon } from "@/actions/admin";
import SubmitButton from "@/components/SubmitButton";

export function CouponForm() {
  const [state, action] = useActionState(createCoupon, null);
  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="code" className="input uppercase" placeholder="Code e.g. DIWALI20" required minLength={3} maxLength={20} />
      <select name="discountType" className="input" defaultValue="percentage">
        <option value="percentage">Percentage %</option>
        <option value="fixed">Fixed ₹</option>
      </select>
      <input name="discountValue" type="number" step="0.01" min={1} className="input" placeholder="Discount value" required />
      <input name="minOrderValue" type="number" step="1" min={0} className="input" placeholder="Min order value (₹)" />
      <input name="maxDiscount" type="number" step="1" min={1} className="input" placeholder="Max discount (₹, optional)" />
      <input name="usageLimit" type="number" step="1" min={1} className="input" placeholder="Usage limit (optional)" />
      <div className="sm:col-span-2">
        <label className="label">Valid until (optional)</label>
        <input name="validUntil" type="date" className="input" />
      </div>
      {state?.error && <p className="text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-700 sm:col-span-2">{state.success}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Creating…">Create coupon</SubmitButton>
      </div>
    </form>
  );
}

export function CategoryForm({ parents }: { parents: { id: string; name: string }[] }) {
  const [state, action] = useActionState(createCategory, null);
  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="flex flex-wrap gap-2">
      <input name="name" className="input flex-1" placeholder="New category name" required minLength={2} />
      <select name="parentId" className="input w-48" defaultValue="">
        <option value="">Top level</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            Under {p.name}
          </option>
        ))}
      </select>
      <SubmitButton pendingText="Adding…">Add</SubmitButton>
      {state?.error && <p className="w-full text-sm text-rose-700">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-emerald-700">{state.success}</p>}
    </form>
  );
}