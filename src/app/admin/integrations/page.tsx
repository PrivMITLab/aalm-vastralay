import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, CloudCog, ExternalLink, Gauge, Mail, Server, Wallet } from "lucide-react";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, stores, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { BACKBONE } from "@/lib/backbone";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Integrations & scaling" };

export default async function AdminIntegrationsPage() {
  await requireRole(["admin"], "/admin/integrations");
  const settings = await getSettings();
  const [[usage]] = await Promise.all([
    db
      .select({
        users: sql<number>`(select count(*) from users)::int`,
        stores: sql<number>`(select count(*) from stores)::int`,
        products: sql<number>`(select count(*) from products)::int`,
        orders: sql<number>`(select count(*) from orders)::int`,
        audit: sql<number>`(select count(*) from audit_logs)::int`,
      })
      .from(sql`(select 1) as one`),
  ]);
  const [orderRows] = await db.select({ n: count(), gmv: sql<number>`coalesce(sum(total),0)::float` }).from(orders);

  const env = process.env;
  const dbUrlSet = Boolean(env.DATABASE_URL);
  const counts = usage ?? { users: 0, stores: 0, products: 0, orders: 0, audit: 0 };

  const services = BACKBONE.map((svc) => {
    const configured = svc.check(env);
    return { ...svc, configured };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[color:var(--brand)]">Integrations & scaling</h1>
        <p className="text-sm text-[color:var(--text-soft)]">Everything below runs on permanent free tiers – no credit card, no lock-in.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Server className="h-5 w-5" />} label="Database" value={dbUrlSet ? "Connected" : "Missing URL"} sub={dbUrlSet ? "Postgres (Neon / local)" : "Set DATABASE_URL"} />
        <Metric icon={<Gauge className="h-5 w-5" />} label="Catalogue" value={`${counts.products} products`} sub={`${counts.stores} stores · ${counts.users} users`} />
        <Metric icon={<Wallet className="h-5 w-5" />} label="Orders" value={String(orderRows?.n ?? 0)} sub={`GMV ₹${((orderRows?.gmv ?? 0) / 1000).toFixed(1)}k settled in INR`} />
        <Metric icon={<CloudCog className="h-5 w-5" />} label="Audit records" value={String(counts.audit)} sub="security trail entries" />
      </div>

      <section className="card overflow-hidden">
        <header className="border-b border-[color:var(--border)] px-5 py-3">
          <h2 className="font-semibold text-[color:var(--brand)]">Free-tier backbone status</h2>
          <p className="text-xs text-[color:var(--text-soft)]">
            Add a key in <code>.env.local</code> (or Cloudflare Pages → Environment variables) and the capability activates automatically.
          </p>
        </header>
        <ul className="divide-y divide-[color:var(--border)]">
          {services.map((s) => (
            <li key={s.name} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className={s.configured ? "text-emerald-600" : "text-[color:var(--text-soft)]"}>
                {s.configured ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-[color:var(--text-soft)]">
                  {s.purpose} · <span className="font-mono">{s.envKeys.join(", ")}</span>
                </p>
              </div>
              <span className={`badge ${s.configured ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : ""}`}>{s.configured ? "Active" : "Awaiting key"}</span>
              <a href={s.docs} target="_blank" rel="noopener noreferrer" className="chip">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-[color:var(--brand)]">
            <Mail className="h-4 w-4" /> Email & notifications
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-soft)]">
            Order confirmations, seller alerts and welcome coupons go out through quiet-mail. Until keys are added, messages are logged to the server console so the flow
            never breaks.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>· Order confirmation + per-store split orders</li>
            <li>· Seller new-order / cancellation / return alerts</li>
            <li>· Newsletter welcome coupon (WELCOME10)</li>
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-[color:var(--brand)]">Capacity headroom for 1,000 daily customers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between border-b border-[color:var(--border)] pb-1">
              <span>Page views</span>
              <span className="text-[color:var(--text-soft)]">~8,000/day · Cloudflare Pages unlimited</span>
            </li>
            <li className="flex justify-between border-b border-[color:var(--border)] pb-1">
              <span>Image bandwidth</span>
              <span className="text-[color:var(--text-soft)]">~7 GB/month · ImageKit 20 GB</span>
            </li>
            <li className="flex justify-between border-b border-[color:var(--border)] pb-1">
              <span>DB storage</span>
              <span className="text-[color:var(--text-soft)]">~120 MB used · Neon 0.5 GB</span>
            </li>
            <li className="flex justify-between border-b border-[color:var(--border)] pb-1">
              <span>Auth</span>
              <span className="text-[color:var(--text-soft)]">sessions now · Clerk 50k MAU when swapped in</span>
            </li>
            <li className="flex justify-between border-b border-[color:var(--border)] pb-1">
              <span>Cold images</span>
              <span className="text-[color:var(--text-soft)]">&lt;10k/day · Cloudflare Worker 100k/day</span>
            </li>
            <li className="flex justify-between">
              <span>Bot protection</span>
              <span className="text-[color:var(--text-soft)]">self-hosted PoW · zero vendor cost</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-[color:var(--text-soft)]">
            Proof-of-work weight is currently {settings["security.powDifficulty"]} leading zeros (~{Math.round(Math.pow(16, Number(settings["security.powDifficulty"] ?? 3))).toLocaleString("en-IN")} average
            hash attempts per form) – heavy for bots, a blink for shoppers.
          </p>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[color:var(--brand)]">{value}</p>
        <p className="truncate text-xs text-[color:var(--text-soft)]">
          {label} · {sub}
        </p>
      </div>
    </div>
  );
}
