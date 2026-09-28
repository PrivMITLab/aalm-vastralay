import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — MEDIA GALLERY LISTING ENDPOINT
 * GET /api/media?folder=products&source=b2&page=1&limit=24
 *
 * CRITICAL PERFORMANCE & COST ARCHITECTURE:
 * Reads exclusively from Neon PostgreSQL `media_assets` table.
 * Consumes EXACTLY 0 Backblaze B2 Class C transactions!
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const source = searchParams.get("source");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const offset = (page - 1) * limit;

    // RBAC: Sellers see their own media, Admin sees all
    const conditions = [];
    if (user.role !== "admin") {
      conditions.push(eq(mediaAssets.uploadedBy, user.id));
    }
    if (folder) {
      conditions.push(eq(mediaAssets.folder, folder));
    }
    if (source) {
      conditions.push(eq(mediaAssets.source, source));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Fetch paginated assets from Neon PostgreSQL
    const assets = await db
      .select()
      .from(mediaAssets)
      .where(whereClause)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(limit)
      .offset(offset);

    // 2. Fetch total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaAssets)
      .where(whereClause);

    const total = countResult?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    const reqId = crypto.randomUUID();
    console.error(`[Media:List] [${reqId}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media assets." },
      { status: 500, headers: { "X-Request-Id": reqId } }
    );
  }
}
