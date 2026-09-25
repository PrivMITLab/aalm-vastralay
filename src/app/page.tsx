import Link from "next/link";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { ArrowRight, BadgePercent, Phone, RotateCcw, ShieldCheck, Sparkles, Store, Wallet } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCategoryParents, getFeaturedProducts, getNavCategories, getNewProducts, getTopStores } from "@/lib/cache";
import ProductCard from "@/components/ProductCard";
import { Rating } from "@/components/Rating";
import Reveal from "@/components/ui/Reveal";
import { resolveImage } from "@/lib/media-resolver";
import { getCommerce, getHomeConfig, getSettingBool, getSettingNumber, getSettings } from "@/lib/settings";
import { formatINR, gridClass } from "@/lib/utils";
import FestiveOccasionsBar from "@/components/home/FestiveOccasionsBar";
import IndiaTrustStrip from "@/components/home/IndiaTrustStrip";

export const revalidate = 120;

const DEFAULT_CATEGORY_ART: Record<string, string> = {
  women: "/images/bridal-lehenga.jpg",
  men: "/images/sherwani.jpg",
  kids: "/images/kids-lehenga.jpg",
  accessories: "/images/dupatta-jewellery.jpg",
};

export default async function HomePage() {
  const [home, settings, commerce, showOccasions, showStores] = await Promise.all([
    getHomeConfig(),
    getSettings(),
    getCommerce(),
    getSettingBool("features.occasions", true),
    getSettingBool("features.storesDirectory", true),
  ]);
  const freeMonths = await getSettingNumber("seller.freeMonths", 6);
  const categoriesLimit = home.sections.find((s) => s.key === "categories")?.limit ?? 4;
  const featuredLimit = home.sections.find((s) => s.key === "featured")?.limit ?? 8;
  const arrivalsLimit = home.sections.find((s) => s.key === "newArrivals")?.limit ?? 8;
  const storeLimit = home.sections.find((s) => s.key === "stores")?.limit ?? 4;
  const sectionOn = (key: string) => home.sections.find((s) => s.key === key)?.enabled ?? false;

  const [topCategories, featured, newArrivals, topStores] = await Promise.all([
    sectionOn("categories") ? getCategoryParents() : Promise.resolve([]),
    sectionOn("featured") ? getFeaturedProducts(featuredLimit) : Promise.resolve([] as Awaited<ReturnType<typeof getFeaturedProducts>>),
    sectionOn("newArrivals") ? getNewProducts(arrivalsLimit) : Promise.resolve([] as Awaited<ReturnType<typeof getNewProducts>>),
    sectionOn("stores") && showStores ? getTopStores(storeLimit) : Promise.resolve([] as Awaited<ReturnType<typeof getTopStores>>),
  ]);
  void getNavCategories; // shared with header via data cache

  const grid = gridClass(home.grid, "gap-3 sm:gap-4");
  const banner = home.banner;
  const freeShippingNote = commerce.freeShippingThreshold > 0 ? `Free delivery above ${formatINR(commerce.freeShippingThreshold)}` : "Free delivery on all orders";

  return (
    <div>
      {/* ---------------- hero banner (luxury royal purple & imperial gold) ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2a0845] via-[#4A148C] to-[#120024] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImage(banner.url || "/brand/poster.png")}
          alt="Aalm Vastralay Couture Showroom"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-top opacity-60 brightness-90 contrast-105 transition-transform duration-1000 ease-out"
        />
        {/* Multi-layered luxury gradient overlay for flawless readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70" />

        <div
          className="relative mx-auto flex max-w-7xl flex-col justify-center px-2.5 sm:px-6 py-8 sm:py-16 lg:py-20"
          style={{ minHeight: `min(${banner.height}px, calc(82vh - 120px))` }}
        >
          <div className="max-w-3xl space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-white/15 bg-black/45 p-4 sm:p-10 backdrop-blur-md shadow-2xl">
            {banner.badge && (
              <span className="inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/15 px-3 py-1 text-[11px] sm:text-xs font-bold tracking-widest text-[#D4AF37] uppercase shadow-sm">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#D4AF37] animate-pulse" /> {banner.badge}
              </span>
            )}

            <h1 className="font-display text-2xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.2] tracking-tight drop-shadow-md">
              <span className="block text-white font-serif">
                {banner.title.includes("—") ? banner.title.split("—")[0]?.trim() : banner.title}
              </span>
              {banner.title.includes("—") && (
                <span className="block bg-gradient-to-r from-[#FDE047] via-[#D4AF37] to-[#F59E0B] bg-clip-text text-transparent font-serif mt-1 text-xl sm:text-4xl lg:text-5xl">
                  — {banner.title.split("—")[1]?.trim()}
                </span>
              )}
            </h1>

            <p className="max-w-2xl text-xs sm:text-base text-slate-200/95 leading-relaxed font-sans">
              {banner.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              {banner.ctaLabel && (
                <Link
                  href={banner.ctaHref || "/products"}
                  className="btn btn-gold w-full sm:w-auto justify-center px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  {banner.ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {banner.cta2Label ? (
                <Link
                  href={banner.cta2Href || "tel:8434061342"}
                  className="btn w-full sm:w-auto justify-center border border-[#D4AF37]/50 bg-black/40 text-amber-200 backdrop-blur hover:bg-[#D4AF37]/20 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-[#D4AF37]" /> {banner.cta2Label}
                </Link>
              ) : (
                <a
                  href="https://wa.me/918434061342?text=Namaste%20Aalm%20Vastralay,%20I%20am%20interested%20in%20your%20bridal/ethnic%20wear%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-full sm:w-auto justify-center border border-[#25D366]/60 bg-[#25D366]/20 text-white backdrop-blur hover:bg-[#25D366]/30 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <span>WhatsApp: 8434061342</span>
                </a>
              )}
            </div>

            {/* Trust feature pills */}
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[11px] sm:text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{commerce.returnWindowDays}-Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">Verified Artisans</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BadgePercent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">{freeShippingNote}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Indian & Bihar festive occasions bar ---------------- */}
      <FestiveOccasionsBar />

      {/* ---------------- categories ---------------- */}
      {sectionOn("categories") && topCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <Reveal className="mb-6 text-center">
            <h2 className="section-title ornament">Shop by Category</h2>
            <p className="mt-1 text-xs text-[color:var(--text-soft)] sm:text-sm">Lehnga · Saree · Sherwani · Dulhan collection — सब कुछ एक जगह</p>
          </Reveal>
          <div className={gridClass({ desktop: Math.min(4, home.grid.desktop + 2), tablet: 4, mobile: 2 }, "gap-3 sm:gap-4")}>
            {topCategories.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <Link href={`/products?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(home.categoryCards[c.slug] ?? DEFAULT_CATEGORY_ART[c.slug] ?? "/images/hero.jpg")}
                    alt={c.name}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <p className="font-display text-base font-semibold sm:text-xl">{c.name}</p>
                    <p className="text-[10px] text-white/80 sm:text-xs">Explore collection →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- occasions ---------------- */}
      {sectionOn("occasions") && showOccasions && home.occasions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4">
          <div className="card flex flex-wrap items-center gap-2 px-4 py-3">
            <span className="text-xs font-semibold text-[color:var(--brand)] sm:text-sm">Shop by occasion:</span>
            {home.occasions.map((o) => (
              <Link key={o} href={`/products?q=${encodeURIComponent(o.toLowerCase())}`} className="chip">
                {o}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- featured ---------------- */}
      {sectionOn("featured") && featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <Reveal className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="section-title">Featured Picks</h2>
              <p className="text-xs text-[color:var(--text-soft)] sm:text-sm">Handpicked bestsellers loved by our brides &amp; grooms</p>
            </div>
            <Link href="/products?sort=rating" className="shrink-0 text-sm font-semibold text-[color:var(--brand)] hover:underline">
              View all →
            </Link>
          </Reveal>
          <div className={grid}>
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 50}>
                <ProductCard product={product} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Clean Catalogue Warm State (when 0 products) ---------------- */}
      {featured.length === 0 && newArrivals.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="rounded-3xl border border-cream-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-8 text-center shadow-xs">
            <span className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-maroon-50 text-maroon-700 dark:bg-maroon-950/80 dark:text-amber-300">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-display text-xl font-bold text-slate-800 dark:text-zinc-100">
              शादी व फेस्टिव कलेक्शन जल्द आ रहा है (New Collection Launching Soon)
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Master weavers and designer boutiques are curating fresh authentic handlooms. Add your own boutique or explore categories!
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn btn-outline text-xs">
                Browse Categories
              </Link>
              <Link href="/onboarding" className="btn btn-primary text-xs">
                Start Selling (दुकानदार जुड़ें)
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Indian Authenticity & Trust Badges Strip ---------------- */}
      <IndiaTrustStrip />

      {/* ---------------- seller CTA ---------------- */}
      {sectionOn("sellerCta") && (
        <section className="mx-auto max-w-7xl px-4">
          <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--brand)] to-black px-5 py-10 text-white sm:px-8 md:px-12">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[color:var(--accent)]/25 blur-2xl" />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[color:var(--accent)] uppercase">For boutiques, weavers &amp; designers</p>
                <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl md:text-4xl">Sell on {settings["site.name"]} with {freeMonths} months 0% commission</h2>
                <p className="mt-3 text-sm text-white/85 sm:text-base">
                  Unlimited free listings, COD support, courier or self-ship, and a seller dashboard with live stock and order tracking. After {freeMonths} months you pay
                  just {settings["seller.commissionPercent"]}% per order.
                </p>
                <Link href="/onboarding" className="btn btn-gold mt-6">
                  <Store className="h-4 w-4" /> Start selling – it&apos;s free
                </Link>
              </div>
              <ul className="grid gap-3 text-sm">
                {[
                  ["0% commission", `for your first ${freeMonths} months, then ${settings["seller.commissionPercent"]}%`],
                  ["No listing fees", "unlimited products, sizes, colours & video"],
                  ["COD + UPI + cards", "we handle payments and reconciliation"],
                  ["Seller dashboard", "orders, stock, tracking & payouts in one place"],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <BadgePercent className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                    <span>
                      <span className="font-semibold">{t}</span> <span className="text-white/80">— {d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------------- new arrivals ---------------- */}
      {sectionOn("newArrivals") && newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <Reveal className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-xs text-[color:var(--text-soft)] sm:text-sm">Fresh from the looms and ateliers this week</p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-[color:var(--brand)] hover:underline">
              View all →
            </Link>
          </Reveal>
          <div className={grid}>
            {newArrivals.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 50}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- stores ---------------- */}
      {sectionOn("stores") && showStores && topStores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6">
          <Reveal className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="section-title">Trusted Stores</h2>
              <p className="text-xs text-[color:var(--text-soft)] sm:text-sm">Family-run boutiques and weaver collectives across India</p>
            </div>
            <Link href="/stores" className="shrink-0 text-sm font-semibold text-[color:var(--brand)] hover:underline">
              All stores →
            </Link>
          </Reveal>
          <div className={gridClass({ desktop: 4, tablet: 2, mobile: 1 }, "gap-4")}>
            {topStores.map((store) => (
              <Reveal key={store.id}>
                <Link href={`/stores/${store.slug}`} className="card card-hover group block overflow-hidden">
                  <div className="h-28 overflow-hidden bg-[color:var(--surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImage(store.bannerUrl)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-semibold text-[color:var(--brand)]">{store.storeName}</p>
                    <p className="text-xs text-[color:var(--text-soft)]">
                      {store.city}, {store.state}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <Rating value={store.rating} />
                      <span className="text-[color:var(--text-soft)]">{store.productCount} products</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
