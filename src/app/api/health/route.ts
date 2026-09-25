import { NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`health:${ip}`, 60, 60);
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  try {
    await db.execute(sql`select 1`);
    /** Cache at Vercel Edge for 60s — uptime monitors stop burning a Neon round-trip every ping. */
    return Response.json({ ok: true }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("[Health] Database health probe failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}

