import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — GOOGLE OAUTH INITIATOR
 * Redirects the user to Google Accounts consent screen with CSRF state protection.
 * 100% Free OpenID Connect / OAuth 2.0 flow.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectParam = request.nextUrl.searchParams.get("redirect_url") || "/dashboard";

  // Graceful fallback: If Google OAuth credentials are not configured yet, redirect with helpful code
  if (!clientId) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("error", "google_oauth_not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(32).toString("hex");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || request.nextUrl.origin;
  const redirectUri = `${siteUrl}/api/auth/callback/google`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleAuthUrl);

  const isSecure = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
  response.cookies.set("av_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  const safeRedirect = redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/dashboard";
  response.cookies.set("av_oauth_redirect", safeRedirect, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
