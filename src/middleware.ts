import { NextResponse, type NextRequest } from "next/server";
import { isProtectedRoute, SESSION_COOKIE_NAME } from "@/lib/auth/config";

/**
 * 👑 AALM VASTRALAY — HIGH-PERFORMANCE EDGE MIDDLEWARE
 *
 * Rules:
 *  1. ZERO database queries inside middleware.
 *  2. Fast path execution under 10ms.
 *  3. Explicitly skips all legitimate static assets, Next internal files, and public images.
 *  4. Protects administrative and checkout routes by verifying session cookie structure and expiration.
 *  5. Never allows static-asset extension spoofing (e.g. /admin/users.png) to bypass auth.
 */

/** Validates session token structure without heavy crypto on Edge */
function isValidSessionStructure(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, exp, sig] = parts;
  if (!userId || !exp || !sig) return false;
  // UUID v4 format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return false;
  }
  const expiry = Number(exp);
  if (isNaN(expiry) || expiry <= Date.now()) {
    return false;
  }
  // Base64url signature minimum length check
  if (sig.length < 16) {
    return false;
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass genuine public media assets
  if (
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  // 2. Sensitive path detection (immune to static extension spoofing like /admin/data.json or /admin/pic.png)
  const isSensitive =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/api/admin") ||
    isProtectedRoute(pathname);

  if (isSensitive) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!isValidSessionStructure(sessionCookie)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access" },
          { status: 401 }
        );
      }
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
     * Note: Protected routes (/admin, /seller, /account, /api/admin) are ALWAYS matched,
     * preventing static file extension bypass (/admin/users.png).
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
