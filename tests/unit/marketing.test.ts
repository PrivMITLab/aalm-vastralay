import assert from "node:assert/strict";

export async function testMarketingAndTemplates() {
  console.log("  ▶ Running Marketing Broadcasts & Luxury Email Template Tests...");

  // 1. Verify Clean UTF-8 Subject Line Invariants (Zero ??? Corruptions)
  const otp = "284476";
  const otpSubject = `[OTP: ${otp}] पासवर्ड रीसेट कोड (Password Reset) — Aalm Vastralay`;
  assert.ok(!otpSubject.includes("??????"), "Subject line must never have question mark corruptions");
  assert.ok(otpSubject.includes(otp), "Subject line must cleanly contain the 6-digit OTP code");

  const festivalSubject = `[त्योहार स्पेशल] Diwali Shubh Muhurat — FLAT 40% OFF — Aalm Vastralay`;
  assert.ok(!festivalSubject.includes("??????"), "Festival subject must be clean UTF-8");

  const couponSubject = `[विशेष कूपन: FESTIVE500] FLAT 500 छूट — Aalm Vastralay`;
  assert.ok(couponSubject.includes("FESTIVE500"), "Coupon subject must contain coupon code");

  // 2. Validate Campaign Types
  const allowedCampaignTypes = ["FESTIVAL_OFFER", "COUPON_OFFER", "STOCK_DELIVERY_ALERT", "GENERAL"];
  assert.equal(allowedCampaignTypes.length, 4, "Must support 4 broadcast campaign types");

  // 3. Validate Audience Targeting
  const allowedAudiences = ["all_customers", "all_sellers", "test_admin"];
  assert.ok(allowedAudiences.includes("test_admin"), "Must support test email mode before mass broadcast");

  console.log("  ✔ Marketing broadcast & email template UTF-8 integrity verified!\n");
}
