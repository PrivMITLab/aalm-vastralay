import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requestMeta } from "@/lib/request";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { verifyPayloadAndConsume } from "@/lib/pow-store";
import { getSetting } from "@/lib/settings";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(200),
  hp: z.string().optional(),
  website: z.string().optional(),
  botPayload: z.string().optional(),
});

/** Newsletter opt-in – rate limited 5/10min, zod-validated with honeypot trap. */
export async function POST(req: NextRequest) {
  const meta = await requestMeta();
  const limit = await rateLimit({ key: `newsletter:${meta.ip}`, limit: 5, windowSeconds: 600 });
  if (!limit.ok) {
    return rateLimitResponse(limit, undefined, "Too many requests. Please try again later.");
  }

  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const parsed = newsletterSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const { email, hp, website, botPayload } = parsed.data;

    // Honeypot check: Bots filling hidden fields are silently accepted without sending email
    if (hp || website) {
      return NextResponse.json({ ok: true, success: true });
    }

    // Single-use proof-of-work (lenient: outages log and pass to avoid losing genuine subscribers).
    if ((await getSetting("security.botProtection", "pow")) === "pow") {
      const verdict = await verifyPayloadAndConsume(botPayload ?? "", {
        action: "newsletter",
        ip: meta.ip,
        strict: false,
      });
      if (!verdict.ok) {
        return NextResponse.json({ success: false, error: verdict.error ?? "Security check failed" }, { status: 400 });
      }
    }

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Welcome to Aalm Vastralay – here's 10% off",
      html: `<div style="font-family:Georgia,serif"><h2 style="color:#7a1f2b">Welcome to Aalm Vastralay</h2>
        <p>Use coupon <strong>WELCOME10</strong> for 10% off your first wedding-wear order (max ₹500 off).</p>
        <p>Cash on Delivery and 7-day easy returns included.</p></div>`,
    });

    return NextResponse.json({ ok: true, success: true });
  } catch (err) {
    console.error("[Newsletter] Subscription error:", err);
    return NextResponse.json({ success: false, error: "Could not process newsletter signup" }, { status: 500 });
  }
}
