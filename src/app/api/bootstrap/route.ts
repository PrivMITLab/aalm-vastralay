import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { initCleanBaseData, wipeDemoData } from "@/db/init";

export const dynamic = "force-dynamic";

/**
 * GET /api/bootstrap – idempotent production bootstrap.
 *
 *   1. Initializes clean categories, settings, and default admin.
 *   2. If ?clean=true is passed, it wipes all demo/fake products, stores, reviews, and test users!
 *   3. Refuses to run unless an explicit `?token=` matches BOOTSTRAP_TOKEN.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = process.env.BOOTSTRAP_TOKEN ?? "";
  if (!token || url.searchParams.get("token") !== token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shouldWipe = url.searchParams.get("clean") === "true" || url.searchParams.get("wipe") === "true";
  let wipeResult: Record<string, unknown> | null = null;
  if (shouldWipe) {
    wipeResult = await wipeDemoData();
  }

  const initResult = await initCleanBaseData();

  const report: Record<string, unknown> = {
    ...initResult,
    wipedDemoData: shouldWipe ? wipeResult : false,
  };

  try {
    const rows = await db.execute(
      sql`SELECT to_regclass('public.users') AS users, to_regclass('public.products') AS products, to_regclass('public.settings') AS settings, to_regclass('public.categories') AS categories`
    );
    report.tables = rows.rows?.[0];
  } catch (err) {
    report.tablesError = err instanceof Error ? err.message : String(err);
  }

  report.timestamp = new Date().toISOString();
  return NextResponse.json({ ok: true, ...report });
}
