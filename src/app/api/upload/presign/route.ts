import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validateUploadMetadata, getB2DirectUploadCredentials } from "@/lib/b2";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — PRESIGNED DIRECT UPLOAD ENDPOINT
 * POST /api/upload/presign
 * Body: { filename: string, contentType: string, sizeBytes: number, folder?: "products" | "brand" | "avatars" }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    // Allow admin/seller or development testing
    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized: Authentication required to upload media." }, { status: 401 });
    }

    const body = (await req.json()) as {
      filename?: string;
      contentType?: string;
      sizeBytes?: number;
      folder?: "products" | "brand" | "avatars";
    };

    const { filename, contentType, sizeBytes, folder } = body;
    if (!filename || !contentType || typeof sizeBytes !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, sizeBytes." },
        { status: 400 }
      );
    }

    const validation = validateUploadMetadata(filename, contentType, sizeBytes, folder);
    if (!validation.isValid || !validation.key) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const credentials = await getB2DirectUploadCredentials(validation.key);

    return NextResponse.json({
      success: true,
      ...credentials,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
