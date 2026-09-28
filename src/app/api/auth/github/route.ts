import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * 👑 AALM VASTRALAY — GITHUB OAUTH INITIATOR
 * Redirects user to GitHub authorization screen with CSRF state defense.
 * 100% Free OAuth 2.0 flow.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectParam = request.nextUrl.searchParams.get("redirect_url") || "/dashboard";

  // Fallback if GitHub OAuth keys are not configured yet
  if (!clientId) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("error", "github_oauth_not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(32).toString("hex");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || request.nextUrl.origin;
  const redirectUri = `${siteUrl}/api/auth/callback/github`;

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");
  githubAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(githubAuthUrl);

  const isSecure = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
  response.cookies.set("av_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
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
