import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveImage } from "@/lib/image-resolver";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — UPLOAD VERIFICATION ENDPOINT
 * POST /api/upload/verify
 * Body: { key: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const body = (await req.json()) as { key?: string };
    const { key } = body;

    if (!key || typeof key !== "string" || key.includes("..")) {
      return NextResponse.json({ error: "Invalid file key provided." }, { status: 400 });
    }

    const b2Key = key.startsWith("b2:") ? key : `b2:${key}`;
    const servableUrl = resolveImage(b2Key);

    return NextResponse.json({
      success: true,
      key: b2Key,
      servableUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
