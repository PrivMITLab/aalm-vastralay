"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/settings", label: "Store settings", icon: Settings },
];

export default function SellerSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col shadow-sm" aria-label="Seller Navigation">
      {NAV.map((n) => {
        const isActive = n.href === "/seller" ? pathname === "/seller" : pathname?.startsWith(n.href);

        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 select-none",
              "active:scale-[0.97] active:shadow-inner",
              isActive
                ? "bg-gradient-to-r from-maroon-800 to-maroon-900 text-white font-semibold shadow-md shadow-maroon-950/20 ring-1 ring-gold-400/40"
                : "text-slate-700 hover:bg-cream-100 hover:text-maroon-800 hover:translate-x-0.5"
            )}
          >
            <n.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-150",
                isActive ? "text-gold-400 scale-110" : "group-hover:scale-105"
              )}
            />
            <span className="truncate">{n.label}</span>

            {isActive && (
              <span className="ml-auto hidden h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_8px_#d4af37] lg:inline-block animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
