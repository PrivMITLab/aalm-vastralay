import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { persistUpload } from "@/lib/uploads";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

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
  const limit = await rateLimit({ key: `product-upload:${user.id}`, limit: 30, windowSeconds: 600 });
  if (!limit.ok) return NextResponse.json({ error: "Upload limit reached. Please try again shortly." }, { status: 429 });

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  if (!store) return NextResponse.json({ error: "Create a store first" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { data?: string; mime?: string; url?: string } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  let url: string;
  if (body.data && body.mime) {
    try {
      const result = await persistUpload({ bucket: `products/${store.id}`, data: body.data, mime: body.mime });
      url = result.url;
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 400 });
    }
  } else if (body.url && /^https?:\/\//i.test(body.url)) {
    url = body.url.slice(0, 600);
  } else {
    return NextResponse.json({ error: "Provide {data, mime} or {url}" }, { status: 400 });
  }

  await recordAudit({ actorId: user.id, actorEmail: user.email, action: "product.image", target: store.storeName, detail: url.slice(0, 100) });
  return NextResponse.json({ ok: true, url });
}
