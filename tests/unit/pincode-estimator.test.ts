import assert from "node:assert/strict";
import { lookupPincode } from "../../src/lib/pincode";

export async function testPincodeEstimator() {
  console.log("  ▶ Running Indian Pincode & Delivery Serviceability Tests...");

  // 1. Invalid inputs
  assert.equal(lookupPincode(""), null);
  assert.equal(lookupPincode("123"), null);
  assert.equal(lookupPincode("abcdef"), null);

  // 2. Delhi (Prefix 11) - Express hub
  const delhi = lookupPincode("110001", new Date("2026-10-01T10:00:00Z"));
  assert.ok(delhi !== null);
  assert.equal(delhi.state, "Delhi");
  assert.equal(delhi.isCodAvailable, true);
  assert.equal(delhi.isExpressAvailable, true);
  assert.equal(delhi.minDays, 2);

  // 3. Lucknow, Uttar Pradesh (Prefix 22)
  const up = lookupPincode("226001", new Date("2026-10-01T10:00:00Z"));
  assert.ok(up !== null);
  assert.equal(up.state, "Uttar Pradesh");
  assert.ok(up.circle.includes("Lucknow"));
  assert.equal(up.isCodAvailable, true);

  // 4. Patna, Bihar (Prefix 80)
  const bihar = lookupPincode("800001", new Date("2026-10-01T10:00:00Z"));
  assert.ok(bihar !== null);
  assert.equal(bihar.state, "Bihar");
  assert.equal(bihar.isExpressAvailable, true);

  console.log("  ✔ Indian pincode circle resolution & COD eligibility verified!");
}
