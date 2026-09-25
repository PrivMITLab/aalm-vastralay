import { sql } from "drizzle-orm";
import {
  hashChallenge,
  hashIp,
  parsePayload,
  verifySolution,
  type PowAction,
  type PowVerification,
} from "./pow";

/**
 * Single-use enforcement + failure throttling for proof-of-work tokens.
 *
 * Why this file exists: verifying the puzzle is not enough — without
 * marking a token as spent, one solved puzzle replays until expiry.
 *consumeChallenge() records the challenge fingerprint in `pow_used`
 * (auto-migrated, ephemeral security nonces — never user data).
 *
 * NOTE: no `import "server-only"` here on purpose so unit tests can import
 * this module under tsx. The database is loaded lazily and only touched on
 * the default store path; tests inject an in-memory store instead.
 */

export type ChallengeStore = {
  /** Returns true when the hash was freshly recorded, false on replay. */
  consume(hash: string): Promise<boolean>;
};

const MEM_PRUNE_MS = 60 * 60 * 1000;
const memUsed = new Map<string, number>();

function memSweep(now: number) {
  if (memUsed.size > 5000) {
    for (const [k, t] of memUsed) if (now - t > MEM_PRUNE_MS) memUsed.delete(k);
  }
}

/** In-memory fallback when the database is unreachable (documented limitation: per-instance on serverless). */
export function memoryStore(): ChallengeStore {
  return {
    async consume(hash: string): Promise<boolean> {
      const now = Date.now();
      memSweep(now);
      if (memUsed.has(hash)) return false;
      memUsed.set(hash, now);
      return true;
    },
  };
}

/** Production store backed by the `pow_used` table. */
export function dbStore(): ChallengeStore {
  return {
    async consume(hash: string): Promise<boolean> {
      const { db } = await import("@/db");
      const rows = await db.execute(sql`
        INSERT INTO "pow_used" ("challenge_hash") VALUES (${hash})
        ON CONFLICT ("challenge_hash") DO NOTHING
        RETURNING "challenge_hash"
      `);
      // Best-effort prune of expired nonces; never touches user tables.
      try {
        await db.execute(sql`DELETE FROM "pow_used" WHERE "used_at" < NOW() - INTERVAL '1 hour'`);
      } catch {
        /* non-fatal hygiene */
      }
      const list = (rows as unknown as { rows?: Array<unknown> }).rows ?? [];
      return list.length > 0;
    },
  };
}

export type ConsumeOptions = {
  /** Bound form action the token must carry (legacy unbound tokens skip this). */
  action?: PowAction;
  /** Raw caller IP; hashed internally and compared to the token's ipHash. */
  ip?: string | null;
  /**
   * true (order/auth): any store outage rejects the submission.
   * false (newsletter/review): outage logs a warning and lets it pass.
   */
  strict?: boolean;
  /** Injected store for unit tests. Defaults to DB with memory fallback. */
  store?: ChallengeStore;
};

/* ------------------------- failure throttling ------------------------- */

const FAIL_WINDOW_MS = 10 * 60 * 1000;
const FAIL_LIMIT = 5;
const failCounts = new Map<string, { count: number; resetAt: number }>();

/** Records a failed PoW attempt for per-action throttling. */
export function recordPowFailure(action: string, ip: string | null | undefined): void {
  const key = `${action}:${String(ip ?? "unknown").slice(0, 80)}`;
  const now = Date.now();
  const cur = failCounts.get(key);
  if (!cur || now > cur.resetAt) failCounts.set(key, { count: 1, resetAt: now + FAIL_WINDOW_MS });
  else cur.count += 1;
}

/** True when an IP burned 5+ failures for an action inside 10 minutes. */
export function isPowBlocked(action: string, ip: string | null | undefined): boolean {
  const key = `${action}:${String(ip ?? "unknown").slice(0, 80)}`;
  const cur = failCounts.get(key);
  if (!cur) return false;
  if (Date.now() > cur.resetAt) {
    failCounts.delete(key);
    return false;
  }
  return cur.count >= FAIL_LIMIT;
}

/* ------------------------- verify + consume ------------------------- */

/** Verifies the puzzle AND marks the token spent. Inspect-enabled submits die here. */
export async function verifyPayloadAndConsume(
  payload: string | null | undefined,
  opts: ConsumeOptions = {},
): Promise<PowVerification> {
  const action = opts.action ?? "form";
  if (isPowBlocked(action, opts.ip)) {
    return { ok: false, error: "Bahut zyada galat prayas. 10 minute baad try karo. (Too many failed checks, retry in 10 minutes.)" };
  }
  const fail = (error: string): PowVerification => {
    recordPowFailure(action, opts.ip);
    return { ok: false, error };
  };

  const parsed = parsePayload(payload);
  if (!parsed) return fail(!payload ? "Suraksha jaanch missing hai. Kripya page reload karein. (Security check missing. Please reload the page.)" : "Suraksha data asuvidha-janak hai. (Security payload was malformed.)");

  const verdict = verifySolution(parsed.solution, parsed.challenge, {
    expectedAction: opts.action,
    expectedIpHash: opts.ip ? hashIp(opts.ip) : undefined,
  });
  if (!verdict.ok) return fail(verdict.error ?? "Security check failed.");

  const fingerprint = hashChallenge(String(parsed.challenge?.challenge ?? ""));
  const store = opts.store ?? dbStore();
  let fresh: boolean | null = null;
  try {
    fresh = await store.consume(fingerprint);
  } catch (err) {
    console.error("[PoW] single-use store unavailable:", err);
    fresh = null;
  }
  if (fresh === false) return fail("Ye suraksha token pehle istemal ho chuka hai. Dobara verify karo. (Token already used — please verify again.)");
  if (fresh === null) {
    if (opts.strict !== false) return fail("Security store unavailable. Please try again in a moment.");
    try {
      fresh = await memoryStore().consume(fingerprint);
    } catch {
      fresh = true;
    }
    if (!fresh) return fail("Ye suraksha token pehle istemal ho chuka hai. Dobara verify karo. (Token already used — please verify again.)");
    console.warn("[PoW] DB unavailable, fell back to memory single-use guard.");
  }
  return { ok: true, elapsedMs: verdict.elapsedMs };
}
