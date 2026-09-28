import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAnalyticsDataset } from "@/lib/analytics/dataset";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — SELLER DUCKDB ANALYTICS DATASET ENDPOINT
 * GET /api/seller/analytics/dataset
 * 
 * Provides isolated store-specific datasets for the authenticated seller.
 * Strictly prevents cross-vendor data leakage.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Seller access required" }, { status: 403 });
    }

    // Find the seller's store
    const store = await db.query.stores.findFirst({
      where: eq(stores.ownerId, user.id),
    });

    if (!store) {
      return NextResponse.json({
        success: true,
        dataset: {
          generatedAt: new Date().toISOString(),
          storeId: null,
          orders: [],
          items: [],
          summary: { totalOrders: 0, totalGmv: 0, totalItemsSold: 0 },
        },
      });
    }

    const dataset = await getAnalyticsDataset(store.id);

    return NextResponse.json({
      success: true,
      storeName: store.storeName,
      dataset,
    }, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[API_SELLER_ANALYTICS_DATASET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate seller analytics dataset" },
      { status: 500 }
    );
  }
}
