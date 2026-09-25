import { encryptData, decryptData, maskPhone, maskEmail } from "../src/lib/encryption";

export async function testEncryption() {
  console.log("  ▶ Running Encryption & PII Security Tests...");

  // 1. AES-256-GCM Roundtrip
  const secretData = "NeonPostgresSecretToken123!";
  const encrypted = encryptData(secretData);

  if (!encrypted || encrypted === secretData) {
    throw new Error("Failed: Encrypted data should not match plaintext!");
  }

  const decrypted = decryptData(encrypted);
  if (decrypted !== secretData) {
    throw new Error(`Failed: Decrypted data '${decrypted}' did not match original '${secretData}'`);
  }

  // 2. Tamper resistance
  const tampered = encrypted.slice(0, -4) + "XXXX";
  const tamperedResult = decryptData(tampered);
  if (tamperedResult !== null) {
    throw new Error("Failed: Tampered ciphertext should return null!");
  }

  // 3. PII Phone Masking (canonical masking.ts: 9876****10 — first 4 + last 2 for 10-digit Indian numbers)
  const maskedPhone = maskPhone("9876543210");
  if (maskedPhone !== "9876****10") {
    throw new Error(`Failed: Phone masking returned unexpected: ${maskedPhone}`);
  }

  // 4. PII Email Masking (canonical masking.ts: c****r@example.com — first + masked + last)
  const maskedEmail = maskEmail("customer@example.com");
  if (maskedEmail !== "c****r@example.com") {
    throw new Error(`Failed: Email masking returned unexpected: ${maskedEmail}`);
  }

  console.log("  ✔ AES-256-GCM authenticated cipher & PII masking passed!");
}
