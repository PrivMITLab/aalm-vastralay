import type { Metadata } from "next";
import { Image as ImageIcon, Megaphone, Sparkles } from "lucide-react";
import { getHomeConfig, getSetting } from "@/lib/settings";
import { updateSettingsDirect } from "@/actions/admin";

export const metadata: Metadata = { title: "Promotional Banners – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [home, marquee, announcement] = await Promise.all([
    getHomeConfig(),
    getSetting("home.marqueeText", "✨ Free Nationwide Shipping on Orders Above ₹999 | Handcrafted Banarasi Silks & Bridal Couture ✨"),
    getSetting("home.announcementText", "Festive Wedding Season Sale – Up to 40% Off on Bridal Lehengas & Sherwanis"),
  ]);

  const banner = home.banner;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Promotional Banners & Marquee</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Configure homepage hero banners, announcement tickers, and seasonal wedding promotions.
          </p>
        </div>
      </header>

      {/* Live Preview Card */}
      <div className="card overflow-hidden">
        <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Live Hero Banner Preview
        </div>
        <div className="relative min-h-[220px] bg-slate-900 p-6 sm:p-10 flex flex-col justify-center overflow-hidden">
          <img
            src={banner.url || "/brand/poster.png"}
            alt="Preview"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-900/60 to-transparent" />
          <div className="relative z-10 max-w-lg space-y-2 text-white">
            <span className="inline-block rounded-full bg-[color:var(--accent)] px-3 py-0.5 text-xs font-bold text-slate-950">
              {banner.badge || "KALYANIPUR FLAGSHIP"}
            </span>
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-white">
              {banner.title || "Wedding & Ethnic Couture"}
            </h2>
            <p className="text-xs text-slate-200 line-clamp-2">
              {banner.subtitle || "Handcrafted Banarasi Sarees, Bridal Lehengas & Regal Sherwanis."}
            </p>
            <div className="pt-2">
              <span className="inline-flex rounded-xl bg-[color:var(--accent)] px-4 py-1.5 text-xs font-semibold text-slate-950">
                {banner.ctaLabel || "Explore Collection"} →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Configuration Form */}
      <div className="card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand)] mb-4 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-[color:var(--accent)]" /> Hero Banner Settings
        </h2>
        <form action={updateSettingsDirect} className="space-y-4">
          <input type="hidden" name="__group" value="home" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Badge Text
              </label>
              <input
                type="text"
                name="home.bannerBadge"
                defaultValue={banner.badge}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Image URL
              </label>
              <input
                type="text"
                name="home.bannerUrl"
                defaultValue={banner.url}
                className="input w-full text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Main Title
              </label>
              <input
                type="text"
                name="home.bannerTitle"
                defaultValue={banner.title}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Subtitle
              </label>
              <input
                type="text"
                name="home.bannerSubtitle"
                defaultValue={banner.subtitle}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Button CTA Text
              </label>
              <input
                type="text"
                name="home.bannerCtaLabel"
                defaultValue={banner.ctaLabel}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Button CTA Link URL
              </label>
              <input
                type="text"
                name="home.bannerCtaHref"
                defaultValue={banner.ctaHref}
                className="input w-full text-sm font-mono"
              />
            </div>
          </div>

          <hr className="my-4 border-[color:var(--border)]" />

          <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand)] flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Announcement & Marquee Ticker
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Top Announcement Bar
              </label>
              <input
                type="text"
                name="home.announcementText"
                defaultValue={announcement}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Scrolling Marquee Ticker
              </label>
              <input
                type="text"
                name="home.marqueeText"
                defaultValue={marquee}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary text-sm px-6">
              Save Banner Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
