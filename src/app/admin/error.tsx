"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary]", error);
  }, [error]);

  return (
    <div className="card space-y-4 p-8 text-center max-w-lg mx-auto my-12 border-rose-200 dark:border-rose-900/50">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-rose-900 dark:text-rose-200">
          Admin Console Error
        </h2>
        <p className="mt-1 text-xs text-[color:var(--text-soft)]">
          An issue occurred while loading this administrative view. Please retry.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-slate-400">
            Digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-primary text-xs inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Dobara try karo (Retry)
        </button>
      </div>
    </div>
  );
}
