import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { persistUpload, isAllowedImageUrl } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Persist a store logo or banner. Only the store owner can upload. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return NextResponse.json({ success: false, error: "Unauthorized: Seller or Admin access required." }, { status: 401 });
  }
  const limit = await rateLimit({ key: `logo:${user.id}`, limit: 8, windowSeconds: 600, failClosed: true });
  if (!limit.ok) return rateLimitResponse(limit, undefined, "Too many uploads. Please wait.");

  const body = (await req.json().catch(() => null)) as { data?: string; mime?: string; url?: string; kind?: "logo" | "banner" } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  if (!store) return NextResponse.json({ error: "Create a store first" }, { status: 400 });

  let savedUrl: string;
  if (body.data && body.mime) {
    try {
      const result = await persistUpload({ bucket: `stores/${store.id}`, data: body.data, mime: body.mime });
      savedUrl = result.url;
    } catch (err) {
      const reqId = crypto.randomUUID();
      console.error(`[Upload:Logo] [${reqId}] Error:`, err);
      return NextResponse.json({ error: "Could not save photo. Please try again." }, { status: 400, headers: { "X-Request-Id": reqId } });
    }
  } else if (body.url && /^https?:\/\//i.test(body.url)) {
    const candidate = body.url.slice(0, 600);
    if (!isAllowedImageUrl(candidate)) {
      return NextResponse.json({ error: "Image host not allowed" }, { status: 400 });
    }
    savedUrl = candidate;
  } else {
    return NextResponse.json({ error: "Provide {data, mime} or {url}" }, { status: 400 });
  }

  const patch = body.kind === "banner" ? { bannerUrl: savedUrl } : { logoUrl: savedUrl };
  await db.update(stores).set(patch).where(eq(stores.id, store.id));
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "user.logo", target: store.storeName, detail: body.kind ?? "logo" });
  return NextResponse.json({ ok: true, url: savedUrl });
}
