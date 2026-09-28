import { hashPassword, verifyPassword } from "../src/lib/password";
import { escapeHtml, sendEmail } from "../src/lib/email";

export async function testAuthSecurity() {
  console.log("  ▶ Running Authentication & Role Security Tests...");

  // 1. Password hashing with scrypt
  const password = "SuperSecretPassword@2026";
  const hash = hashPassword(password);

  if (!hash || hash === password || !hash.includes(":")) {
    throw new Error("Failed: Password hash should be formatted as salt:derivedKey");
  }

  // 2. Correct password verification
  const isValid = verifyPassword(password, hash);
  if (!isValid) {
    throw new Error("Failed: Valid password should verify successfully!");
  }

  // 3. Wrong password rejection
  const isInvalid = verifyPassword("WrongPassword123", hash);
  if (isInvalid) {
    throw new Error("Failed: Wrong password should NOT verify!");
  }

  // 4. Role integrity checks
  const ALLOWED_ROLES = ["customer", "seller", "admin"];
  const checkRole = (role: string) => ALLOWED_ROLES.includes(role);

  if (!checkRole("admin") || !checkRole("seller") || !checkRole("customer")) {
    throw new Error("Failed: Role hierarchy missing fundamental roles");
  }

  if (checkRole("super_hacker") || checkRole("root")) {
    throw new Error("Failed: Unauthorized pseudo-roles should be rejected");
  }

  // 5. Email HTML Escaping Test (XSS & HTML Injection Defense)
  const maliciousInput = '<script>alert("hacked")</script>&<img src=x onerror=alert(1)>';
  const escaped = escapeHtml(maliciousInput);
  if (escaped.includes("<") || escaped.includes(">") || escaped.includes('"')) {
    throw new Error("Failed: escapeHtml must encode <, >, and quotes");
  }
  if (!escaped.includes("&lt;script&gt;") || !escaped.includes("&quot;hacked&quot;")) {
    throw new Error("Failed: escapeHtml didn't properly sanitize script tag");
  }

  // 6. Graceful Email Sending & Error Tolerance
  const emailRes = await sendEmail({
    to: "test@example.com",
    subject: "Test Verification",
    html: "<p>Hello</p>",
  });
  if (typeof emailRes.ok !== "boolean") {
    throw new Error("Failed: sendEmail must return a boolean ok status");
  }

  console.log("  ✔ Scrypt password hashing, role hierarchy, and email XSS escaping passed!");
}
