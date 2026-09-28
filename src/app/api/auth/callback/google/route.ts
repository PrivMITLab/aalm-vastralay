import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/**
 * 👑 AALM VASTRALAY — GOOGLE OAUTH CALLBACK HANDLER
 * Validates CSRF state, exchanges code for verified profile, upserts user in Neon DB, and sets session cookie.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const storedState = request.cookies.get("av_oauth_state")?.value;
  const storedRedirect = request.cookies.get("av_oauth_redirect")?.value || "/dashboard";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || request.nextUrl.origin;
  const errorRedirect = (reason: string) => {
    const url = new URL("/sign-in", siteUrl);
    url.searchParams.set("error", reason);
    const res = NextResponse.redirect(url);
    res.cookies.delete("av_oauth_state");
    res.cookies.delete("av_oauth_redirect");
    return res;
  };

  if (oauthError) {
    return errorRedirect(`google_${oauthError}`);
  }

  if (!code || !state || !storedState) {
    return errorRedirect("invalid_oauth_request");
  }

  // Timing-safe state comparison to prevent CSRF / timing attacks
  const stateA = Buffer.from(state);
  const stateB = Buffer.from(storedState);
  if (stateA.length !== stateB.length || !timingSafeEqual(stateA, stateB)) {
    return errorRedirect("oauth_state_mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorRedirect("google_oauth_not_configured");
  }

  const redirectUri = `${siteUrl}/api/auth/callback/google`;

  try {
    // 1. Exchange authorization code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange error:", await tokenRes.text());
      return errorRedirect("token_exchange_failed");
    }

    const tokens = (await tokenRes.json()) as { access_token?: string; id_token?: string };
    if (!tokens.access_token) {
      return errorRedirect("no_access_token");
    }

    // 2. Fetch verified Google profile
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return errorRedirect("userinfo_failed");
    }

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;
    if (!userInfo.email) {
      return errorRedirect("no_email_provided");
    }

    const email = userInfo.email.trim().toLowerCase();
    const fullName = userInfo.name || email.split("@")[0];
    const avatarUrl = userInfo.picture || null;
    const googleSub = userInfo.sub;

    // 3. Check existing user in Neon DB or register new user
    let [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: `google_${googleSub}`,
          email,
          fullName,
          avatarUrl,
          role: "customer",
          passwordHash: null,
        })
        .returning();
      existingUser = newUser;
    } else if (!existingUser.avatarUrl && avatarUrl) {
      // Sync Google avatar if current profile has none
      await db.update(users).set({ avatarUrl }).where(eq(users.id, existingUser.id));
      existingUser = { ...existingUser, avatarUrl };
    }

    // Guard against suspended accounts
    if (!existingUser.isActive) {
      return errorRedirect("account_suspended");
    }

    // 4. Issue secure HTTP-only session cookie
    await setSessionCookie(existingUser);

    // 5. Cleanup temporary cookies and redirect
    const finalDestination = storedRedirect.startsWith("/") && !storedRedirect.startsWith("//") ? storedRedirect : "/dashboard";
    const successResponse = NextResponse.redirect(new URL(finalDestination, siteUrl));
    successResponse.cookies.delete("av_oauth_state");
    successResponse.cookies.delete("av_oauth_redirect");
    return successResponse;
  } catch (err) {
    console.error("[Google OAuth] Unexpected callback failure:", err);
    return errorRedirect("oauth_internal_error");
  }
}
