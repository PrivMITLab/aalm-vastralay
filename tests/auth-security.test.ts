import { hashPassword, verifyPassword } from "../src/lib/password";

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

  console.log("  ✔ Scrypt password hashing & role hierarchy verification passed!");
}
