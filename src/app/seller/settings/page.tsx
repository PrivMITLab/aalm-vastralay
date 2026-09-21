import type { Metadata } from "next";
import { getSellerContext } from "@/lib/seller";
import { INDIAN_STATES } from "@/lib/utils";
import StoreForm from "@/components/seller/StoreForm";
import PhotoUploader from "@/components/account/PhotoUploader";

export const metadata: Metadata = { title: "Store settings" };

export default async function SellerSettingsPage() {
  const { store } = await getSellerContext();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Store settings</h1>
        <p className="text-sm text-slate-600">
          Storefront URL: <span className="font-mono">/stores/{store.slug}</span>
        </p>
      </div>
      <section className="card space-y-5 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <PhotoUploader endpoint="/api/uploads/logo" initialUrl={store.logoUrl} name="Logo" alt={store.storeName + " logo"} size={104} rounded="lg" extraPayload={{ kind: "logo" }} />
          <PhotoUploader endpoint="/api/uploads/logo" initialUrl={store.bannerUrl} name="Banner" alt={store.storeName + " banner"} size={104} rounded="lg" extraPayload={{ kind: "banner" }} />
          <p className="text-xs text-[color:var(--text-soft)] sm:max-w-sm">
            Logo is shown on your storefront card and on the product page header. Banner is the wide image at the top of /stores/{store.slug}.
            Use a 16:5 banner and a square logo. JPG, PNG, WebP, AVIF or SVG · max 5 MB.
          </p>
        </div>
        <hr className="border-[color:var(--border)]" />
        <StoreForm store={store} states={INDIAN_STATES} />
      </section>
    </div>
  );
}
