import { NextResponse } from "next/server";
import { createChallenge, hashIp, isPowAction } from "@/lib/pow";
import { getSetting, getSettingNumber } from "@/lib/settings";
import { clientIp, memoryRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Issues a signed, expiring proof-of-work challenge (Altcha-style).
 * Self-hosted: no captcha vendor, no API key, no tracking, works fully offline.
 *
 * Optional query params (both validated):
 * - action: binds the token to one form (newsletter|order|auth|review|contact).
 *   Absent = legacy unbound challenge for the invisible auto-shield.
 * - ttl: lifetime in seconds, clamped 60–600 (click-to-solve uses 180).
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

  const url = new URL(req.url);
  const rawAction = url.searchParams.get("action");
  const action = rawAction && isPowAction(rawAction) ? rawAction : undefined;
  const rawTtl = Number(url.searchParams.get("ttl") ?? "");
  const ttlMs = Number.isFinite(rawTtl) ? Math.min(600, Math.max(60, Math.floor(rawTtl))) * 1000 : undefined;

  const difficulty = await getSettingNumber("security.powDifficulty", 3);
  const maxnumber = await getSettingNumber("security.powMaxIterations", 100000);
  const challenge = createChallenge(difficulty, maxnumber, {
    ...(ttlMs ? { ttlMs } : {}),
    ...(action ? { action, ipHash: hashIp(ip) } : {}),
  });
  return NextResponse.json({ enabled: true, challenge }, { headers: { "Cache-Control": "no-store" } });
}
