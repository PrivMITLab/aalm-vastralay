/**
 * 👑 AALM VASTRALAY — UNIT TEST: GUEST MODE IDENTIFIER
 * Validates Optimization 3.1:
 *  - Guest ID generation conforms to prefix standard (guest_...)
 *  - IDs are unique and entropy-safe
 */

import { generateGuestId } from "../../src/hooks/useGuestOrAuth";

export async function testGuestMode() {
  console.log("  ▶ Running Guest Mode & Anonymous Session Tests...");

  const id1 = generateGuestId();
  const id2 = generateGuestId();

  if (!id1.startsWith("guest_") || !id2.startsWith("guest_")) {
    throw new Error("Failed: Generated guest ID must start with 'guest_' prefix!");
  }

  if (id1 === id2) {
    throw new Error("Failed: Successive guest IDs must be strictly unique!");
  }

  if (id1.length < 15) {
    throw new Error("Failed: Guest ID lacks sufficient entropy!");
  }

  console.log("  ✔ Guest mode identifier generation verified!");
}
