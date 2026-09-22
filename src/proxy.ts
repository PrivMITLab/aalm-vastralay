import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal passthrough middleware — security headers & rate-limiting temporarily
 * disabled to diagnose Cloudflare Worker 500 errors.
 * TODO: restore full logic once the root cause is confirmed.
 */
export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
