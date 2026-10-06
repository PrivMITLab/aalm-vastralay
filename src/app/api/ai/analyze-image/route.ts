import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit, executeAiVisionAnalysis } from "@/lib/ai/client";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export interface AnalyzeImageRequest {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

/**
 * 👑 AALM VASTRALAY — MULTIMODAL VISION AI PRODUCT ANALYZER
 *
 * Accepts any ethnic wear image reference (B2, Cloudflare Worker, Google Drive,
 * ImageKit, public web URL, or Base64 data URL) and generates concise, high-converting
 * luxury copy, color, fabric, karigari, and category suggestions.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized. Only verified sellers and admins can access Vision AI." },
        { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const rateLimit = checkAiRateLimit(`vision:${user.id}`);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Free AI rate limit reached. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const body = (await req.json()) as AnalyzeImageRequest;
    if (!body.imageUrl && !body.imageBase64) {
      return NextResponse.json(
        { error: "Image reference (imageUrl or imageBase64) is required." },
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Retrieve active marketplace categories for accurate AI auto-selection
    let categoriesList: { id: string; name: string; slug: string }[] = [];
    try {
      categoriesList = await db
        .select({ id: categories.id, name: categories.name, slug: categories.slug })
        .from(categories);
    } catch (dbErr) {
      console.warn("[VisionAPI] Could not fetch categories from DB, continuing with defaults:", dbErr);
    }

    const analysis = await executeAiVisionAnalysis({
      imageUrl: body.imageUrl,
      imageBase64: body.imageBase64,
      mimeType: body.mimeType,
      categoriesList,
    });

    return NextResponse.json(
      { ok: true, data: analysis },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[VisionAPI] Analysis route error:", err);
    return NextResponse.json(
      { error: "Internal server error while analyzing image." },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
