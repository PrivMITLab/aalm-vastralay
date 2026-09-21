import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSetting, getSettingBool } from "@/lib/settings";
import { persistUpload } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { requestMeta } from "@/lib/request";

export const dynamic = "force-dynamic";

/** Persist a profile avatar to local disk and update the user's avatarUrl. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const meta = await requestMeta();
  const limit = await rateLimit({ key: `avatar:${user.id}`, limit: 5, windowSeconds: 600 });
  if (!limit.ok) return NextResponse.json({ error: "Too many uploads. Please wait." }, { status: 429 });

  let body: { data?: string; mime?: string; url?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let url: string | null = null;
  if (body.data && body.mime) {
    try {
      const result = await persistUpload({ bucket: `avatars/${user.id}`, data: body.data, mime: body.mime });
      url = result.url;
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save photo." }, { status: 400 });
    }
  } else if (body.url && /^https?:\/\//i.test(body.url)) {
    // Allow an external URL – used by sellers linking their existing CDN-hosted logo.
    url = body.url.slice(0, 600);
  } else {
    return NextResponse.json({ error: "Provide either {data, mime} (≤5 MB image) or {url}" }, { status: 400 });
  }

  await db.update(users).set({ avatarUrl: url, updatedAt: new Date() }).where(eq(users.id, user.id));
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "user.avatar", detail: url.length > 80 ? url.slice(0, 80) + "…" : url });
  return NextResponse.json({ ok: true, url });
}
