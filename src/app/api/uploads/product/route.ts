import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isAllowedImageUrl, persistUpload } from "@/lib/uploads";
import { recordAudit } from "@/lib/audit";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Seller product image upload.
 * Accepts { data: dataURL, mime } (≤ 5 MB) or { url }. Stores the file under
 * public/uploads/products/<storeId>/ and returns the public URL. When ImageKit
 * keys are configured, the seller ProductForm uploads directly there instead –
 * this endpoint is the zero-config fallback (and used for self-hosted deploys).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return NextResponse.json({ error: "Only sellers can upload product images" }, { status: 401 });
  }
  const limit = await rateLimit({ key: `product-upload:${user.id}`, limit: 30, windowSeconds: 600, failClosed: true });
  if (!limit.ok) return rateLimitResponse(limit, undefined, "Upload limit reached. Please try again shortly.");

  let [store] = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  if (!store) {
    const storeName = user.fullName ? `${user.fullName}'s Collection` : "Artisan Store";
    const slug = `store-${user.id.slice(0, 8)}`;
    const [newStore] = await db
      .insert(stores)
      .values({
        ownerId: user.id,
        storeName,
        slug,
        city: "Kalyanipur",
        state: "Bihar",
        isActive: true,
      })
      .returning();
    store = newStore;
  }

  const body = (await req.json().catch(() => null)) as { data?: string; mime?: string; url?: string } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  let url: string;
  if (body.data && body.mime) {
    try {
      const result = await persistUpload({ bucket: `products/${store.id}`, data: body.data, mime: body.mime });
      url = result.url;
    } catch (err) {
      const reqId = crypto.randomUUID();
      console.error(`[Upload:Product] [${reqId}] Failed:`, err);
      return NextResponse.json({ error: "Upload failed. Please check file format and try again." }, { status: 400, headers: { "X-Request-Id": reqId } });
    }
  } else if (body.url && /^https?:\/\//i.test(body.url)) {
    const candidate = body.url.slice(0, 600);
    if (!isAllowedImageUrl(candidate)) {
      return NextResponse.json({ error: "Image host not allowed. Use ImageKit, wsrv.nl, Backblaze, Google or Cloudinary URLs." }, { status: 400 });
    }
    url = candidate;
  } else {
    return NextResponse.json({ error: "Provide {data, mime} or {url}" }, { status: 400 });
  }

  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "product.image", target: store.storeName, detail: url.slice(0, 100) });
  return NextResponse.json({ ok: true, url });
}
