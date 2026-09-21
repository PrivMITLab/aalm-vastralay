import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { cart, notifications, wishlist } from "@/db/schema";
import { getNavCategories } from "@/lib/cache";
import { getCurrentUser } from "@/lib/auth";
import { getBrand, getCommerce, getSettingBool, getSettings } from "@/lib/settings";
import HeaderNav from "./header/HeaderNav";

export default async function Header() {
  const user = await getCurrentUser();
  const [brand, settings, showWishlist, showNotifications, showSellerHub, commerce] = await Promise.all([
    getBrand(),
    getSettings(),
    getSettingBool("features.wishlist", true),
    getSettingBool("features.notifications", true),
    getSettingBool("features.sellerHub", true),
    getCommerce(),
  ]);

  const nav = await getNavCategories();

  let cartCount = 0;
  let wishCount = 0;
  let unread = 0;
  if (user) {
    try {
      const [[c], [w], [n]] = await Promise.all([
        db.select({ n: sql<number>`coalesce(sum(${cart.quantity}), 0)::int` }).from(cart).where(eq(cart.userId, user.id)),
        showWishlist ? db.select({ n: sql<number>`count(*)::int` }).from(wishlist).where(eq(wishlist.userId, user.id)) : Promise.resolve([{ n: 0 }]),
        showNotifications
          ? db
              .select({ n: sql<number>`count(*)::int` })
              .from(notifications)
              .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))
          : Promise.resolve([{ n: 0 }]),
      ]);
      cartCount = c?.n ?? 0;
      wishCount = w?.n ?? 0;
      unread = n?.n ?? 0;
    } catch {
      /* DB offline fallback */
    }
  }

  const announcements = brand.announcements;
  const marqueeItems = announcements.length ? [...announcements, ...announcements] : [];
  const trustLine = [
    `${settings["seller.freeMonths"]} months 0% commission`,
    "Cash on Delivery",
    `${commerce.returnWindowDays}-day easy returns`,
    commerce.freeShippingThreshold > 0 ? `Free delivery above ₹${commerce.freeShippingThreshold}` : "Free delivery",
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 shadow-sm backdrop-blur">
      <div className="marquee-wrap overflow-hidden bg-[color:var(--brand)] py-1.5 text-[color:var(--brand-fg)]">
        {announcements.length > 0 ? (
          <div className="marquee-track" style={{ "--marquee-duration": `${brand.announcementSpeed}s` } as React.CSSProperties}>
            {marqueeItems.map((a, i) => (
              <span key={`${a}-${i}`} className="text-[11px] tracking-wide sm:text-xs">
                {a}
                <span className="mx-6 text-[color:var(--accent)]">◆</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-center text-[11px] sm:text-xs">{trustLine.join(" · ")}</p>
        )}
      </div>

      <HeaderNav
        categories={nav}
        user={user ? { fullName: user.fullName, email: user.email, role: user.role } : null}
        cartCount={cartCount}
        wishCount={wishCount}
        unread={unread}
        brandName={brand.name}
        logoText={brand.logoText}
        logoUrl={brand.logoUrl}
        logoSvg={settings["brand.logoSvg"] !== "false"}
        showWishlist={showWishlist}
        showNotifications={showNotifications}
        showSellerHub={showSellerHub}
        showThemeToggle={settings["theme.allowUserToggle"] === "true"}
        announcementCount={announcements.length}
      />
    </header>
  );
}
