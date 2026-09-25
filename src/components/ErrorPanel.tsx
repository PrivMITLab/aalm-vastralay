"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export type ErrorPanelProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

/**
 * 👑 AALM VASTRALAY — ERROR PANEL COMPONENT
 * Luxury Maroon/Gold styled error boundary state.
 * Biligual (Hindi + English) with "Dobara try karo" retry button.
 * Prevents Cloudflare / Host generic error crashes.
 */
export default function ErrorPanel({
  error,
  reset,
  title = "Kuch gadbad ho gayi (Something went wrong)",
  subtitle = "Hume khed hai. Page load nahi ho saka. Kripya dobara koshish karein.",
  backHref = "/",
  backLabel = "Home par jayein (Go to Homepage)",
}: ErrorPanelProps) {
  useEffect(() => {
    console.error("[Aalm Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[420px] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-white to-[#FDFBF7] dark:from-stone-900 dark:to-stone-950 p-6 sm:p-8 text-center shadow-xl shadow-stone-900/5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#722F37]/10 text-[#722F37] dark:bg-[#722F37]/25 dark:text-[#E89BA5] mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#722F37] dark:text-[#E89BA5]">
          {title}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {subtitle}
        </p>

        {error.digest && (
          <p className="mt-2 text-[10px] font-mono text-stone-400">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#722F37] hover:bg-[#58242B] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition shadow-md active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Dobara try karo (Retry)
          </button>

          <Link
            href={backHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 px-5 py-2.5 text-xs sm:text-sm font-semibold transition active:scale-95"
          >
            <Home className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
