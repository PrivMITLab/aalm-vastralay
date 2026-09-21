import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgePercent, RotateCcw, Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string; intent?: string }> }) {
  const { redirect_url, intent } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(intent === "seller" ? "/onboarding" : "/dashboard");
  const seller = intent === "seller";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={seller ? "/images/hero.jpg" : "/images/gown.jpg"} alt="" className="h-[520px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="font-display text-3xl font-semibold">{seller ? "Open your store today" : "Join Aalm Vastralay"}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-cream-100/90">
              <li className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-gold-300" /> {seller ? "0% commission for 6 months" : "10% off your first order with WELCOME10"}
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gold-300" /> {seller ? "COD & online payouts" : "Cash on Delivery available"}
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-gold-300" /> 7-day easy returns
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card mx-auto w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-semibold text-maroon-900">{seller ? "Create your seller account" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-slate-600">{seller ? "Step 1 of 2 – you'll set up your store next." : "It only takes a minute."}</p>
        <div className="mt-6">
          <AuthForm mode="sign-up" redirectUrl={redirect_url} intent={intent} />
        </div>
      </div>
    </div>
  );
}
