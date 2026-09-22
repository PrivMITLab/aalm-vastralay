import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Enterprise-grade AES-256-GCM Authenticated Encryption for Database Credentials & PII.
 * 
 * Uses AUTH_SECRET (or ENCRYPTION_SECRET) to derive a 256-bit encryption key.
 * Format: `iv:ciphertext:authTag` (base64url encoded).
 */

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.AUTH_SECRET || "aalm-vastralay-dev-secret-change-me";
  // Derive a fixed 32-byte (256-bit) key using SHA-256
  return createHash("sha256").update(`encryption-salt:${secret}`).digest();
}

/** Encrypts sensitive string data with AES-256-GCM */
export function encryptData(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = randomBytes(12); // GCM standard 96-bit IV
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64url");
  encrypted += cipher.final("base64url");
  const authTag = cipher.getAuthTag().toString("base64url");

  return `${iv.toString("base64url")}:${encrypted}:${authTag}`;
}

/** Decrypts AES-256-GCM encrypted data. Returns original string or null on tampering. */
export function decryptData(cipherPackage: string): string | null {
  if (!cipherPackage) return null;
  const parts = cipherPackage.split(":");
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy plaintext), return as-is
    return cipherPackage;
  }

  try {
    const [ivB64, encryptedB64, authTagB64] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivB64, "base64url");
    const authTag = Buffer.from(authTagB64, "base64url");

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedB64, "base64url", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // Return null if signature invalid or corrupted
    return null;
  }
}

/** PII Masking: Masks phone number e.g. 9876543210 -> ******3210 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const clean = phone.trim();
  if (clean.length < 4) return "****";
  return clean.slice(0, -4).replace(/./g, "*") + clean.slice(-4);
}

/** PII Masking: Masks email e.g. user@example.com -> u***@example.com */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "****";
  const maskedLocal = local.length > 2 ? local[0] + "***" + local.slice(-1) : local[0] + "***";
  return `${maskedLocal}@${domain}`;
}
