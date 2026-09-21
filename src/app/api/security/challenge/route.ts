import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/pow";
import { getSetting, getSettingNumber } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Issues a signed, expiring proof-of-work challenge (Altcha-style).
 * Self-hosted: no captcha vendor, no API key, no tracking, works fully offline.
 */
export async function GET(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const limit = await rateLimit({ key: `challenge:${ip}`, limit: 40, windowSeconds: 60 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many challenge requests." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const mode = await getSetting("security.botProtection", "pow");
  if (mode !== "pow") {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const difficulty = await getSettingNumber("security.powDifficulty", 3);
  const maxnumber = await getSettingNumber("security.powMaxIterations", 100000);
  return NextResponse.json({ enabled: true, challenge: createChallenge(difficulty, maxnumber) }, { headers: { "Cache-Control": "no-store" } });
}
