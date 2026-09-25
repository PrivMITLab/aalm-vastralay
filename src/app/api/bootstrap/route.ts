import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { initCleanBaseData, wipeDemoData } from "@/db/init";
import { clientIp, memoryRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Constant-time string comparison via SHA-256 digests to prevent timing attacks */
function timingSafeTokenCompare(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const hashProvided = crypto.createHash("sha256").update(provided).digest();
  const hashExpected = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(hashProvided, hashExpected);
}

async function handleBootstrap(req: Request) {
  const ip = clientIp(req.headers);
  const rateCheck = memoryRateLimit(`bootstrap:${ip}`, 5, 60);
  if (!rateCheck.ok) {
    return NextResponse.json(
      { error: "Too many bootstrap attempts. Please retry later." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
    );
  }

  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization") || "";
  const customHeader = req.headers.get("x-bootstrap-token") || "";

  let providedToken = url.searchParams.get("token") || customHeader;
  if (!providedToken && authHeader.toLowerCase().startsWith("bearer ")) {
    providedToken = authHeader.slice(7).trim();
  }

  let bodyClean = false;
  let bodyWipe = false;
  let bodyConfirm = false;

  if (req.method === "POST") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json().catch(() => ({}));
        if (body && typeof body === "object") {
          if (!providedToken && typeof body.token === "string") {
            providedToken = body.token;
          }
          bodyClean = Boolean(body.clean);
          bodyWipe = Boolean(body.wipe);
          bodyConfirm = body.confirm === "yes" || body.confirm === true;
        }
      }
    } catch {
      // Non-JSON body or empty body, ignore
    }
  }

  const expectedToken = process.env.BOOTSTRAP_TOKEN ?? "";
  if (!expectedToken || !timingSafeTokenCompare(providedToken, expectedToken)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const queryClean = url.searchParams.get("clean") === "true" || url.searchParams.get("wipe") === "true";
  const queryConfirm = url.searchParams.get("confirm") === "yes" || url.searchParams.get("confirm") === "true";

  const isWipeRequested = queryClean || bodyClean || bodyWipe;
  const isConfirmed = queryConfirm || bodyConfirm;

  let wipeResult: Record<string, unknown> | null = null;
  if (isWipeRequested) {
    if (!isConfirmed) {
      return NextResponse.json(
        {
          error: "Wipe requested without confirmation. Append confirm=yes or { confirm: 'yes' } to confirm wiping demo data.",
        },
        { status: 400 }
      );
    }
    wipeResult = await wipeDemoData();
  }

  const initResult = await initCleanBaseData();

  const report: Record<string, unknown> = {
    ...initResult,
    wipedDemoData: isWipeRequested ? wipeResult : false,
  };

  try {
    const rows = await db.execute(
      sql`SELECT to_regclass('public.users') AS users, to_regclass('public.products') AS products, to_regclass('public.settings') AS settings, to_regclass('public.categories') AS categories`
    );
    report.tables = rows.rows?.[0];
  } catch (err) {
    console.error("[Bootstrap] Table query error:", err);
    report.tablesError = "Database table introspection encountered an error.";
  }

  report.timestamp = new Date().toISOString();
  return NextResponse.json({ ok: true, ...report });
}

/**
 * POST /api/bootstrap – Preferred idempotent production bootstrap.
 */
export async function POST(req: Request) {
  return handleBootstrap(req);
}

/**
 * GET /api/bootstrap – Backwards-compatible bootstrap.
 */
export async function GET(req: Request) {
  return handleBootstrap(req);
}

