import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, ShoppingBag } from "lucide-react";
import { requireRole } from "@/lib/auth";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"], "/admin");
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[232px_1fr]">
      <aside className="space-y-3">
        <div className="card p-4">
          <p className="text-xs font-bold tracking-wider text-[color:var(--accent)] uppercase">Admin console</p>
          <p className="mt-1 font-display text-lg leading-tight font-semibold text-[color:var(--brand)]">Aalm Vastralay</p>
          <p className="mt-1 text-xs text-[color:var(--text-soft)]">Everything is configurable here – no code changes needed.</p>
        </div>
        <AdminSidebarNav />
        <Link
          href="/admin"
          className="card hidden items-center gap-2 p-3 text-xs text-[color:var(--text-soft)] lg:flex hover:text-[color:var(--brand)] active:scale-[0.98] transition-all"
        >
          <Activity className="h-4 w-4 text-[color:var(--accent)]" /> Health check: <span className="font-mono">/api/health</span>
        </Link>
        <Link
          href="/products"
          className="card hidden items-center gap-2 p-3 text-xs text-[color:var(--text-soft)] lg:flex hover:text-[color:var(--brand)] active:scale-[0.98] transition-all"
        >
          <ShoppingBag className="h-4 w-4 text-[color:var(--accent)]" /> View storefront
        </Link>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
