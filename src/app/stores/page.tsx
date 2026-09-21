import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { BadgeCheck, MapPin, Package, ShieldCheck, ShoppingBag, Store as StoreIcon } from "lucide-react";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { Rating } from "@/components/Rating";
import { resolveImage } from "@/lib/media-resolver";
import { getSettingNumber } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Boutiques & Stores – Verified Artisan Collectives",
  description: "Explore curated boutiques, designer labels and textile weaver collectives selling directly on Aalm Vastralay.",
};

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const freeMonths = await getSettingNumber("seller.freeMonths", 6);
  const { q } = (await searchParams) ?? {};
  const query = q?.trim().toLowerCase() ?? "";

  const rows = await db
    .select({
      store: stores,
      productCount: sql<number>`(select count(*) from products p where p.store_id = stores.id and p.is_active = true)::int`,
    })
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(desc(stores.rating), desc(stores.totalSales))
    .catch(() => []);

  const filtered = query
    ? rows.filter(
        ({ store }) =>
          store.storeName.toLowerCase().includes(query) ||
          store.city?.toLowerCase().includes(query) ||
          store.state?.toLowerCase().includes(query) ||
          store.description?.toLowerCase().includes(query),
      )
    : rows;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand)]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% GST Verified Boutiques
        </span>
        <h1 className="section-title ornament mt-3 text-3xl font-bold tracking-tight text-[color:var(--brand)] sm:text-4xl">
          Artisan Boutiques & Designer Stores
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[color:var(--text-muted)] sm:text-base">
          Direct from weavers of Varanasi, bridal boutiques of Chandni Chowk, and designers across India. Zero middlemen, authentic craftsmanship.
        </p>

        {/* Store search filter */}
        <form className="mx-auto mt-6 flex max-w-md items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] p-1 shadow-sm">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search stores by name, city or craft…"
            className="w-full bg-transparent px-4 text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-soft)]"
          />
          <button type="submit" className="btn btn-primary btn-sm shrink-0">
            Search
          </button>
        </form>
      </div>

      {filtered.length === 0 ? (
        <div className="card my-8 p-12 text-center">
          <StoreIcon className="mx-auto h-12 w-12 text-[color:var(--text-soft)]" />
          <p className="mt-3 font-display text-lg font-semibold text-[color:var(--text)]">No stores found</p>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Try searching for another city, boutique name or clear filter.</p>
          <Link href="/stores" className="btn btn-outline btn-sm mt-4">
            View All Stores
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ store, productCount }) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="card group flex flex-col overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-300 hover:border-[color:var(--brand)] hover:shadow-xl"
            >
              <div className="relative h-40 overflow-hidden bg-[color:var(--surface-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImage(store.bannerUrl || "/images/hero.jpg", { width: 600 })}
                  alt={`${store.storeName} banner`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-2 border-white/60 bg-[color:var(--brand)] font-display text-2xl font-bold text-[color:var(--accent)] shadow-lg">
                  {store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImage(store.logoUrl, { width: 128 })} alt="" className="h-full w-full object-cover" />
                  ) : (
                    store.storeName.slice(0, 1)
                  )}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[color:var(--text)] group-hover:text-[color:var(--brand)]">
                      {store.storeName}
                    </h2>
                    {(store.city || store.state) && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                        <MapPin className="h-3 w-3 text-[color:var(--accent)]" /> {store.city ? `${store.city}, ` : ""}{store.state}
                      </p>
                    )}
                  </div>
                  <Rating value={store.rating} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {store.description || "Curated bridal wear, handloom sarees, and traditional occasion attire."}
                </p>

                <div className="mt-auto border-t border-[color:var(--border)] pt-4">
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-soft)]">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Package className="h-3.5 w-3.5 text-[color:var(--brand)]" /> {productCount} products
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <ShoppingBag className="h-3.5 w-3.5 text-[color:var(--brand)]" /> {store.totalSales} orders
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Become a seller promotional card */}
      <div className="mt-14 rounded-3xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] p-8 text-center shadow-sm sm:p-10">
        <span className="inline-block rounded-full bg-[color:var(--brand-soft)] px-3.5 py-1 text-xs font-semibold text-[color:var(--brand)]">
          Partner with India&apos;s ethnic marketplace
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold text-[color:var(--brand)] sm:text-3xl">
          Own a boutique, designer studio or handloom collective?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[color:var(--text-muted)] sm:text-base">
          Sell directly to thousands of bridal wear shoppers nationwide. Enjoy 0% commission for the first {freeMonths} months, instant settlements, and automated delivery pickup.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/onboarding" className="btn btn-primary">
            Open Your Store (Free)
          </Link>
          <Link href="/seller" className="btn btn-outline">
            Explore Seller Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
