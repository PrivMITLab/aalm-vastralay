import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";
import { DEMO_ACCOUNTS } from "@/db/seed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const { redirect_url } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(redirect_url && redirect_url.startsWith("/") ? redirect_url : "/dashboard");

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/anarkali.jpg" alt="" className="h-[520px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="font-display text-3xl font-semibold">Welcome back</p>
            <p className="mt-1 text-sm text-cream-100/90">Track orders, save favourites and check out faster.</p>
          </div>
        </div>
      </div>

      <div className="card mx-auto w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-semibold text-maroon-900">Sign in to Aalm Vastralay</h1>
        <p className="mt-1 text-sm text-slate-600">Use your email and password to continue.</p>
        <div className="mt-6">
          <AuthForm mode="sign-in" redirectUrl={redirect_url} />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-gold-400 bg-gold-100/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Demo accounts</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email} className="flex justify-between gap-2">
                <span className="font-semibold">{a.label}</span>
                <span className="font-mono">
                  {a.email} / {a.password}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
