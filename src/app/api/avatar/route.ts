import { NextResponse } from "next/server";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";

export const dynamic = "force-dynamic";

/**
 * Self-hosted privacy-first avatar generator (DiceBear `lorelei` style).
 *
 * - No external API, no rate limits: the SVG is rendered inside our own
 *   serverless function from pure code + seed.
 * - Deterministic: the same seed always yields the same avatar.
 * - Edge-cached for 1 year (`immutable`) so repeated views never re-run
 *   the function — bandwidth and invocation saver on Vercel Hobby.
 *
 * Security: `seed` is strictly sanitized (alphanumerics, dash, underscore;
 * max 50 chars) so it can only influence the deterministic PRNG, never HTML.
 */
function sanitizeSeed(raw: string | null): string {
  const cleaned = (raw ?? "").replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50);
  return cleaned || "guest";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seed = sanitizeSeed(url.searchParams.get("seed"));

    // Rendered synchronously in-memory; no network, no disk, no PII stored.
    const svg = createAvatar(lorelei, {
      seed,
      size: 128,
      backgroundColor: ["f3e5f5", "ede7f6", "fff8e1"],
    }).toString();

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        // 1-year immutable edge cache: same seed = same bytes forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[Avatar] generation failed:", err);
    return NextResponse.json({ success: false, error: "Could not generate avatar" }, { status: 500 });
  }
}
