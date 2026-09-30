import { NextResponse, type NextRequest } from "next/server";
import { resolveImage } from "@/lib/media-resolver";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { searchEthnicCatalog } from "@/lib/typesense";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — FEDERATED INSTANT SEARCH API
 * GET /api/search?q=...&limit=24
 * Rate limited to 60/min per IP, max query length 60 characters.
 * Powered by Typesense Typo-Tolerant Engine with fail-soft PostgreSQL fallback.
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`search:${ip}`, 60, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate, undefined, "Too many search queries. Please slow down.");
  }

  const { searchParams } = req.nextUrl;
  const rawQ = (searchParams.get("q") ?? "").trim();
  const q = rawQ.slice(0, 60);
  const limit = Math.min(60, Math.max(1, Number(searchParams.get("limit")) || 24));

  if (!q) {
    return NextResponse.json({ query: "", count: 0, products: [] });
  }

  try {
    const searchRes = await searchEthnicCatalog(q, { limit });

    return NextResponse.json(
      {
        query: q,
        source: searchRes.source,
        latencyMs: searchRes.latencyMs,
        count: searchRes.products.length,
        total: searchRes.total,
        products: searchRes.products.map((r) => ({
          ...r,
          image: resolveImage(r.images[0], { width: 500 }),
          url: `/products/${r.slug}`,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[api/search] Error:", err);
    return NextResponse.json(
      { error: "Search query failed" },
      { status: 500 }
    );
  }
}
