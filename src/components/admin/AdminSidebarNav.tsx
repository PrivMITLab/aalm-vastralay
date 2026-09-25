"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  PackageCheck,
  Palette,
  PlugZap,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/theme", label: "Theme & Brand", icon: Palette },
  { href: "/admin/settings", label: "Site settings", icon: Settings2 },
  { href: "/admin/audit-logs", label: "Audit logs", icon: FileText },
  { href: "/admin/security", label: "Security & logs", icon: ShieldCheck },
  { href: "/admin/integrations", label: "Integrations & scaling", icon: PlugZap },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="card flex gap-1 overflow-x-auto no-scrollbar p-2 lg:flex-col shadow-sm" aria-label="Admin Navigation">
      {NAV.map((n) => {
        const isActive = n.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(n.href);

        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 select-none",
              "active:scale-[0.97] active:shadow-inner",
              isActive
                ? "bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--brand-hover)] text-white shadow-md shadow-[color:var(--brand)]/20 dark:shadow-black/40 ring-1 ring-[color:var(--accent)]/40"
                : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)] hover:translate-x-0.5"
            )}
          >
            <n.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-150",
                isActive ? "text-[color:var(--accent)] scale-110" : "group-hover:scale-105"
              )}
            />
            <span className="truncate">{n.label}</span>

            {/* Glowing active indicator dot on right (desktop) */}
            {isActive && (
              <span className="ml-auto hidden h-2 w-2 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)] lg:inline-block animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
