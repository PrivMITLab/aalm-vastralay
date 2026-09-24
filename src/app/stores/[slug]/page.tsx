import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { BadgeCheck, MapPin, Package, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import ProductCard from "@/components/ProductCard";

import Reveal from "@/components/ui/Reveal";
import { resolveImage } from "@/lib/media-resolver";
import { getHomeConfig } from "@/lib/settings";
import { formatDay, gridClass } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [store] = await db.select({ name: stores.storeName, description: stores.description, banner: stores.bannerUrl }).from(stores).where(eq(stores.slug, slug)).limit(1);
  if (!store) return { title: "Store not found" };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return {
    title: `${store.name} – Store`,
    description: store.description ?? undefined,
    openGraph: {
      title: store.name,
      description: store.description ?? undefined,
      images: [{ url: `${base}/og?title=${encodeURIComponent(store.name)}&subtitle=${encodeURIComponent("Verified store on Aalm Vastralay")}` }],
    },
  };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [store] = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  if (!store || !store.isActive) notFound();
  const home = await getHomeConfig();

  const items = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, store.id), eq(products.isActive, true)))
    .orderBy(desc(products.isFeatured), desc(products.rating), desc(products.createdAt));

  // Auto-derive a banner only when the seller never set one — use a COLLAGE of their own products
  const collage = items.slice(0, 4).map((p) => p.images[0]).filter(Boolean);
  const banner = store.bannerUrl?.trim() || collage[0] || "/images/hero.jpg";

  return (
    <div className="pb-10">
      {/* Banner with identity INSIDE the overlay so text never collides with content below */}
      <section className="relative isolate overflow-hidden bg-maroon-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolveImage(banner, { width: 1600 })} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-maroon-900 via-maroon-900/75 to-maroon-900/30" />
        <div className="mx-auto flex max-w-7xl flex-col justify-end gap-4 px-4 pt-16 pb-8 sm:pt-20 md:min-h-72 md:pb-10">
          <div className="flex items-end gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white/20 bg-maroon-700 font-display text-3xl text-gold-300 shadow-xl md:h-24 md:w-24">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImage(store.logoUrl, { width: 256 })} alt="" className="h-full w-full object-cover" />
              ) : (
                store.storeName.slice(0, 1)
              )}
            </span>
            <div className="min-w-0 pb-1 text-white">
              <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                {store.storeName}
                <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-400" aria-label="Verified store" />
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {store.city}, {store.state}
                </span>
                <span className="inline-flex items-center gap-1 [&_*]:!text-white/85">
                  <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {Number(store.rating ?? 0).toFixed(1)} store rating
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" /> {store.totalSales} orders
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {items.length} products
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {store.description && (
          <div className="mt-6 grid gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">{store.description}</p>
            <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Store since {formatDay(store.createdAt)}
            </p>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Products</h2>
            <Link href={`/products?store=${store.slug}`} className="shrink-0 text-sm font-semibold text-[color:var(--brand)] hover:underline">
              Search within store →
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="card p-8 text-center text-sm text-[color:var(--text-soft)]">This store hasn&apos;t listed any products yet.</p>
          ) : (
            <div className={gridClass(home.grid, "gap-3 sm:gap-4")}>
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 40}>
                  <ProductCard product={{ ...p, storeName: store.storeName }} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
