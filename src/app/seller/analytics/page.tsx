import type { Metadata } from "next";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { getSellerContext } from "@/lib/seller";
import { ArrowLeft, Store, ShieldCheck } from "lucide-react";

// Dynamic import with ssr: false ensures DuckDB-Wasm runs purely client-side
const DuckDbAnalyticsStudio = nextDynamic(
  () => import("@/components/analytics/DuckDbAnalyticsStudio"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-cream-200 bg-white p-8 shadow-xs">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-maroon-800 border-t-transparent" />
          <p className="text-sm font-semibold text-maroon-900">Loading Store Analytics Engine...</p>
          <p className="text-xs text-slate-500">Preparing isolated DuckDB tables in browser memory</p>
        </div>
      </div>
    ),
  }
);

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Store Analytics | Seller Hub",
  description: "Real-time store performance analytics powered by DuckDB in-memory OLAP.",
};

export default async function SellerAnalyticsPage() {
  const { store } = await getSellerContext();

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Seller Hub
        </Link>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 text-maroon-800">
            <Store className="h-3.5 w-3.5" />
            {store.storeName}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Vendor Isolated Data
          </span>
        </div>
      </div>

      {/* DuckDB In-Browser Analytical Studio */}
      <DuckDbAnalyticsStudio
        apiEndpoint="/api/seller/analytics/dataset"
        portalTitle={`${store.storeName} — Sales Analytics`}
        isSuperAdmin={false}
      />
    </div>
  );
}
