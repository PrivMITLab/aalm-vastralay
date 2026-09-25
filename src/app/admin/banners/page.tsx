import type { Metadata } from "next";
import { getHomeConfig, getSetting } from "@/lib/settings";
import BannerEditor from "@/components/admin/BannerEditor";

export const metadata: Metadata = { title: "Promotional Banners – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [home, marquee, announcement] = await Promise.all([
    getHomeConfig(),
    getSetting(
      "home.marqueeText",
      "✨ Free Nationwide Shipping on Orders Above ₹999 | Handcrafted Banarasi Silks & Bridal Couture ✨"
    ),
    getSetting(
      "home.announcementText",
      "Festive Wedding Season Sale – Up to 40% Off on Bridal Lehengas & Sherwanis"
    ),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">
            Promotional Banners & Marquee
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Configure homepage hero banners, announcement tickers, and seasonal wedding promotions with real-time preview and universal URL scraping.
          </p>
        </div>
      </header>

      <BannerEditor
        initialBanner={home.banner}
        initialAnnouncement={announcement}
        initialMarquee={marquee}
      />
    </div>
  );
}
