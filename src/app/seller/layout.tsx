import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";
import { getSellerContext } from "@/lib/seller";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/settings", label: "Store settings", icon: Settings },
];

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const { store } = await getSellerContext();
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="space-y-4">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-600">Seller Hub</p>
          <p className="mt-1 font-display text-lg font-semibold leading-tight text-maroon-900">{store.storeName}</p>
          <Link href={`/stores/${store.slug}`} className="mt-1 inline-flex items-center gap-1 text-xs text-maroon-700 hover:underline">
            View storefront <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-cream-100 hover:text-maroon-800">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
