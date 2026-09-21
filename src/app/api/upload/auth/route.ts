import { createHmac, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * ImageKit client-side upload authentication.
 * Returns { token, expire, signature } – signature = HMAC-SHA1(token + expire, IMAGEKIT_PRIVATE_KEY).
 * Only sellers/admins may upload.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "ImageKit is not configured (IMAGEKIT_PRIVATE_KEY missing)" }, { status: 503 });
  }
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 10;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return NextResponse.json({ token, expire, signature });
}
