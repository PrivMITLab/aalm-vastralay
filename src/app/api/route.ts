import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — ROOT API GATEWAY
 * Returns 404 with explicit application/json Content-Type header
 * for unhandled top-level /api and /api/ requests.
 */
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

export async function GET() {
  return apiNotFoundResponse();
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
