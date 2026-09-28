import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  email?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/**
 * 👑 AALM VASTRALAY — GITHUB OAUTH CALLBACK HANDLER
 * Validates CSRF state, exchanges code for access token, extracts verified email, upserts user, and logs in.
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
    return errorRedirect(`github_${oauthError}`);
  }

  if (!code || !state || !storedState) {
    return errorRedirect("invalid_oauth_request");
  }

  // Timing safe state verification
  const stateA = Buffer.from(state);
  const stateB = Buffer.from(storedState);
  if (stateA.length !== stateB.length || !timingSafeEqual(stateA, stateB)) {
    return errorRedirect("oauth_state_mismatch");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorRedirect("github_oauth_not_configured");
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      console.error("[GitHub OAuth] Token exchange error:", await tokenRes.text());
      return errorRedirect("token_exchange_failed");
    }

    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return errorRedirect("no_access_token");
    }

    // 2. Fetch user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "User-Agent": "Aalm-Vastralay-Marketplace",
      },
    });

    if (!userRes.ok) {
      return errorRedirect("userinfo_failed");
    }

    const githubUser = (await userRes.json()) as GitHubUser;
    let email = githubUser.email;

    // 3. If primary email is private on GitHub profile, fetch from /user/emails
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "User-Agent": "Aalm-Vastralay-Marketplace",
        },
      });

      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmail[];
        const primaryVerified = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
        if (primaryVerified) {
          email = primaryVerified.email;
        }
      }
    }

    if (!email) {
      return errorRedirect("no_email_provided");
    }

    email = email.trim().toLowerCase();
    const fullName = githubUser.name || githubUser.login;
    const avatarUrl = githubUser.avatar_url || null;
    const githubId = String(githubUser.id);

    // 4. Find or create user in Neon DB
    let [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: `github_${githubId}`,
          email,
          fullName,
          avatarUrl,
          role: "customer",
          passwordHash: null,
        })
        .returning();
      existingUser = newUser;
    } else if (!existingUser.avatarUrl && avatarUrl) {
      await db.update(users).set({ avatarUrl }).where(eq(users.id, existingUser.id));
      existingUser = { ...existingUser, avatarUrl };
    }

    if (!existingUser.isActive) {
      return errorRedirect("account_suspended");
    }

    // 5. Issue session cookie
    await setSessionCookie(existingUser);

    const finalDestination = storedRedirect.startsWith("/") && !storedRedirect.startsWith("//") ? storedRedirect : "/dashboard";
    const successResponse = NextResponse.redirect(new URL(finalDestination, siteUrl));
    successResponse.cookies.delete("av_oauth_state");
    successResponse.cookies.delete("av_oauth_redirect");
    return successResponse;
  } catch (err) {
    console.error("[GitHub OAuth] Unexpected error:", err);
    return errorRedirect("oauth_internal_error");
  }
}
