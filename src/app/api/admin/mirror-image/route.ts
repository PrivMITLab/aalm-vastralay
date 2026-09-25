import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canonicalizeImageUrl } from "@/lib/image-resolver";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isBlockedHostname } from "@/lib/security/ssrf";
import { extFromMime, looksLikeImage, persistUpload } from "@/lib/uploads";
import { getSettingNumber, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

const MAX_MIRROR_BYTES = 8 * 1024 * 1024; // 8 MB cap
const MIRROR_TIMEOUT_MS = 8000; // 8 seconds

const mirrorSchema = z.object({
  url: z.string().trim().min(1, "URL is required").max(600, "URL cannot exceed 600 characters"),
});

/**
 * 👑 AALM VASTRALAY — 1-CLICK B2 IMAGE MIRRORING API
 * POST /api/admin/mirror-image
 * Downloads external image asset with SSRF checks, magic-byte inspection,
 * and 8MB cap, persisting it directly into Backblaze B2 under banners/mirrors/.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / अनधिकृत: Keval admin ke liye anumat hai." },
        { status: 403 }
      );
    }

    const ip = clientIp(req.headers);
    const rate = memoryRateLimit(`mirror:${ip}`, 10, 60);
    if (!rate.ok) {
      return rateLimitResponse(rate, undefined, "Rate limit exceeded (10/min) / Anurodh seema samapt, kripya pratiksha karein.");
    }

    const body = await req.json().catch(() => ({}));
    const parsed = mirrorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid URL parameter" },
        { status: 400 }
      );
    }

    // 1. Canonicalize external links (Google Drive, Dropbox, etc.)
    const canonical = canonicalizeImageUrl(parsed.data.url);

    // 2. Validate URL syntax and SSRF security
    let targetUrl: URL;
    try {
      targetUrl = new URL(canonical);
      if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
        return NextResponse.json(
          { success: false, error: "Only HTTP/HTTPS URLs allowed / Keval HTTP/HTTPS anumat hai." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed URL syntax / Galat URL format." },
        { status: 400 }
      );
    }

    if (isBlockedHostname(targetUrl.hostname)) {
      return NextResponse.json(
        { success: false, error: "Private and local host access blocked / Suraksha karano se private network apekshit nahi hai." },
        { status: 403 }
      );
    }

    // 3. Fetch image with 8s abort timeout & 8MB cap
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MIRROR_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(targetUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "AalmVastralay-MirrorBot/2.0 (+https://aalmvastralay.com)",
          Accept: "image/webp,image/avif,image/png,image/jpeg,image/*;q=0.9",
        },
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isTimeout = (fetchErr as Error)?.name === "AbortError";
      return NextResponse.json(
        {
          success: false,
          error: isTimeout
            ? "Image download timed out (8s limit) / Chhavi download samay seema (8 sec) paar ho gayi."
            : "Failed to download image from source URL / Chhavi download karne mein viphal.",
        },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream server returned HTTP ${res.status} / Mool server ne ${res.status} bheja.` },
        { status: 502 }
      );
    }

    // Check Content-Length header
    const contentLength = Number(res.headers.get("content-length"));
    if (contentLength && contentLength > MAX_MIRROR_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 8MB cap / Chhavi 8MB aakar seema se badi hai." },
        { status: 413 }
      );
    }

    // Read buffer and enforce cap
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Downloaded file is empty / Prapt file khali hai." },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_MIRROR_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 8MB cap / Chhavi 8MB aakar seema se badi hai." },
        { status: 413 }
      );
    }

    // Detect MIME type
    let mime = (res.headers.get("content-type") || "").toLowerCase().split(";")[0]?.trim();
    if (!mime || mime === "application/octet-stream" || !mime.startsWith("image/")) {
      // Sniff MIME from magic bytes
      if (buffer[0] === 0xff && buffer[1] === 0xd8) mime = "image/jpeg";
      else if (buffer[0] === 0x89 && buffer[1] === 0x50) mime = "image/png";
      else if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") mime = "image/webp";
      else if (buffer.subarray(4, 8).toString("ascii") === "ftyp") mime = "image/avif";
      else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) mime = "image/gif";
      else mime = "image/jpeg";
    }

    // 4. Verify magic bytes
    if (!looksLikeImage(buffer, mime)) {
      return NextResponse.json(
        { success: false, error: "File contents do not match genuine image magic bytes / File chhavi praaroop se mel nahi khati." },
        { status: 400 }
      );
    }

    // 5. Persist to Backblaze B2 (under banners/mirrors)
    const base64Data = `data:${mime};base64,${buffer.toString("base64")}`;
    const uploadResult = await persistUpload({
      bucket: "banners/mirrors",
      data: base64Data,
      mime,
    });

    // 6. Update cumulative mirrored bytes stat
    const currentTotal = await getSettingNumber("stats.mirroredBytes", 0);
    const newTotal = currentTotal + buffer.length;
    await setSetting("stats.mirroredBytes", String(newTotal), user.id);

    return NextResponse.json({
      success: true,
      mirroredUrl: uploadResult.url,
      bytes: buffer.length,
      mime,
      mirroredAt: new Date().toISOString(),
      totalMirroredBytes: newTotal,
      message: "Image successfully mirrored to B2 / Chhavi B2 mein surakshit roop se mirror ho gayi.",
    });
  } catch (err) {
    console.error("[MirrorImage API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during image mirror / Chhavi mirror karne mein aantarik truti." },
      { status: 500 }
    );
  }
}
