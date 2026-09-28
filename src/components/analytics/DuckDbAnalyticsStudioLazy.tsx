"use client";
/**
 * DuckDbAnalyticsStudioLazy.tsx
 * "use client" REQUIRED — next/dynamic with ssr:false only works in Client Components.
 * Yeh file ek thin wrapper hai jo next/dynamic ke saath ssr:false use karti hai.
 * Alag file mein rakhne se admin/seller analytics pages mein
 * `export const dynamic = "force-dynamic"` ke saath naam ka conflict nahi hoga.
 */
import dynamic from "next/dynamic";

// Loading skeleton jab tak DuckDB-Wasm browser mein initialize na ho
function LoadingStudio({ message }: { message: string }) {
  return (
    <div className="flex h-96 items-center justify-center rounded-2xl border border-cream-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-maroon-800 border-t-transparent dark:border-amber-400" />
        <p className="text-sm font-semibold text-maroon-900 dark:text-amber-200">{message}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Loading WebAssembly OLAP engine in browser memory…
        </p>
      </div>
    </div>
  );
}

// Admin variant — isSuperAdmin=true ke liye
export const AdminDuckDbStudio = dynamic(
  () => import("@/components/analytics/DuckDbAnalyticsStudio"),
  {
    ssr: false,
    loading: () => <LoadingStudio message="Initializing DuckDB-Wasm Vector Engine..." />,
  }
);

// Seller variant — vendor-isolated data ke liye
export const SellerDuckDbStudio = dynamic(
  () => import("@/components/analytics/DuckDbAnalyticsStudio"),
  {
    ssr: false,
    loading: () => <LoadingStudio message="Loading Store Analytics Engine..." />,
  }
);
