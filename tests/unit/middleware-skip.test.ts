/**
 * 👑 AALM VASTRALAY — UNIT TEST: MIDDLEWARE MATCHER & ROUTE CHECK
 * Validates Optimization 2.1 & 2.2:
 *  - Static assets skip matcher correctly
 *  - Protected routes require auth
 *  - Public routes bypass checks
 */

import { isPublicRoute, isProtectedRoute } from "../../src/lib/auth/config";

export async function testMiddlewareSkip() {
  console.log("  ▶ Running Middleware Static Skip & Route Logic Tests...");

  // 1. Static asset paths should be public / skip
  const staticSamples = [
    "/brand/poster.png",
    "/brand/logo.svg",
    "/images/placeholder.svg",
    "/uploads/demo.webp",
  ];
  for (const path of staticSamples) {
    if (!isPublicRoute(path)) {
      throw new Error(`Failed: Static asset ${path} was not recognized as public!`);
    }
  }

  // 2. Protected routes must require auth
  const protectedSamples = [
    "/admin",
    "/admin/products",
    "/seller",
    "/seller/dashboard",
    "/checkout",
    "/account",
  ];
  for (const path of protectedSamples) {
    if (!isProtectedRoute(path)) {
      throw new Error(`Failed: Route ${path} must be recognized as protected!`);
    }
  }

  // 3. Regular browsing pages should not be protected
  const browsingSamples = [
    "/",
    "/browse",
    "/products",
    "/categories",
    "/cart",
    "/sign-in",
  ];
  for (const path of browsingSamples) {
    if (isProtectedRoute(path)) {
      throw new Error(`Failed: Public browsing route ${path} should NOT be protected!`);
    }
  }

  console.log("  ✔ Middleware static skip & route logic verified!");
}
