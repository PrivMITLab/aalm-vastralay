import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { BadgePercent, Package, Truck, Wallet } from "lucide-react";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { INDIAN_STATES } from "@/lib/utils";
import StoreForm from "@/components/seller/StoreForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Become a Seller" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-up?intent=seller&redirect_url=%2Fonboarding");
  const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  if (store) redirect("/seller");

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[360px_1fr]">
      <aside>
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Seller onboarding</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-maroon-900">Set up your store</h1>
        <p className="mt-2 text-sm text-slate-600">Tell customers who you are. You can change these details anytime from the Seller Hub.</p>
        <ul className="mt-6 space-y-4 text-sm">
          {[
            [BadgePercent, "0% commission", "for your first 6 months, then only 2–3% per order."],
            [Wallet, "COD & online payouts", "weekly settlements straight to your bank account."],
            [Truck, "Flexible shipping", "use our courier partners or self-ship – your choice."],
            [Package, "Unlimited listings", "products, sizes, colours and video – all free."],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof Wallet;
            return (
              <li key={title as string} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-maroon-50 text-maroon-700">
                  <I className="h-4 w-4" />
                </span>
                <span>
                  <span className="font-semibold text-maroon-900">{title as string}</span>
                  <span className="block text-slate-600">{desc as string}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="card p-6 md:p-8">
        <StoreForm states={INDIAN_STATES} />
      </section>
    </div>
  );
}
