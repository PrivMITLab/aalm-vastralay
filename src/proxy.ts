import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: security headers, route protection and a cheap API throttle.
 *
 *  · Protected areas require a session cookie (full cryptographic verification happens
 *    server-side in requireUser()).
 *  · CSP blocks clickjacking, XSS payloads, cross-site form hijacking and data exfiltration.
 *  · A per-IP fixed window throttle protects /api routes before they reach the database.
 *  · The visitor's colour-mode preference is exposed to the server via a cookie so the
 *    correct theme renders on the very first paint (no flash of light theme).
 */

const PROTECTED_PREFIXES = ["/cart", "/checkout", "/orders", "/wishlist", "/dashboard", "/seller", "/admin", "/notifications"];

const API_LIMIT = 120; // requests / minute / IP
const buckets = new Map<string, { count: number; reset: number }>();

function throttleApi(ip: string) {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / 60000)}`;
  const current = buckets.get(key);
  const count = current ? current.count + 1 : 1;
  buckets.set(key, { count, reset: now + 60000 });

  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.reset < now) {
        buckets.delete(k);
      }
    }
    // If still oversized after removing expired keys, remove oldest keys safely
    if (buckets.size > 5000) {
      let toRemove = buckets.size - 4000;
      for (const k of buckets.keys()) {
        if (toRemove <= 0) break;
        buckets.delete(k);
        toRemove--;
      }
    }
  }

  return count <= API_LIMIT;
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "0.0.0.0"
  );
}

function securityHeaders(isApi: boolean): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload.imagekit.io https://*.imagekit.io https://loglyuk.com https://plausible.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://*.imagekit.io https://wsrv.nl https://*.workers.dev https://*.neon.tech https://loglyuk.com",
    "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "on",
    ...(isApi ? { "Cache-Control": "no-store" } : {}),
  };
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api");

  if (isApi) {
    // Public webhooks/captcha endpoints stay open; everything else is throttled by IP.
    const exempt = pathname.startsWith("/api/security") || pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/health");
    if (!exempt) {
      const ip = clientIp(request);
      if (!throttleApi(ip)) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429, headers: { ...securityHeaders(true), "Retry-After": "60" } },
        );
      }
    }
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(securityHeaders(true))) response.headers.set(key, value);
    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !request.cookies.has("av_session")) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirect_url", `${pathname}${search}`);
    const redirectResponse = NextResponse.redirect(url);
    for (const [key, value] of Object.entries(securityHeaders(false))) redirectResponse.headers.set(key, value);
    return redirectResponse;
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders(false))) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
