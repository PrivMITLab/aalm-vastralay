import { NextResponse, type NextRequest } from "next/server";
import { isProtectedRoute, SESSION_COOKIE_NAME } from "@/lib/auth/config";

/**
 * 👑 AALM VASTRALAY — HIGH-PERFORMANCE EDGE MIDDLEWARE
 *
 * Rules:
 *  1. ZERO database queries inside middleware.
 *  2. Fast path execution under 10ms.
 *  3. Explicitly skips all static assets, Next internal files, and public images.
 *  4. Protects administrative and checkout routes by verifying session cookie presence.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - brand / public media files
     * - Static extensions: svg, png, jpg, jpeg, gif, webp, ico, txt, xml, mp4, webm
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|mp4|webm)).*)",
    "/(api|trpc)(.*)",
  ],
};
