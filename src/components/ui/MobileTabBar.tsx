import Link from "next/link";
import { Heart, Home, Package, Search, ShoppingBag, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { cart } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

  const items = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" />, badge: 0 },
    { href: "/products", label: "Shop", icon: <Search className="h-5 w-5" />, badge: 0 },
    ...(showWishlist ? [{ href: "/wishlist", label: "Saved", icon: <Heart className="h-5 w-5" />, badge: 0 }] : []),
    { href: "/cart", label: "Bag", icon: <ShoppingBag className="h-5 w-5" />, badge: cartCount },
    { href: user ? "/orders" : showSellerHub ? "/onboarding" : "/sign-in", label: user ? "Orders" : "Sell", icon: user ? <Package className="h-5 w-5" /> : <Store className="h-5 w-5" />, badge: 0 },
  ];

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link href={item.href} className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[color:var(--text-muted)] hover:text-[color:var(--brand)]">
              {item.icon}
              {item.label}
              {item.badge > 0 && (
                <span className="absolute top-1 right-1/2 translate-x-4 rounded-full bg-[color:var(--brand)] px-1.5 text-[10px] font-bold text-white">{item.badge > 9 ? "9+" : item.badge}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
