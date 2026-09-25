import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canonicalizeImageUrl, resolveImage } from "@/lib/image-resolver";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Block private/internal IP ranges to prevent SSRF */
function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().trim();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (h === "169.254.169.254" || h.includes("metadata.google.internal")) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)) return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  return false;
}

/**
 * GET/POST /api/admin/scrape-image
 * Extracts direct image URL from Google Drive, Dropbox, or any arbitrary webpage via OpenGraph tags.
 */
export async function GET(req: NextRequest) {
  return handleScrape(req);
}

export async function POST(req: NextRequest) {
  return handleScrape(req);
}

async function handleScrape(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`scrape:${ip}`, 30, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate, undefined, "Rate limit exceeded. Please wait.");
  }

  let targetUrl = "";
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    targetUrl = typeof body?.url === "string" ? body.url.trim() : "";
  }
  if (!targetUrl) {
    targetUrl = (req.nextUrl.searchParams.get("url") ?? "").trim();
  }

  if (!targetUrl) {
    return NextResponse.json({ ok: false, error: "Missing url parameter" }, { status: 400 });
  }

  // First, check if canonicalizeImageUrl can transform it directly without network call (e.g. Google Drive, Dropbox)
  const canonical = canonicalizeImageUrl(targetUrl);
  if (canonical !== targetUrl) {
    return NextResponse.json({
      ok: true,
      imageUrl: canonical,
      resolvedUrl: resolveImage(canonical),
      source: "canonicalized",
    });
  }

  // If already a direct image extension, return directly
  if (/\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(targetUrl)) {
    return NextResponse.json({
      ok: true,
      imageUrl: targetUrl,
      resolvedUrl: resolveImage(targetUrl),
      source: "direct_image",
    });
  }

  // Parse and validate URL
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ ok: false, error: "Only HTTP and HTTPS URLs are supported." }, { status: 400 });
    }
    if (isBlockedHostname(parsed.hostname)) {
      return NextResponse.json({ ok: false, error: "Target host is not permitted." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid URL provided." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8,*/*;q=0.7",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";

    // If upstream returns an image directly
    if (contentType.startsWith("image/")) {
      return NextResponse.json({
        ok: true,
        imageUrl: res.url,
        resolvedUrl: resolveImage(res.url),
        source: "response_image",
      });
    }

    const html = await res.text();

    // 1. og:image or og:image:secure_url
    const ogMatch =
      html.match(/<meta\s+property=["']og:image(?::secure_url)?["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image(?::secure_url)?["']/i);

    // 2. twitter:image
    const twitterMatch =
      html.match(/<meta\s+name=["']twitter:image(?::src)?["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+name=["']twitter:image(?::src)?["']/i);

    // 3. link rel="image_src"
    const linkMatch =
      html.match(/<link\s+rel=["']image_src["']\s+href=["'](.*?)["']/i) ||
      html.match(/<link\s+href=["'](.*?)["']\s+rel=["']image_src["']/i);

    // 4. Page title
    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<title[^>]*>(.*?)<\/title>/i);

    const rawExtracted = ogMatch?.[1] || twitterMatch?.[1] || linkMatch?.[1] || "";

    if (!rawExtracted) {
      // Try finding the first large image in HTML
      const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp|avif))["']/i);
      if (imgMatch?.[1]) {
        return NextResponse.json({
          ok: true,
          imageUrl: imgMatch[1],
          resolvedUrl: resolveImage(imgMatch[1]),
          title: titleMatch?.[1]?.trim() || "",
          source: "scraped_body_image",
        });
      }

      return NextResponse.json({
        ok: false,
        error: "Could not find a banner or preview image on this page. Please paste the direct image link.",
      });
    }

    // Resolve relative URL if needed
    let absoluteImage = rawExtracted.trim();
    try {
      absoluteImage = new URL(absoluteImage, res.url).toString();
    } catch {
      // keep as is
    }

    return NextResponse.json({
      ok: true,
      imageUrl: absoluteImage,
      resolvedUrl: resolveImage(absoluteImage),
      title: titleMatch?.[1]?.trim() || "",
      source: "scraped_opengraph",
    });
  } catch (err) {
    console.error("[Scrape-Image] Failed to scrape URL:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to scrape the webpage. Please check the URL or paste the direct image link." },
      { status: 502 }
    );
  }
}
