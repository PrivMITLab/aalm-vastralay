import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { persistUpload } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Persist a store logo or banner. Only the store owner can upload. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const limit = await rateLimit({ key: `logo:${user.id}`, limit: 8, windowSeconds: 600 });
  if (!limit.ok) return NextResponse.json({ error: "Too many uploads. Please wait." }, { status: 429 });

  const url = new URL(req.url);
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
      return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save photo." }, { status: 400 });
    }
  } else if (body.url && /^https?:\/\//i.test(body.url)) {
    savedUrl = body.url.slice(0, 600);
  } else {
    return NextResponse.json({ error: "Provide {data, mime} or {url}" }, { status: 400 });
  }

  const patch = body.kind === "banner" ? { bannerUrl: savedUrl } : { logoUrl: savedUrl };
  await db.update(stores).set(patch).where(eq(stores.id, store.id));
  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "user.logo", target: store.storeName, detail: body.kind ?? "logo" });
  return NextResponse.json({ ok: true, url: savedUrl });
}
