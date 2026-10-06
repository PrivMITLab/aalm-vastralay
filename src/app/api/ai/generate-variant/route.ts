import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export interface GenerateVariantRequest {
  baseImageUrl?: string;
  garmentType?: string;
  targetColor: string;
  accentDetails?: string;
  lightingStyle?: string;
  customPrompt?: string;
}

/**
 * 👑 AALM VASTRALAY — AI VARIANT STUDIO GENERATOR
 * Generates photorealistic ethnic fashion colorway variants
 * using prompt-guided image synthesis (Pollinations Flux / SDXL).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized. Only verified sellers and admins can generate variants." },
        { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const rateLimit = checkAiRateLimit(`gen-variant:${user.id}`);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Variant generation rate limit reached. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const body = (await req.json()) as GenerateVariantRequest;
    if (!body.targetColor || !body.targetColor.trim()) {
      return NextResponse.json(
        { error: "Target color (targetColor) is required for variant generation." },
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const garmentType = body.garmentType?.trim() || "ethnic wear garment";
    const targetColor = body.targetColor.trim();
    const accentDetails = body.accentDetails?.trim() || "handcrafted metallic zari border";
    const lightingStyle = body.lightingStyle?.trim() || "editorial fashion studio lighting on neutral cream backdrop";
    const customPrompt = body.customPrompt?.trim() || "";

    const luxuryPrompt = [
      "Professional Indian luxury ethnic couture catalog photoshoot",
      `${garmentType} in vibrant ${targetColor} palette`,
      `featuring authentic ${accentDetails}`,
      lightingStyle,
      customPrompt,
      "ultra-detailed textile weave texture, 8k resolution, photorealistic, elegant presentation, no watermarks, no blur, pristine boutique fashion",
    ]
      .filter(Boolean)
      .join(", ");

    const seed = Math.floor(Math.random() * 999999);
    const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(luxuryPrompt)}?width=800&height=1000&model=flux&nologo=true&seed=${seed}`;

    let dataUrl: string | null = null;

    // Attempt to download the image buffer server-side to enable 1-click B2 storage
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch(pollUrl, {
        headers: { Accept: "image/*" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > 0 && arrayBuf.byteLength <= 10 * 1024 * 1024) {
          const buffer = Buffer.from(arrayBuf);
          dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
        }
      }
    } catch (fetchErr) {
      console.warn("[AiVariantStudio] Server-side buffer download blip, client will use direct CDN URL:", fetchErr);
    }

    return NextResponse.json(
      {
        ok: true,
        imageUrl: pollUrl,
        dataUrl,
        promptUsed: luxuryPrompt,
        targetColor,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[AiVariantStudio] Generation route error:", err);
    return NextResponse.json(
      { error: "Internal server error while generating variant." },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
