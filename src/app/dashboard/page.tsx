import Link from "next/link";
import type { Metadata } from "next";
import { asc, desc, eq, sql } from "drizzle-orm";
import { Bell, ChevronRight, Heart, Package, ShieldCheck, Store } from "lucide-react";
import { db } from "@/db";
import { addresses, notifications, orders, stores, wishlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { cn, formatDate, formatINR, statusStyle } from "@/lib/utils";
import ProfileForm from "@/components/account/ProfileForm";
import PhotoUploader from "@/components/account/PhotoUploader";
import AddressBook from "@/components/account/AddressBook";
import SecurityForm from "@/components/account/SecurityForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const user = await requireUser("/dashboard");

  const [[orderStats], [wishCount], [unread], recent, [store], savedAddresses] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int`, spent: sql<number>`coalesce(sum(case when status <> 'cancelled' then total else 0 end),0)::float` })
      .from(orders)
      .where(eq(orders.customerId, user.id)),
    db.select({ n: sql<number>`count(*)::int` }).from(wishlist).where(eq(wishlist.userId, user.id)),
    db.select({ n: sql<number>`count(*)::int` }).from(notifications).where(sql`${notifications.userId} = ${user.id} and ${notifications.isRead} = false`),
    db.select().from(orders).where(eq(orders.customerId, user.id)).orderBy(desc(orders.createdAt)).limit(3),
    db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1),
    db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault), asc(addresses.createdAt)),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {error === "forbidden" && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">You don&apos;t have permission to view that page.</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Namaste,</p>
          <h1 className="font-display text-3xl font-semibold text-maroon-900">{user.fullName ?? user.email}</h1>
        </div>
        <span className="badge bg-cream-100 px-3 py-1 text-xs capitalize text-maroon-800">{user.role} account</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat href="/orders" icon={<Package className="h-5 w-5" />} label="Orders" value={String(orderStats?.n ?? 0)} sub={`${formatINR(orderStats?.spent ?? 0)} spent`} />
        <Stat href="/wishlist" icon={<Heart className="h-5 w-5" />} label="Wishlist" value={String(wishCount?.n ?? 0)} sub="saved items" />
        <Stat href="/notifications" icon={<Bell className="h-5 w-5" />} label="Notifications" value={String(unread?.n ?? 0)} sub="unread" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold text-maroon-900">Profile</h2>
            <div className="mt-4">
              <PhotoUploader endpoint="/api/uploads/avatar" initialUrl={user.avatarUrl} name="Profile photo" alt={user.fullName ?? "Profile photo"} />
            </div>
            <div className="mt-4">
              <ProfileForm fullName={user.fullName ?? ""} phone={user.phone ?? ""} email={user.email} />
            </div>
          </section>

          <section className="card p-5">
            <AddressBook addresses={savedAddresses} />
          </section>

          <section className="card p-5">
            <SecurityForm />
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-maroon-900">Recent orders</h2>
              <Link href="/orders" className="text-sm font-semibold text-maroon-700 hover:underline">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-cream-200">
                {recent.map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="flex items-center justify-between py-3 text-sm">
                      <span>
                        <span className="font-mono text-xs text-slate-500">{o.orderNumber}</span>
                        <span className="block text-xs text-slate-500">{formatDate(o.createdAt)}</span>
                      </span>
                      <span className={cn("badge capitalize", statusStyle(o.status))}>{o.status}</span>
                      <span className="font-semibold">{formatINR(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {store ? (
            <Link href="/seller" className="card block p-5 transition hover:shadow-md">
              <p className="flex items-center gap-2 font-semibold text-maroon-900">
                <Store className="h-5 w-5" /> Seller Hub
              </p>
              <p className="mt-1 text-sm text-slate-600">Manage {store.storeName}: products, orders and payouts.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-maroon-700">
                Open dashboard <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <Link href="/onboarding" className="block rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-900 p-5 text-white transition hover:shadow-lg">
              <p className="flex items-center gap-2 font-semibold">
                <Store className="h-5 w-5 text-gold-300" /> Become a Seller
              </p>
              <p className="mt-1 text-sm text-cream-100/90">Open your store for free – 0% commission for 6 months.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
                Start now <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          )}
          {user.role === "admin" && (
            <Link href="/admin" className="card block p-5 transition hover:shadow-md">
              <p className="flex items-center gap-2 font-semibold text-maroon-900">
                <ShieldCheck className="h-5 w-5" /> Admin Panel
              </p>
              <p className="mt-1 text-sm text-slate-600">Users, stores, coupons and categories.</p>
            </Link>
          )}
          <div className="card p-5 text-sm">
            <p className="font-semibold text-maroon-900">Need help?</p>
            <p className="mt-1 text-slate-600">7-day easy returns on all orders. Email support@aalmvastralay.in or WhatsApp +91 98765 00000.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ href, icon, label, value, sub }: { href: string; icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Link href={href} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-maroon-50 text-maroon-700">{icon}</span>
      <span>
        <span className="block text-2xl font-bold text-maroon-900">{value}</span>
        <span className="block text-xs text-slate-500">
          {label} · {sub}
        </span>
      </span>
    </Link>
  );
}
