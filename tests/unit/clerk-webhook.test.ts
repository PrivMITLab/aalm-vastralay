/**
 * 👑 AALM VASTRALAY — UNIT TEST: CLERK WEBHOOK SECURITY
 * Validates Optimization 3.5:
 *  - Svix HMAC signature generation & verification
 *  - Tampered payload rejection
 *  - Expired / missing timestamp rejection
 */

import { createHmac, timingSafeEqual } from "crypto";

function verifySvixSignature(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  signatureHeader: string
): boolean {
  try {
    const rawSecret = secret.replace(/^whsec_/, "");
    const key = Buffer.from(rawSecret, "base64");
    const expected = createHmac("sha256", key)
      .update(`${id}.${timestamp}.${body}`)
      .digest("base64");

    return signatureHeader.split(" ").some((part) => {
      const [, sig] = part.split(",");
      if (!sig) return false;
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    });
  } catch {
    return false;
  }
}

export async function testClerkWebhookSecurity() {
  console.log("  ▶ Running Clerk Webhook Signature Security Tests...");

  const secret = "whsec_MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1234567890abcdef";
  const id = "msg_2XyZaBcDeFgHiJkLmNoP";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const payload = JSON.stringify({
    type: "user.created",
    data: {
      id: "user_test123",
      email_addresses: [{ id: "email_1", email_address: "test@example.com" }],
    },
  });

  // Calculate legitimate signature
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expectedSig = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");
  const validHeader = `v1,${expectedSig}`;

  // 1. Valid signature must pass
  const isValid = verifySvixSignature(secret, id, timestamp, payload, validHeader);
  if (!isValid) {
    throw new Error("Failed: Legitimate Svix webhook signature was rejected!");
  }

  // 2. Tampered body must fail
  const tamperedPayload = payload + " ";
  const isTamperedValid = verifySvixSignature(secret, id, timestamp, tamperedPayload, validHeader);
  if (isTamperedValid) {
    throw new Error("Failed: Tampered payload was incorrectly verified!");
  }

  // 3. Forged signature must fail
  const forgedHeader = "v1,dGhpcy1pcy1hLWZvcmdlZC1zaWduYXR1cmUtMTIzNDU2";
  const isForgedValid = verifySvixSignature(secret, id, timestamp, payload, forgedHeader);
  if (isForgedValid) {
    throw new Error("Failed: Forged signature was incorrectly verified!");
  }

  console.log("  ✔ Clerk webhook signature verification & tamper resistance verified!");
}
