import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cart } from "@/db/schema";
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
      /**
       * Single Neon round-trip: cart sum + wishlist count + unread notifications.
       * Correlated subqueries run inside Postgres — saves 2 WebSocket connections per auth page.
       */
      const [row] = await db
        .select({
          cartCount: sql<number>`coalesce(sum(${cart.quantity}), 0)::int`,
          wishCount: sql<number>`(
            select count(*)::int from wishlist w
            where w.user_id = ${user.id}
          )`,
          unread: sql<number>`(
            select count(*)::int from notifications n
            where n.user_id = ${user.id} and n.is_read = false
          )`,
        })
        .from(cart)
        .where(eq(cart.userId, user.id));
      cartCount = row?.cartCount ?? 0;
      wishCount = showWishlist ? (row?.wishCount ?? 0) : 0;
      unread = showNotifications ? (row?.unread ?? 0) : 0;
    } catch {
      /* DB offline fallback — counts stay 0 */
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
      <div className="marquee-wrap group overflow-hidden bg-gradient-to-r from-[#7a1f2b] via-[#9a2a45] to-[#7a1f2b] py-1.5">
        {announcements.length > 0 ? (
          <div className="marquee-track" style={{ "--marquee-duration": `${brand.announcementSpeed}s` } as React.CSSProperties}>
            {marqueeItems.map((a, i) => (
              <span key={`${a}-${i}`} title={a} className="max-w-[80vw] truncate text-[12px] font-medium tracking-wide text-[#f4e2a3] sm:text-[13px]">
                {a}
                <span className="mx-6 text-[#D4AF37]">◆</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="truncate px-4 text-center text-[12px] font-medium tracking-wide text-[#f4e2a3] sm:text-[13px]">{trustLine.join(" · ")}</p>
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
