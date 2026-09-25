import { sql } from "drizzle-orm";
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

type Bucket = { key: string; limit: number; windowSeconds: number };

export async function rateLimit({ key, limit, windowSeconds }: Bucket): Promise<RateLimitResult> {
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
  } catch {
    // Never block traffic because the limiter itself failed.
    return { ok: true, limit, remaining: limit, retryAfterSeconds: 0, resetAt: new Date(now) };
  }
}

/** Best-effort client IP, trusting Cloudflare / proxy headers when enabled. */
export function clientIp(headers: Headers, trustProxy = true) {
  if (trustProxy) {
    const cf = headers.get("cf-connecting-ip");
    if (cf) return cf.trim();
    const xff = headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]!.trim();
    const real = headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return headers.get("x-client-ip")?.trim() ?? "0.0.0.0";
}

export function describeLimit(result: RateLimitResult) {
  return `Too many requests. Please try again in ${result.retryAfterSeconds} seconds.`;
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
): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  pruneMemoryLimitStore();
  const now = Date.now();
  const existing = memoryLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  return { ok: true, remaining, retryAfterSeconds: 0 };
}

