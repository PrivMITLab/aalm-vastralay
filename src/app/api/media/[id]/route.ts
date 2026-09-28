import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { b2DeleteFileVersion, b2IsConfigured } from "@/lib/b2";
import { mediaCache } from "@/lib/media-cache";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — HARD PERMANENT MEDIA DELETION ENDPOINT
 * DELETE /api/media/[id]
 *
 * CRITICAL LIFECYCLE ARCHITECTURE:
 * 1. Checks asset metadata in Neon PostgreSQL.
 * 2. If stored in Backblaze B2, calls `b2_delete_file_version` using exact `fileId`.
 *    -> Permanently purges the file without creating hidden tombstone markers.
 *    -> Saves Class C transactions and stops daily quota exhaustion.
 * 3. Deletes record from Neon DB and invalidates in-memory cache.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing asset ID" }, { status: 400 });
    }

    // 1. Look up asset
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    }

    // 2. Check RBAC: Admin or owner only
    if (user.role !== "admin" && asset.uploadedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot delete media uploaded by another user." },
        { status: 403 }
      );
    }

    // 3. Hard-delete from Backblaze B2 if B2 file
    if (asset.source === "b2" && asset.fileId && b2IsConfigured()) {
      try {
        await b2DeleteFileVersion(asset.fileName, asset.fileId);
      } catch (b2Err) {
        console.warn(`[Media:Delete] B2 permanent purge warning for ${asset.fileName}:`, b2Err);
        // Continue to delete from DB even if B2 gave warning (e.g. already deleted on B2)
      }
    }

    // 4. Delete from Neon PostgreSQL
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));

    // 5. Invalidate memory cache
    mediaCache.delete(id);

    return NextResponse.json({
      success: true,
      deletedId: id,
      fileName: asset.fileName,
      message: "Asset permanently deleted.",
    });
  } catch (err) {
    const reqId = crypto.randomUUID();
    console.error(`[Media:Delete] [${reqId}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "Failed to delete media asset." },
      { status: 500, headers: { "X-Request-Id": reqId } }
    );
  }
}
