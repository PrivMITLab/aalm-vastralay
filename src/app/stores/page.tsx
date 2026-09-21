import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { MapPin, Store as StoreIcon } from "lucide-react";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { Rating } from "@/components/Rating";
import { resolveImage } from "@/lib/media-resolver";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All Stores" };

export default async function StoresPage() {
  const rows = await db
    .select({
      store: stores,
      productCount: sql<number>`(select count(*) from products p where p.store_id = stores.id and p.is_active = true)::int`,
    })
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(desc(stores.rating), desc(stores.totalSales));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="section-title ornament">Our Stores</h1>
        <p className="mt-2 text-sm text-slate-600">Boutiques, weaver collectives and designers selling directly to you – zero middlemen.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ store, productCount }) => (
          <Link key={store.id} href={`/stores/${store.slug}`} className="card group overflow-hidden">
            <div className="relative h-36 overflow-hidden bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(store.bannerUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute bottom-3 left-4 grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-maroon-700 font-display text-xl text-gold-300 shadow">
                {store.storeName.slice(0, 1)}
              </span>
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-semibold text-maroon-900">{store.storeName}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" /> {store.city}, {store.state}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{store.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <Rating value={store.rating} />
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <StoreIcon className="h-3 w-3" /> {productCount} products · {store.totalSales} orders
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-12 rounded-3xl border border-dashed border-maroon-300 bg-maroon-50 p-8 text-center">
        <p className="font-display text-2xl font-semibold text-maroon-900">Own a boutique or weave textiles?</p>
        <p className="mt-1 text-sm text-slate-600">Open your store in 2 minutes. 0% commission for the first 6 months.</p>
        <Link href="/onboarding" className="btn btn-primary mt-4">
          Become a Seller
        </Link>
      </div>
    </div>
  );
}
