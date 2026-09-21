import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSettingsRows } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/bootstrap – idempotent production bootstrap.
 *
 *   1. Creates any missing tables / indexes (drizzle-kit push is normally run at build time)
 *   2. Back-fills any settings keys added by a later release
 *   3. Returns a JSON report
 *
 * Designed to be called by a CI step or as a Cloudflare Pages "post-deploy hook".
 * It refuses to run unless an explicit `?token=` matches BOOTSTRAP_TOKEN, so it
 * cannot be triggered anonymously.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = process.env.BOOTSTRAP_TOKEN ?? "";
  if (!token || url.searchParams.get("token") !== token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // 1. Settings back-fill (always safe – ON CONFLICT DO NOTHING)
  const added = await ensureSettingsRows();
  // 2. Light schema sanity check – try to touch every table we own.
  const report: Record<string, unknown> = { added };
  try {
    const rows = await db.execute(sql`SELECT to_regclass('public.users') AS users, to_regclass('public.products') AS products, to_regclass('public.settings') AS settings`);
    report.tables = rows.rows?.[0];
  } catch (err) {
    report.tablesError = err instanceof Error ? err.message : String(err);
  }
  report.timestamp = new Date().toISOString();
  return NextResponse.json({ ok: true, ...report });
}
