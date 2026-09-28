import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import DuckDbAnalyticsStudio from "@/components/analytics/DuckDbAnalyticsStudio";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "DuckDB In-Memory OLAP Analytics | Admin Console",
  description: "Enterprise analytical business intelligence powered by DuckDB-Wasm and vectorized columnar scanning.",
};

export default async function AdminAnalyticsPage() {
  await requireRole(["admin"], "/admin/analytics");

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Control Panel
        </Link>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin Access
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-slate-400" />
            Zero Neon OLTP Compute
          </span>
        </div>
      </div>

      {/* DuckDB In-Browser Analytical Studio */}
      <DuckDbAnalyticsStudio
        apiEndpoint="/api/admin/analytics/dataset"
        portalTitle="Marketplace Enterprise Analytics Studio"
        isSuperAdmin={true}
      />
    </div>
  );
}
