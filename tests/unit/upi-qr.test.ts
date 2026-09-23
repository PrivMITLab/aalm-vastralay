/**
 * 👑 AALM VASTRALAY — UNIT TEST: DYNAMIC UPI QR & UTR ENGINE
 * Validates Option A:
 *  - NPCI UPI URL construction (upi://pay?...)
 *  - 12-digit Indian banking UTR validation
 *  - 5-minute countdown timer formatting
 */

import {
  generateUpiUrl,
  validateUtrNumber,
  formatCountdownTimer,
  generateUpiQrImageUrl,
} from "../../src/lib/upi";

export async function testUpiQrEngine() {
  console.log("  ▶ Running Dynamic UPI QR & UTR Engine Tests...");

  // 1. UPI URL Generation
  const upiUrl = generateUpiUrl({
    vpa: "8434061342@upi",
    payeeName: "Aalm Vastralay",
    amount: 1499,
    orderNumber: "AV-2026-1082",
    note: "Order AV-2026-1082",
  });

  if (!upiUrl.startsWith("upi://pay?")) {
    throw new Error(`Failed: UPI URL must start with upi://pay? Got: ${upiUrl}`);
  }
  if (!upiUrl.includes("pa=8434061342%40upi") && !upiUrl.includes("pa=8434061342@upi")) {
    throw new Error(`Failed: VPA missing or not encoded properly in UPI URL: ${upiUrl}`);
  }
  if (!upiUrl.includes("am=1499.00")) {
    throw new Error(`Failed: Amount must be formatted to 2 decimals in UPI URL: ${upiUrl}`);
  }
  if (!upiUrl.includes("tr=AV-2026-1082")) {
    throw new Error(`Failed: Order reference missing in UPI URL: ${upiUrl}`);
  }

  // 2. QR Code Image URL
  const qrUrl = generateUpiQrImageUrl(upiUrl, 260);
  if (!qrUrl.includes("api.qrserver.com") || !qrUrl.includes("260x260")) {
    throw new Error(`Failed: QR image URL malformed: ${qrUrl}`);
  }

  // 3. 12-Digit Indian Banking UTR Validation
  const validUtr = validateUtrNumber("423456789012");
  if (!validUtr.isValid) {
    throw new Error("Failed: 12-digit numeric UTR should be valid!");
  }

  const shortUtr = validateUtrNumber("12345");
  if (shortUtr.isValid) {
    throw new Error("Failed: Short UTR (<12 digits) must be rejected!");
  }

  const alphaUtr = validateUtrNumber("42345678ABCD");
  if (alphaUtr.isValid) {
    throw new Error("Failed: Alphanumeric UTR with letters must be rejected!");
  }

  const emptyUtr = validateUtrNumber("");
  if (emptyUtr.isValid) {
    throw new Error("Failed: Empty UTR must be rejected!");
  }

  // 4. Timer Formatter
  if (formatCountdownTimer(300) !== "05:00") {
    throw new Error(`Failed: 300 seconds must format to 05:00! Got: ${formatCountdownTimer(300)}`);
  }
  if (formatCountdownTimer(65) !== "01:05") {
    throw new Error(`Failed: 65 seconds must format to 01:05! Got: ${formatCountdownTimer(65)}`);
  }
  if (formatCountdownTimer(0) !== "00:00") {
    throw new Error(`Failed: 0 seconds must format to 00:00! Got: ${formatCountdownTimer(0)}`);
  }

  console.log("  ✔ Dynamic UPI QR generation, UTR validation & timer formatting verified!");
}
