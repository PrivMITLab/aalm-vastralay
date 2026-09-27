import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * 👑 Aalm Vastralay — Fail-Safe Sign-Out API Route
 * Clears the session cookie directly on the HTTP response headers
 * and redirects to the homepage. Works on both POST and GET.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user) {
      await recordAudit({ actorId: user.id, actorEmail: user.email, action: "auth.sign_out" });
    }
  } catch (err) {
    console.error("[api/auth/sign-out] Non-fatal audit recording error:", err);
  }

  await clearSessionCookie();

  const siteUrl = new URL("/", req.url);
  const response = NextResponse.redirect(siteUrl, { status: 303 });

  // Explicitly write the expired session cookie onto the HTTP response
  response.cookies.set("av_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  });

  return response;
}

export async function GET(req: Request) {
  return POST(req);
}
