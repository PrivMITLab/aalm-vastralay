"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState } from "react";
import { saveStore } from "@/actions/seller";
import SubmitButton from "@/components/SubmitButton";
import type { Store } from "@/db/schema";

export default function StoreForm({ store, states }: { store?: Store | null; states: string[] }) {
  const [state, action] = useActionState(saveStore, null);
  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="storeName">
          Store name
        </label>
        <input id="storeName" name="storeName" className="input" defaultValue={store?.storeName ?? ""} placeholder="e.g. Rajwada Couture" required minLength={3} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">
          About your store
        </label>
        <textarea id="description" name="description" className="input" defaultValue={store?.description ?? ""} placeholder="What do you make or sell? Where are you based? What makes your pieces special?" maxLength={1000} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="address">
          Pickup address
        </label>
        <input id="address" name="address" className="input" defaultValue={store?.address ?? ""} placeholder="Shop no., street, area" />
      </div>
      <div>
        <label className="label" htmlFor="city">
          City
        </label>
        <input id="city" name="city" className="input" defaultValue={store?.city ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor="state">
          State
        </label>
        <select id="state" name="state" className="input" defaultValue={store?.state ?? ""} required>
          <option value="" disabled>
            Select state
          </option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="pincode">
          Pincode
        </label>
        <input id="pincode" name="pincode" className="input" defaultValue={store?.pincode ?? ""} required pattern="[0-9]{6}" inputMode="numeric" />
      </div>
      <div>
        <label className="label" htmlFor="gstNumber">
          GSTIN (optional)
        </label>
        <input id="gstNumber" name="gstNumber" className="input uppercase" defaultValue={store?.gstNumber ?? ""} placeholder="15-character GST number" maxLength={15} />
      </div>
      <div>
        <label className="label" htmlFor="logoUrl">
          Logo image URL (optional)
        </label>
        <input id="logoUrl" name="logoUrl" className="input" defaultValue={store?.logoUrl ?? ""} placeholder="https://… or ik:path/logo.png" />
      </div>
      <div>
        <label className="label" htmlFor="bannerUrl">
          Banner image URL (optional)
        </label>
        <input id="bannerUrl" name="bannerUrl" className="input" defaultValue={store?.bannerUrl ?? ""} placeholder="https://… or ik:path/banner.jpg" />
      </div>

      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">{state.success}</p>}

      <div className="sm:col-span-2">
        <SubmitButton pendingText="Saving…">{store ? "Save store details" : "Create my store"}</SubmitButton>
      </div>
    </form>
  );
}