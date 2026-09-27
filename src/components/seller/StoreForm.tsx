"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useMemo, useState } from "react";
import { saveStore } from "@/actions/seller";
import SubmitButton from "@/components/SubmitButton";
import { resolveImage, sanitizeImageUrl } from "@/lib/image-resolver";
import type { Store } from "@/db/schema";

export default function StoreForm({ store, states }: { store?: Store | null; states: string[] }) {
  const [state, action] = useActionState(saveStore, null);
  const [logoVal, setLogoVal] = useState(store?.logoUrl ?? "");
  const [bannerVal, setBannerVal] = useState(store?.bannerUrl ?? "");

  const safeLogo = useMemo(() => {
    if (!logoVal.trim()) return "";
    return sanitizeImageUrl(resolveImage(logoVal));
  }, [logoVal]);

  const safeBanner = useMemo(() => {
    if (!bannerVal.trim()) return "";
    return sanitizeImageUrl(resolveImage(bannerVal));
  }, [bannerVal]);
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
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="logoUrl">
            Logo image URL (optional)
          </label>
          {logoVal && (
            <span className="text-[10px] text-amber-500 font-medium">Live preview</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            id="logoUrl"
            name="logoUrl"
            className="input flex-1"
            value={logoVal}
            onChange={(e) => setLogoVal(e.target.value)}
            placeholder="https://… or ik:path/logo.png"
          />
          {safeLogo && (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeLogo}
                alt="Logo preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                }}
              />
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-[color:var(--text-soft)]">
          Supports: Google Drive, Dropbox, OneDrive, ImageKit (ik:...), Backblaze (b2:...), or any direct https:// image URL.
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="bannerUrl">
            Banner image URL (optional)
          </label>
          {safeBanner && (
            <span className="text-[10px] text-amber-500 font-medium">Live preview</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            id="bannerUrl"
            name="bannerUrl"
            className="input flex-1"
            value={bannerVal}
            onChange={(e) => setBannerVal(e.target.value)}
            placeholder="https://… or ik:path/banner.jpg"
          />
          {safeBanner && (
            <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeBanner}
                alt="Banner preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                }}
              />
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-[color:var(--text-soft)]">
          Supports: Google Drive, Dropbox, OneDrive, ImageKit (ik:...), Backblaze (b2:...), or any direct https:// image URL.
        </p>
      </div>

      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">{state.success}</p>}

      <div className="sm:col-span-2">
        <SubmitButton pendingText="Saving…">{store ? "Save store details" : "Create my store"}</SubmitButton>
      </div>
    </form>
  );
}