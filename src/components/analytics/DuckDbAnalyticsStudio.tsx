"use client";

import { useEffect, useState, useTransition } from "react";
import {
  duckDbEngine,
  type GmvTrendPoint,
  type CategorySharePoint,
  type FabricSharePoint,
  type GstTaxSummary,
  type PaymentMethodPoint,
  type CustomSqlResult,
} from "@/lib/analytics/duckdb-engine";
import type { AnalyticsDataset } from "@/lib/analytics/dataset";
import { formatINR } from "@/lib/utils";
import {
  TrendingUp,
  ReceiptText,
  CreditCard,
  Code2,
  RefreshCw,
  Sparkles,
  Download,
  AlertCircle,
  Play,
  Database,
  Layers,
} from "lucide-react";

interface DuckDbAnalyticsStudioProps {
  apiEndpoint: string;
  portalTitle: string;
  isSuperAdmin?: boolean;
}

const SAMPLE_QUERIES = [
  {
    label: "📊 Monthly GMV & Volume",
    sql: "SELECT strftime(created_at, '%Y-%m') AS month, count(*) AS total_orders, sum(total) AS gmv, avg(total) AS aov FROM orders WHERE status NOT IN ('cancelled', 'returned') GROUP BY 1 ORDER BY 1 DESC LIMIT 12;",
  },
  {
    label: "👑 Top 5 High-Value Orders",
    sql: "SELECT order_number, total, payment_method, status, created_at FROM orders WHERE status NOT IN ('cancelled', 'returned') ORDER BY total DESC LIMIT 5;",
  },
  {
    label: "🧾 Statutory GST Slabs Split",
    sql: "SELECT gst_slab, count(*) AS items_sold, sum(total_price) AS slab_gmv, sum(estimated_tax) AS total_tax FROM items GROUP BY 1 ORDER BY 1 ASC;",
  },
  {
    label: "💳 Payment Method Conversion",
    sql: "SELECT payment_method, count(*) AS attempts, sum(CASE WHEN status NOT IN ('cancelled','returned') THEN 1 ELSE 0 END) AS successful_orders, sum(total) AS revenue FROM orders GROUP BY 1 ORDER BY revenue DESC;",
  },
];

export default function DuckDbAnalyticsStudio({
  apiEndpoint,
  portalTitle,
  isSuperAdmin = true,
}: DuckDbAnalyticsStudioProps) {
  const [dataset, setDataset] = useState<AnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "gst" | "payments" | "sql">("overview");
  const [dateRange, setDateRange] = useState<number>(30); // 30 days default
  const [isPending, startTransition] = useTransition();

  // Query Result States
  const [gmvTrends, setGmvTrends] = useState<GmvTrendPoint[]>([]);
  const [categories, setCategories] = useState<CategorySharePoint[]>([]);
  const [fabrics, setFabrics] = useState<FabricSharePoint[]>([]);
  const [gstSummary, setGstSummary] = useState<GstTaxSummary | null>(null);
  const [payments, setPayments] = useState<PaymentMethodPoint[]>([]);

  // SQL Studio States
  const [customSql, setCustomSql] = useState<string>(SAMPLE_QUERIES[0].sql);
  const [sqlResult, setSqlResult] = useState<CustomSqlResult | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlRunning, setSqlRunning] = useState(false);

  const refreshAnalytics = (ds: AnalyticsDataset, range: number) => {
    startTransition(async () => {
      try {
        const [trends, cats, fabs, gst, pays] = await Promise.all([
          duckDbEngine.getGmvTrends(range),
          duckDbEngine.getCategoryShare(),
          duckDbEngine.getFabricShare(),
          duckDbEngine.getGstSummary(),
          duckDbEngine.getPaymentMethodStats(),
        ]);

        setGmvTrends(trends);
        setCategories(cats);
        setFabrics(fabs);
        setGstSummary(gst);
        setPayments(pays);
      } catch (err) {
        console.error("[DuckDbAnalyticsStudio] Query refresh error:", err);
      }
    });
  };

  useEffect(() => {
    let isCancelled = false;

    async function initializeStudio() {
      try {
        const res = await fetch(apiEndpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load dataset`);
        const json = await res.json();
        if (isCancelled) return;
        if (!json.success || !json.dataset) throw new Error(json.error || "Invalid response");

        const ds = json.dataset as AnalyticsDataset;
        setDataset(ds);

        // Initialize DuckDB and load tables
        await duckDbEngine.init();
        await duckDbEngine.loadDataset(ds);

        if (isCancelled) return;

        const [trends, cats, fabs, gst, pays] = await Promise.all([
          duckDbEngine.getGmvTrends(dateRange),
          duckDbEngine.getCategoryShare(),
          duckDbEngine.getFabricShare(),
          duckDbEngine.getGstSummary(),
          duckDbEngine.getPaymentMethodStats(),
        ]);

        if (isCancelled) return;
        setGmvTrends(trends);
        setCategories(cats);
        setFabrics(fabs);
        setGstSummary(gst);
        setPayments(pays);
        setLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error("[DuckDbAnalyticsStudio] Load error:", err);
          setError(err instanceof Error ? err.message : "Failed to load analytics engine");
          setLoading(false);
        }
      }
    }

    void initializeStudio();

    return () => {
      isCancelled = true;
    };
  }, [apiEndpoint, dateRange]);

  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load dataset`);
      const json = await res.json();
      if (!json.success || !json.dataset) throw new Error(json.error || "Invalid response");

      const ds = json.dataset as AnalyticsDataset;
      setDataset(ds);
      await duckDbEngine.init();
      await duckDbEngine.loadDataset(ds);
      refreshAnalytics(ds, dateRange);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh dataset");
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (range: number) => {
    setDateRange(range);
    if (dataset) {
      refreshAnalytics(dataset, range);
    }
  };

  const handleRunSql = async () => {
    if (!customSql.trim()) return;
    setSqlRunning(true);
    setSqlError(null);
    try {
      const res = await duckDbEngine.executeCustomSql(customSql);
      setSqlResult(res);
    } catch (err) {
      setSqlError(err instanceof Error ? err.message : "SQL execution failed");
      setSqlResult(null);
    } finally {
      setSqlRunning(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!sqlResult || sqlResult.rows.length === 0) return;
    const headers = sqlResult.columns.join(",");
    const rows = sqlResult.rows.map((row) =>
      sqlResult.columns.map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `duckdb_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGmv = gmvTrends.reduce((sum, p) => sum + p.gmv, 0);
  const totalOrders = gmvTrends.reduce((sum, p) => sum + p.orders, 0);
  const aov = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Engine Metadata */}
      <div className="flex flex-col gap-4 rounded-xl border border-cream-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DuckDB-Wasm Vector Engine
            </span>
            <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-800">
              Neon DB Load: 0%
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-maroon-900">{portalTitle}</h1>
          <p className="text-xs text-slate-500">
            Client-side in-process columnar OLAP running in WebAssembly. Sub-millisecond vectorized queries on RAM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <div className="flex rounded-lg border border-cream-200 bg-cream-50 p-1 text-xs font-medium text-slate-600">
            {[
              { label: "7D", val: 7 },
              { label: "30D", val: 30 },
              { label: "90D", val: 90 },
              { label: "1Y", val: 365 },
              { label: "All", val: 0 },
            ].map(({ label, val }) => (
              <button
                key={val}
                type="button"
                onClick={() => handleRangeChange(val)}
                className={`rounded px-2.5 py-1 transition-all ${
                  dateRange === val ? "bg-white font-bold text-maroon-900 shadow-xs" : "hover:text-maroon-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void handleManualRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cream-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-cream-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-maroon-700" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Period GMV</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-maroon-900">{formatINR(totalGmv)}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {dateRange === 0 ? "All Time Recorded" : `Last ${dateRange} days`}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Orders Placed</span>
            <ReceiptText className="h-4 w-4 text-gold-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-maroon-900">{totalOrders}</p>
          <p className="mt-1 text-[11px] text-slate-500">Excludes cancellations</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Order Value (AOV)</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-maroon-900">{formatINR(aov)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Per paying transaction</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Estimated Statutory GST</span>
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-maroon-900">{formatINR(gstSummary?.totalTax || 0)}</p>
          <p className="mt-1 text-[11px] text-slate-500">5% & 12% Indian Apparel Slabs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-cream-200">
        {[
          { id: "overview", label: "📈 Sales Velocity", icon: TrendingUp },
          { id: "categories", label: "👗 Categories & Fabrics", icon: Layers },
          { id: "gst", label: "🧾 Statutory GST Reports", icon: ReceiptText },
          { id: "payments", label: "💳 Payment Velocity", icon: CreditCard },
          ...(isSuperAdmin ? [{ id: "sql", label: "💻 Admin SQL Studio", icon: Code2 }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "border-maroon-800 text-maroon-900"
                  : "border-transparent text-slate-500 hover:border-cream-300 hover:text-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Sales Velocity */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-maroon-900">GMV Trajectory by Day</h3>
            <p className="text-xs text-slate-500">Real-time daily aggregations calculated via DuckDB columnar scanning.</p>

            {loading || isPending ? (
              <div className="flex h-48 items-center justify-center text-xs text-slate-400">Loading dataset...</div>
            ) : gmvTrends.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-xs text-slate-400">No orders recorded in this date range.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {gmvTrends.slice(-10).map((point) => {
                  const maxGmv = Math.max(...gmvTrends.map((p) => p.gmv), 1);
                  const barWidth = Math.max(8, Math.round((point.gmv / maxGmv) * 100));
                  return (
                    <div key={point.date} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-600">{point.date}</span>
                        <span className="font-semibold text-maroon-900">
                          {formatINR(point.gmv)} <span className="text-[11px] font-normal text-slate-500">({point.orders} orders)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-maroon-800 to-gold-600 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Categories & Fabrics */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Ethnic Categories */}
          <div className="card p-5">
            <h3 className="font-semibold text-maroon-900">Ethnic Category Share</h3>
            <p className="text-xs text-slate-500">Revenue split across ethnic apparel departments.</p>

            <div className="mt-4 divide-y divide-cream-100">
              {categories.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No items available.</p>
              ) : (
                categories.map((c) => (
                  <div key={c.category} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{c.category}</p>
                      <p className="text-[11px] text-slate-500">{c.units} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-maroon-900">{formatINR(c.revenue)}</p>
                      <span className="inline-block rounded-sm bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {c.sharePercent}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fabrics Popularity */}
          <div className="card p-5">
            <h3 className="font-semibold text-maroon-900">Indian Fabric Popularity</h3>
            <p className="text-xs text-slate-500">Banarasi Katan Silk, Georgette, Organza, Velvet breakdown.</p>

            <div className="mt-4 divide-y divide-cream-100">
              {fabrics.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No fabric data available.</p>
              ) : (
                fabrics.map((f) => (
                  <div key={f.fabric} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{f.fabric}</p>
                      <p className="text-[11px] text-slate-500">{f.units} pieces sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-maroon-900">{formatINR(f.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Statutory GST Reports */}
      {activeTab === "gst" && (
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-maroon-900">Statutory Indian Apparel GST Breakdown (Rule 46)</h3>
            <p className="text-xs text-slate-500">
              Compliant with GST slabs: 5% for apparel &le; ₹1,000 | 12% for apparel &gt; ₹1,000. Ready for monthly GSTR-1 returns.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-cream-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-cream-200 bg-cream-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Tax Slab</th>
                  <th className="px-4 py-3">Applicable Criteria</th>
                  <th className="px-4 py-3">Gross Taxable Value</th>
                  <th className="px-4 py-3">CGST Split</th>
                  <th className="px-4 py-3">SGST Split</th>
                  <th className="px-4 py-3 text-right">Total GST Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-slate-600">
                <tr>
                  <td className="px-4 py-3 font-semibold text-emerald-800">5% Slab</td>
                  <td className="px-4 py-3">Apparel &le; ₹1,000</td>
                  <td className="px-4 py-3 font-medium">{formatINR(gstSummary?.slab5Gmv || 0)}</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.slab5Tax || 0) / 2)} (2.5%)</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.slab5Tax || 0) / 2)} (2.5%)</td>
                  <td className="px-4 py-3 text-right font-bold text-maroon-900">{formatINR(gstSummary?.slab5Tax || 0)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-blue-800">12% Slab</td>
                  <td className="px-4 py-3">Apparel &gt; ₹1,000 (Bridal & Silk)</td>
                  <td className="px-4 py-3 font-medium">{formatINR(gstSummary?.slab12Gmv || 0)}</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.slab12Tax || 0) / 2)} (6.0%)</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.slab12Tax || 0) / 2)} (6.0%)</td>
                  <td className="px-4 py-3 text-right font-bold text-maroon-900">{formatINR(gstSummary?.slab12Tax || 0)}</td>
                </tr>
                <tr className="bg-cream-50 font-bold text-slate-900">
                  <td className="px-4 py-3" colSpan={2}>Grand Total</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.slab5Gmv || 0) + (gstSummary?.slab12Gmv || 0))}</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.totalTax || 0) / 2)}</td>
                  <td className="px-4 py-3">{formatINR((gstSummary?.totalTax || 0) / 2)}</td>
                  <td className="px-4 py-3 text-right text-maroon-900">{formatINR(gstSummary?.totalTax || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Payments Velocity */}
      {activeTab === "payments" && (
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-maroon-900">Payment Velocity & Conversion Rate</h3>
            <p className="text-xs text-slate-500">Performance of 0% fee Dynamic UPI QR vs COD vs Online Gateway.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {payments.map((p) => (
              <div key={p.method} className="rounded-lg border border-cream-200 bg-cream-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-maroon-900">{p.method}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-2xs">
                    {p.successRate}% Success
                  </span>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900">{formatINR(p.revenue)}</p>
                <p className="mt-1 text-xs text-slate-500">{p.orders} total order attempts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Admin SQL Studio (Super Admin Pro Mode) */}
      {activeTab === "sql" && isSuperAdmin && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-gold-600" />
                <h3 className="font-semibold text-maroon-900">DuckDB In-Memory SQL Console</h3>
              </div>
              <p className="text-xs text-slate-500">
                Execute analytical SQL queries directly on in-memory columnar tables: <code className="rounded bg-cream-100 px-1 py-0.5 font-mono text-maroon-800">orders</code>, <code className="rounded bg-cream-100 px-1 py-0.5 font-mono text-maroon-800">items</code>.
              </p>
            </div>

            {/* Sample Query Select */}
            <select
              onChange={(e) => setCustomSql(e.target.value)}
              className="rounded-lg border border-cream-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs"
            >
              <option value="">-- Choose Sample Query --</option>
              {SAMPLE_QUERIES.map((q) => (
                <option key={q.label} value={q.sql}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          {/* SQL Editor Area */}
          <div className="relative">
            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-cream-300 bg-slate-900 p-3 font-mono text-xs text-emerald-400 shadow-inner focus:border-maroon-500 focus:outline-hidden"
              placeholder="SELECT * FROM orders LIMIT 10;"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleRunSql()}
                disabled={sqlRunning}
                className="inline-flex items-center gap-1.5 rounded-lg bg-maroon-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-maroon-900 disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 ${sqlRunning ? "animate-spin" : ""}`} />
                {sqlRunning ? "Executing..." : "Run Vector Query"}
              </button>

              {sqlResult && (
                <span className="text-[11px] font-mono text-emerald-700">
                  ⚡ {sqlResult.executionTimeMs}ms • {sqlResult.rowCount} rows
                </span>
              )}
            </div>

            {sqlResult && sqlResult.rows.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-cream-50"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export CSV
              </button>
            )}
          </div>

          {sqlError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <strong>Query Error:</strong> {sqlError}
            </div>
          )}

          {/* SQL Results Table */}
          {sqlResult && (
            <div className="overflow-x-auto rounded-lg border border-cream-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-cream-200 bg-cream-50 font-semibold text-slate-700">
                  <tr>
                    {sqlResult.columns.map((col) => (
                      <th key={col} className="px-3 py-2 font-mono">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-slate-600">
                  {sqlResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cream-50/50">
                      {sqlResult.columns.map((col) => (
                        <td key={col} className="px-3 py-2 font-mono text-[11px]">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
