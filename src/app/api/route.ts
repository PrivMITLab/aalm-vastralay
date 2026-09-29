import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — ROOT API GATEWAY STATUS
 * Provides a clean health status and explicit Content-Type header
 * for top-level /api and /api/ health/discovery probes.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "Aalm Vastralay API Gateway",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
