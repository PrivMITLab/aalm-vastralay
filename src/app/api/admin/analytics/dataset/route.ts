import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAnalyticsDataset } from "@/lib/analytics/dataset";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — ADMIN DUCKDB ANALYTICS DATASET ENDPOINT
 * GET /api/admin/analytics/dataset
 * 
 * Provides sanitized, non-PII marketplace datasets to client-side DuckDB-Wasm.
 * Cached in memory for 5 minutes with ETag validation.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const dataset = await getAnalyticsDataset(null);

    return NextResponse.json({
      success: true,
      dataset,
    }, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[API_ADMIN_ANALYTICS_DATASET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate analytics dataset" },
      { status: 500 }
    );
  }
}
