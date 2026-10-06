"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Storefront Error Boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto my-16 max-w-lg px-4 text-center">
      <div className="card space-y-4 p-8 border-rose-200 dark:border-rose-900/50 shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-rose-900 dark:text-rose-200">
            पेज लोड करने में समस्या आई
          </h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Server se sampark mein rukawat aayi ya page load nahi ho saka. Kripya dobara koshish karein.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[11px] text-slate-400">
              Digest: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary text-xs inline-flex items-center gap-1.5 font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Dobara try karo (Retry)
          </button>
          <Link
            href="/products"
            className="btn btn-outline text-xs inline-flex items-center gap-1.5 font-semibold"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
