import assert from "node:assert/strict";
import { maskPhone, maskEmail } from "@/lib/masking";
import { memoryRateLimit } from "@/lib/rate-limit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function testMaskingAndHardening() {
  console.log("  ▶ Running PII Masking, Rate Limiting & XSS Defense Tests...");

  // 1. Phone Masking Tests
  assert.equal(maskPhone("8434061342"), "8434****42", "10-digit phone should mask middle digits");
  assert.equal(maskPhone("+918434061342"), "8434****42", "Phone with +91 country code should normalize and mask");
  assert.equal(maskPhone("+91 8434-061342"), "8434****42", "Phone with dashes and spaces should sanitize and mask");
  assert.equal(maskPhone("123"), "1***3", "Short phone should mask middle characters");
  assert.equal(maskPhone(null), "N/A", "Null phone should return N/A");

  // 2. Email Masking Tests
  assert.equal(maskEmail("ram@gmail.com"), "r**@gmail.com", "Standard email should mask username");
  assert.equal(maskEmail("ab@domain.com"), "a*@domain.com", "Two-character username should mask second char");
  assert.equal(maskEmail("a@domain.com"), "a***@domain.com", "Single char username should fallback to safe mask");
  assert.equal(maskEmail("invalid-email"), "i************", "Invalid email without domain should mask safely");
  assert.equal(maskEmail(null), "N/A", "Null email should return N/A");

  // 3. Memory Rate Limiter Tests
  const testIp = `test-ip-${Date.now()}`;
  const first = memoryRateLimit(testIp, 3, 10);
  assert.equal(first.ok, true, "First request should be allowed");
  assert.equal(first.remaining, 2, "Remaining requests should be 2");

  const second = memoryRateLimit(testIp, 3, 10);
  assert.equal(second.ok, true, "Second request should be allowed");

  const third = memoryRateLimit(testIp, 3, 10);
  assert.equal(third.ok, true, "Third request should be allowed");

  const fourth = memoryRateLimit(testIp, 3, 10);
  assert.equal(fourth.ok, false, "Fourth request should exceed limit");
  assert.ok(fourth.retryAfterSeconds > 0, "retryAfterSeconds should be positive");

  // 4. HTML Escaping Tests
  const dirty = '<script>alert("xss & \'hack\'")</script>';
  const clean = escapeHtml(dirty);
  assert.equal(
    clean,
    '&lt;script&gt;alert(&quot;xss &amp; &#039;hack&#039;&quot;)&lt;/script&gt;',
    "All dangerous HTML characters must be escaped"
  );

  console.log("  ✔ PII masking, memory rate limiting & XSS escaping verified!\n");
}
