import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — ROOT API GATEWAY
 * Returns 200 OK on GET with explicit application/json Content-Type header
 * for uptime monitoring, health probes, and security baseline compliance (OWASP ZAP 10019).
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, name: "Aalm Vastralay API Gateway", version: "1.0.0" },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}

function apiNotFoundResponse() {
  return NextResponse.json(
    { ok: false, error: "Not Found" },
    {
      status: 404,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST() {
  return apiNotFoundResponse();
}

export async function PUT() {
  return apiNotFoundResponse();
}

export async function DELETE() {
  return apiNotFoundResponse();
}
