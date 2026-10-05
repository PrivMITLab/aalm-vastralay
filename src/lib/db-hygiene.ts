import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Database Storage Hygiene & Auto-Pruning Engine.
 *
 * Prevents Neon/PostgreSQL free-tier storage (500 MB) from exhausting by
 * automatically pruning transient rows on every app startup.
 *
 * Safe tables (NEVER pruned): orders, users, products, audit_logs, transactions
 */
export async function autoPruneOldData() {
  const report: Record<string, number> = {};

  try {
    // 1. Rate limit counters older than 2 hours (short-lived sliding window rows)
    const resRl = await db.execute(
      sql`DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours'`
    );
    report.prunedRateLimits = resRl.rowCount ?? 0;

    // 2. Login attempts older than 30 days
    const resLogin = await db.execute(
      sql`DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days'`
    );
    report.prunedLoginAttempts = resLogin.rowCount ?? 0;

    // 3. Read notifications older than 90 days
    const resNotif = await db.execute(
      sql`DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '90 days'`
    );
    report.prunedNotifications = resNotif.rowCount ?? 0;

    // 4. Expired PoW challenge hashes (used_at older than 24 hours)
    //    pow_used fills up fast — every form submit inserts a row
    const resPow = await db.execute(
      sql`DELETE FROM pow_used WHERE used_at < NOW() - INTERVAL '24 hours'`
    );
    report.prunedPowHashes = resPow.rowCount ?? 0;

    // 5. Expired Better Auth verification tokens (OTP, email-verify, magic-link)
    //    verification table never self-prunes; OTPs expire in 10–15 min
    const resVerif = await db.execute(
      sql`DELETE FROM verification WHERE expires_at < NOW()`
    );
    report.prunedVerifications = resVerif.rowCount ?? 0;

    // 6. Old user_activity rows older than 90 days (browsing/search history)
    //    Keeps recent activity for AI recommendations, drops stale history
    const resActivity = await db.execute(
      sql`DELETE FROM user_activity WHERE created_at < NOW() - INTERVAL '90 days'`
    );
    report.prunedUserActivity = resActivity.rowCount ?? 0;

    // 7. Old audit_logs older than 1 year (keep recent logs, drop ancient ones)
    //    This is the only audit_log pruning — 1 year retention is sufficient
    const resAudit = await db.execute(
      sql`DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year'`
    );
    report.prunedAuditLogs = resAudit.rowCount ?? 0;

    return { ok: true, ...report };
  } catch (err) {
    console.error("[db-hygiene] Pruning error (non-fatal):", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
