import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";

/**
 * Database-backed fixed-window rate limiter.
 * Works on serverless/edge deploys (no in-memory state needed), safe under concurrency
 * because the window increment is a single atomic upsert statement.
 */

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
};

type Bucket = { key: string; limit: number; windowSeconds: number; failClosed?: boolean };

/**
 * Strict IPv4 and IPv6 format validator.
 * Rejects invalid, malformed, or injected strings.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const trimmed = ip.trim();
  if (trimmed.length === 0 || trimmed.length > 45) return false;

  // IPv4 check: 4 octets, 0-255 each
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
  if (ipv4Regex.test(trimmed)) return true;

  // IPv6 check: standard hex groups and compressed :: notation
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(trimmed);
}

/**
 * Safely resolves caller IP address.
 * Validates against strict IPv4/IPv6 regex.
 * Routes invalid/spoofed IPs to "unknown" bucket.
 */
export function clientIp(headers: Headers, trustProxy = true): string {
  const trustEnv = process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true" || trustProxy;

  if (trustEnv) {
    // 1. Cloudflare connecting IP
    const cf = headers.get("cf-connecting-ip")?.trim();
    if (cf && isValidIp(cf)) return cf;

    // 2. Vercel real IP / Forwarded IP
    const vercel = headers.get("x-vercel-forwarded-for")?.trim() || headers.get("x-real-ip")?.trim();
    if (vercel && isValidIp(vercel)) return vercel;

    // 3. Leftmost valid IP from x-forwarded-for
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const candidates = xff.split(",").map((s) => s.trim());
      for (const candidate of candidates) {
        if (isValidIp(candidate)) {
          return candidate;
        }
      }
    }
  }

  // 4. Direct socket / fallback header
  const client = headers.get("x-client-ip")?.trim();
  if (client && isValidIp(client)) return client;

  return "unknown";
}

export async function rateLimit({ key, limit, windowSeconds, failClosed }: Bucket): Promise<RateLimitResult> {
  const now = Date.now();
  try {
    const rows = await db.execute<{ count: number; window_start: Date }>(sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, NOW())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN NOW()
          ELSE rate_limits.window_start
        END
      RETURNING count, window_start
    `);
    const row = (rows.rows ?? [])[0];
    const count = Number(row?.count ?? 1);
    const windowStart = row?.window_start ? new Date(row.window_start) : new Date(now);
    const resetAt = new Date(windowStart.getTime() + windowSeconds * 1000);
    const remaining = Math.max(0, limit - count);
    return {
      ok: count <= limit,
      limit,
      remaining,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - now) / 1000)),
      resetAt,
    };
  } catch (err) {
    console.error(`[RateLimit] DB rate limit check failed for key "${key}":`, err);
    if (failClosed) {
      // Sensitive routes fail closed to prevent brute-force attacks during database saturation
      return {
        ok: false,
        limit,
        remaining: 0,
        retryAfterSeconds: 60,
        resetAt: new Date(now + 60000),
      };
    }
    // Public routes fallback to memory rate limiting
    const mem = memoryRateLimit(key, limit, windowSeconds);
    return {
      ok: mem.ok,
      limit,
      remaining: mem.remaining,
      retryAfterSeconds: mem.retryAfterSeconds,
      resetAt: new Date(now + (mem.retryAfterSeconds || windowSeconds) * 1000),
    };
  }
}

export function describeLimit(result: RateLimitResult) {
  return `Too many requests. Please try again in ${result.retryAfterSeconds} seconds.`;
}

/** Returns standard 429 response with RFC-compliant headers */
export function rateLimitResponse(
  result: { retryAfterSeconds?: number; limit?: number; remaining?: number },
  requestId?: string,
  message?: string
): NextResponse {
  const reqId = requestId ?? crypto.randomUUID();
  const retrySec = String(result.retryAfterSeconds ?? 60);
  const limit = String(result.limit ?? 0);
  const remaining = String(result.remaining ?? 0);

  return NextResponse.json(
    {
      success: false,
      error: message ?? `Too many requests. Please try again in ${retrySec} seconds.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retrySec,
        "X-RateLimit-Limit": limit,
        "X-RateLimit-Remaining": remaining,
        "X-Request-Id": reqId,
      },
    }
  );
}

/** Convenience wrapper returning a friendly error string when the limit is exceeded. */
export async function guard(
  key: string,
  limit: number,
  windowSeconds: number,
  message?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await rateLimit({ key, limit, windowSeconds });
  if (result.ok) return { ok: true };
  return { ok: false, error: message ?? describeLimit(result) };
}

/**
 * In-memory fixed-window rate limiter for high-frequency or public endpoints (e.g. bootstrap, courier, health, search).
 * Operates at zero financial cost, avoiding Neon connection pooler slots and compute minutes on free tier.
 */
interface MemoryWindow {
  count: number;
  resetAt: number;
}

const memoryLimitStore = new Map<string, MemoryWindow>();
let lastPrune = Date.now();

function pruneMemoryLimitStore() {
  const now = Date.now();
  if (now - lastPrune < 300_000) return; // Prune at most every 5 minutes
  lastPrune = now;
  for (const [k, v] of memoryLimitStore.entries()) {
    if (v.resetAt <= now) {
      memoryLimitStore.delete(k);
    }
  }
}

export function memoryRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { ok: boolean; remaining: number; retryAfterSeconds: number; limit: number } {
  pruneMemoryLimitStore();
  const now = Date.now();
  const existing = memoryLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0, limit };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds, limit };
  }

  return { ok: true, remaining, retryAfterSeconds: 0, limit };
}

