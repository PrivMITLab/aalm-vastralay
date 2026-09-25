import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Clerk → database user sync (user.created / user.updated / user.deleted).
 * Verifies the Svix signature with CLERK_WEBHOOK_SECRET (whsec_…). Public route.
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

const clerkEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({ id: z.string(), email_address: z.string() })).optional(),
    primary_email_address_id: z.string().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    phone_numbers: z.array(z.object({ phone_number: z.string() })).optional(),
  }),
});

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const body = await req.text();

  if (secret) {
    const id = req.headers.get("svix-id") ?? "";
    const timestamp = req.headers.get("svix-timestamp") ?? "";
    const signature = req.headers.get("svix-signature") ?? "";

    // Verify timestamp freshness (within 5 minutes = 300,000 ms)
    const tsSec = Number(timestamp);
    if (isNaN(tsSec) || Math.abs(Date.now() - tsSec * 1000) > 300_000) {
      return NextResponse.json({ success: false, error: "Webhook timestamp expired" }, { status: 401 });
    }

    if (!id || !timestamp || !signature || !verifySvix(secret, id, timestamp, body, signature)) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: "Webhook service unavailable" }, { status: 503 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(body);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const parseResult = clerkEventSchema.safeParse(parsedJson);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, error: "Invalid webhook payload structure" }, { status: 400 });
  }

  const event = parseResult.data;
  const data = event.data;

  // Zero-loss migration: Soft-delete only (never destroy user row)
  if (event.type === "user.deleted") {
    await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.clerkId, data.id));
    return NextResponse.json({ ok: true });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const primary = data.email_addresses?.find((e) => e.id === data.primary_email_address_id) ?? data.email_addresses?.[0];
    if (!primary) return NextResponse.json({ success: false, error: "No email provided" }, { status: 400 });
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    await db
      .insert(users)
      .values({
        clerkId: data.id,
        email: primary.email_address.toLowerCase(),
        fullName,
        phone: data.phone_numbers?.[0]?.phone_number ?? null,
        avatarUrl: data.image_url ?? null,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email: primary.email_address.toLowerCase(), fullName, avatarUrl: data.image_url ?? null, isActive: true, updatedAt: new Date() },
      });
  }

  return NextResponse.json({ ok: true });
}
