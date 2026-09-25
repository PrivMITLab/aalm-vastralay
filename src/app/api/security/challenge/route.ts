import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/pow";
import { getSetting, getSettingNumber } from "@/lib/settings";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Issues a signed, expiring proof-of-work challenge (Altcha-style).
 * Self-hosted: no captcha vendor, no API key, no tracking, works fully offline.
 */
export async function GET(req: Request) {
  const ip = clientIp(req.headers);
  const limit = memoryRateLimit(`challenge:${ip}`, 40, 60);
  if (!limit.ok) {
    return rateLimitResponse(limit, undefined, "Too many challenge requests.");
  }

  const mode = await getSetting("security.botProtection", "pow");
  if (mode !== "pow") {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const difficulty = await getSettingNumber("security.powDifficulty", 3);
  const maxnumber = await getSettingNumber("security.powMaxIterations", 100000);
  return NextResponse.json({ enabled: true, challenge: createChallenge(difficulty, maxnumber) }, { headers: { "Cache-Control": "no-store" } });
}
