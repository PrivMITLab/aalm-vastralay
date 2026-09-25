import { NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { clientIp, memoryRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`health:${ip}`, 60, 60);
  if (!rate.ok) {
    return Response.json(
      { ok: false, error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[Health] Database health probe failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}

