import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Database Storage Hygiene & Auto-Pruning Engine.
 * 
 * Prevents Neon/PostgreSQL free-tier storage (500 MB) from exhausting by
 * automatically pruning transient rows (rate-limit counters, expired login attempts,
 * old read notifications, and old audit logs).
 */
export async function autoPruneOldData() {
  const report: Record<string, number> = {};

  try {
    // 1. Rate limits older than 2 hours (these are short-lived window counters)
    const resRl = await db.execute(
      sql`DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours'`
    );
    report.prunedRateLimits = resRl.rowCount ?? 0;

    // 2. Failed / old login attempts older than 30 days
    const resLogin = await db.execute(
      sql`DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days'`
    );
    report.prunedLoginAttempts = resLogin.rowCount ?? 0;

    // 3. Read notifications older than 90 days
    const resNotif = await db.execute(
      sql`DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '90 days'`
    );
    report.prunedNotifications = resNotif.rowCount ?? 0;

    // Note: audit_logs, orders, users, and transactions are NEVER pruned (zero data loss policy)
    return { ok: true, ...report };
  } catch (err) {
    console.error("[db-hygiene] Pruning error (non-fatal):", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
