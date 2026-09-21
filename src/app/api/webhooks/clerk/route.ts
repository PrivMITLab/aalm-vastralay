import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Clerk → database user sync (user.created / user.updated / user.deleted).
 * Verifies the Svix signature with CLERK_WEBHOOK_SECRET (whsec_…). Public route (see proxy.ts matcher).
 */
function verifySvix(secret: string, id: string, timestamp: string, body: string, signatureHeader: string) {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return signatureHeader.split(" ").some((part) => {
    const [, sig] = part.split(",");
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

type ClerkUser = {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  phone_numbers?: { phone_number: string }[];
};

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const body = await req.text();

  if (secret) {
    const id = req.headers.get("svix-id") ?? "";
    const timestamp = req.headers.get("svix-timestamp") ?? "";
    const signature = req.headers.get("svix-signature") ?? "";
    if (!id || !timestamp || !signature || !verifySvix(secret, id, timestamp, body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET not configured" }, { status: 503 });
  }

  const event = JSON.parse(body) as { type: string; data: ClerkUser };
  const data = event.data;

  if (event.type === "user.deleted") {
    await db.delete(users).where(eq(users.clerkId, data.id));
    return NextResponse.json({ ok: true });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const primary = data.email_addresses?.find((e) => e.id === data.primary_email_address_id) ?? data.email_addresses?.[0];
    if (!primary) return NextResponse.json({ error: "No email" }, { status: 400 });
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    await db
      .insert(users)
      .values({
        clerkId: data.id,
        email: primary.email_address.toLowerCase(),
        fullName,
        phone: data.phone_numbers?.[0]?.phone_number ?? null,
        avatarUrl: data.image_url ?? null,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email: primary.email_address.toLowerCase(), fullName, avatarUrl: data.image_url ?? null, updatedAt: new Date() },
      });
  }

  return NextResponse.json({ ok: true });
}
