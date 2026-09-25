"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Package, Search, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabItem = {
  href: string;
  label: string;
  iconName: "home" | "search" | "heart" | "bag" | "orders" | "sell" | "user";
  badge: number;
};

export default function MobileTabBarClient({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  function renderIcon(iconName: TabItem["iconName"], active: boolean) {
    const iconClass = cn(
      "h-5 w-5 transition-transform duration-200",
      active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
    );

    switch (iconName) {
      case "home":
        return <Home className={iconClass} />;
      case "search":
        return <Search className={iconClass} />;
      case "heart":
        return <Heart className={iconClass} fill={active ? "currentColor" : "none"} />;
      case "bag":
        return <ShoppingBag className={iconClass} fill={active ? "currentColor" : "none"} />;
      case "orders":
        return <Package className={iconClass} />;
      case "sell":
        return <Store className={iconClass} />;
      case "user":
        return <User className={iconClass} />;
      default:
        return <Home className={iconClass} />;
    }
  }

  function isItemActive(href: string): boolean {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/products") {
      return (
        pathname === "/products" ||
        pathname.startsWith("/products/") ||
        pathname.startsWith("/categories") ||
        pathname.startsWith("/search")
      );
    }
    if (href === "/wishlist") {
      return pathname.startsWith("/wishlist");
    }
    if (href === "/cart") {
      return pathname.startsWith("/cart") || pathname.startsWith("/checkout");
    }
    if (href === "/orders") {
      return pathname.startsWith("/orders");
    }
    if (href === "/seller") {
      return pathname.startsWith("/seller");
    }
    if (href === "/onboarding") {
      return pathname.startsWith("/onboarding");
    }
    if (href === "/sign-in") {
      return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
    }
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1">
        {items.map((item) => {
          const active = isItemActive(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 px-1 text-[11px] font-medium transition-all duration-150 select-none",
                  "active:scale-90 active:opacity-80 active:shadow-inner",
                  active
                    ? "bg-[color:var(--brand-soft)]/70 text-[color:var(--brand)] font-bold shadow-xs ring-1 ring-[color:var(--brand)]/20 dark:bg-[color:var(--brand-soft)]/50 dark:text-[color:var(--accent)] dark:ring-[color:var(--accent)]/30"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]/60"
                )}
              >
                {/* Active Indicator Bar on top */}
                {active && (
                  <span className="absolute -top-1 h-1 w-6 rounded-full bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--accent)] shadow-[0_0_8px_var(--accent)] transition-all duration-300" />
                )}

                {renderIcon(item.iconName, active)}

                <span className="leading-none tracking-tight">{item.label}</span>

                {item.badge > 0 && (
                  <span className="absolute top-0.5 right-1/2 translate-x-4 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-[color:var(--brand)] to-rose-600 text-[10px] font-extrabold text-white shadow-xs">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
