import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { cart } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import MobileTabBarClient, { type TabItem } from "./MobileTabBarClient";

/** Sticky bottom navigation for phones (app-like feel, hidden on large screens). */
export default async function MobileTabBar({
  showWishlist,
  showSellerHub,
  sellerFreeMonths,
}: {
  showWishlist: boolean;
  showSellerHub: boolean;
  sellerFreeMonths: number;
}) {
  const user = await getCurrentUser();
  let cartCount = 0;
  if (user) {
    const [c] = await db.select({ n: sql<number>`coalesce(sum(${cart.quantity}),0)::int` }).from(cart).where(eq(cart.userId, user.id));
    cartCount = c?.n ?? 0;
  }

  const items: TabItem[] = [
    { href: "/", label: "Home", iconName: "home", badge: 0 },
    { href: "/products", label: "Shop", iconName: "search", badge: 0 },
    ...(showWishlist ? [{ href: "/wishlist", label: "Saved", iconName: "heart" as const, badge: 0 }] : []),
    { href: "/cart", label: "Bag", iconName: "bag", badge: cartCount },
    {
      href: user ? "/orders" : showSellerHub ? "/onboarding" : "/sign-in",
      label: user ? "Orders" : "Sell",
      iconName: user ? "orders" : "sell",
      badge: 0,
    },
  ];

  return <MobileTabBarClient items={items} />;
}
