import { NextResponse, type NextRequest } from "next/server";
import { requestMeta } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Newsletter opt-in – rate limited and validated; emails a welcome coupon via quiet-mail. */
export async function POST(req: NextRequest) {
  const meta = await requestMeta();
  const limit = await rateLimit({ key: `newsletter:${meta.ip}`, limit: 5, windowSeconds: 600 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  await sendEmail({
    to: email,
    subject: "Welcome to Aalm Vastralay – here's 10% off",
    html: `<div style="font-family:Georgia,serif"><h2 style="color:#7a1f2b">Welcome to Aalm Vastralay</h2>
      <p>Use coupon <strong>WELCOME10</strong> for 10% off your first wedding-wear order (max ₹500 off).</p>
      <p>Cash on Delivery and 7-day easy returns included.</p></div>`,
  });

  return NextResponse.json({ ok: true });
}
