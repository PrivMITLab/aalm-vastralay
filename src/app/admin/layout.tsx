import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, LayoutDashboard, PlugZap, Settings2, ShoppingBag, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Site settings", icon: Settings2 },
  { href: "/admin/security", label: "Security & logs", icon: ShieldCheck },
  { href: "/admin/integrations", label: "Integrations & scaling", icon: PlugZap },
];

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
        <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/admin" className="card hidden items-center gap-2 p-3 text-xs text-[color:var(--text-soft)] lg:flex">
          <Activity className="h-4 w-4" /> Health check: <span className="font-mono">/api/health</span>
        </Link>
        <Link href="/products" className="card hidden items-center gap-2 p-3 text-xs text-[color:var(--text-soft)] lg:flex">
          <ShoppingBag className="h-4 w-4" /> View storefront
        </Link>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
