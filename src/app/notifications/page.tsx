import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Bell, CheckCheck } from "lucide-react";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { markNotificationsRead } from "@/actions/auth";
import { cn, formatDate } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const rows = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  const unread = rows.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Notifications</h1>
        {unread > 0 && (
          <form action={markNotificationsRead}>
            <SubmitButton variant="outline" className="btn-sm" pendingText="…">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </SubmitButton>
          </form>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center p-12 text-center">
          <Bell className="h-10 w-10 text-maroon-300" />
          <p className="mt-3 text-sm text-slate-500">You&apos;re all caught up.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((n) => {
            const orderId = typeof n.data?.orderId === "string" ? n.data.orderId : null;
            const href = orderId ? (n.type === "new_order" || n.type === "order_cancelled" || n.type === "order_returned" ? "/seller/orders" : `/orders/${orderId}`) : null;
            const body = (
              <div className={cn("card flex gap-3 p-4", !n.isRead && "border-gold-300 bg-gold-100/30")}>
                <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", n.isRead ? "bg-cream-300" : "bg-maroon-700")} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  {n.body && <p className="text-sm text-slate-600">{n.body}</p>}
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );
            return <li key={n.id}>{href ? <Link href={href}>{body}</Link> : body}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
