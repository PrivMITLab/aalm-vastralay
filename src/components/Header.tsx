import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cart } from "@/db/schema";
import { getNavCategories } from "@/lib/cache";
import { getCurrentUser } from "@/lib/auth";
import { getBrand, getCommerce, getSettingBool, getSettings } from "@/lib/settings";
import HeaderNav from "./header/HeaderNav";
import AnnouncementMessage from "./header/AnnouncementMessage";

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

  const announcements = brand.announcements.length > 0
    ? brand.announcements
    : [
        settings["home.announcementText"],
        settings["home.marqueeText"],
        "बेहतरीन क्वालिटी, उचित मूल्य — आपकी पसंद, हमारी पहचान",
        "साड़ी, सूट, लहंगा एवं फैब्रिक्स का संपूर्ण कलेक्शन",
        "हर अंदाज आपके लिए खास — Royal Indian Wedding & Luxury Ethnic Wear",
        "Customer Support Available · Call / WhatsApp for Assistance",
      ].filter(Boolean) as string[];

  // Repeat enough times so each half spans full viewport, ensuring continuous gapless 50% loop
  const loopCount = Math.max(3, Math.ceil(6 / Math.max(1, announcements.length)));
  const singleHalf = Array.from({ length: loopCount }).flatMap(() => announcements);
  const marqueeItems = [...singleHalf, ...singleHalf];

  const trustLine = [
    `${settings["seller.freeMonths"]} months 0% commission`,
    "Cash on Delivery",
    `${commerce.returnWindowDays}-day easy returns`,
    commerce.freeShippingThreshold > 0 ? `Free delivery above ₹${commerce.freeShippingThreshold}` : "Free delivery",
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 shadow-sm backdrop-blur">
      <div className="marquee-wrap overflow-hidden bg-gradient-to-r from-[#7a1f2b] via-[#9a2a45] to-[#7a1f2b] py-1.5 select-none">
        {marqueeItems.length > 0 ? (
          <div className="marquee-track" style={{ "--marquee-duration": `${Math.max(12, brand.announcementSpeed || 26)}s` } as React.CSSProperties}>
            {marqueeItems.map((a, i) => (
              <span key={`${a}-${i}`} className="inline-flex items-center shrink-0 text-[12px] font-medium tracking-wide text-[#f4e2a3] sm:text-[13px] whitespace-nowrap">
                <AnnouncementMessage raw={a} />
                <span className="mx-6 text-[#D4AF37] opacity-80" aria-hidden="true">◆</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="truncate px-4 text-center text-[12px] font-medium tracking-wide text-[#f4e2a3] sm:text-[13px]">{trustLine.join(" · ")}</p>
        )}
      </div>

      <HeaderNav
        categories={nav}
        user={user ? { id: user.id, fullName: user.fullName, email: user.email, role: user.role } : null}
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
