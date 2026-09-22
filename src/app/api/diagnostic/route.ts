import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
}
