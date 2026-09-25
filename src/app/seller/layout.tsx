import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { getSellerContext } from "@/lib/seller";
import SellerSidebarNav from "@/components/seller/SellerSidebarNav";

export const dynamic = "force-dynamic";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const { store } = await getSellerContext();
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="space-y-4">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-600">Seller Hub</p>
          <p className="mt-1 font-display text-lg font-semibold leading-tight text-maroon-900">{store.storeName}</p>
          <Link href={`/stores/${store.slug}`} className="mt-1 inline-flex items-center gap-1 text-xs text-maroon-700 hover:underline active:scale-[0.98] transition-all">
            View storefront <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <SellerSidebarNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
