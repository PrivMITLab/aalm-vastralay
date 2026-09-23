/**
 * 👑 AALM VASTRALAY — LIGHTWEIGHT AUTH CONFIGURATION
 * Pure lightweight route classification and session token definition.
 * ZERO heavy imports (NO bcrypt, NO database, NO ORM, NO heavy crypto).
 * Safe for Edge middleware and client bundles.
 */

export const SESSION_COOKIE_NAME = "av_session";

/** Routes that never require authentication and bypass auth checks entirely */
export const PUBLIC_ROUTES = [
  "/",
  "/browse",
  "/products",
  "/categories",
  "/cart",
  "/sign-in",
  "/sign-up",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/api/health",
  "/api/newsletter",
  "/api/search/suggest",
  "/api/webhooks/clerk",
] as const;

/** Protected path prefixes that require an authenticated user */
export const PROTECTED_ROUTES = [
  "/account",
  "/checkout",
  "/admin",
  "/seller",
] as const;

/** Roles allowed for admin panel */
export const ADMIN_ROLES = ["admin"] as const;

/** Roles allowed for seller panel */
export const SELLER_ROLES = ["seller", "admin"] as const;

/**
 * Checks whether a given pathname is a public page.
 */
export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }
  // Brand assets and uploads are public
  if (pathname.startsWith("/brand/") || pathname.startsWith("/uploads/") || pathname.startsWith("/images/")) {
    return true;
  }
  return false;
}

/**
 * Checks whether a given pathname requires authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
