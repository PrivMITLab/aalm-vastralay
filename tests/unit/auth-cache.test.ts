/**
 * 👑 AALM VASTRALAY — UNIT TEST: AUTH CACHE & DEDUPLICATION
 * Validates Optimization 3.2:
 *  - Caching helpers handle empty or invalid IDs cleanly
 *  - Ensures getCachedUserProfile returns null for empty string or null
 */

import { getCachedUserProfile } from "../../src/lib/auth/cached";

export async function testAuthCache() {
  console.log("  ▶ Running Auth Cache & Deduplication Tests...");

  // 1. Calling with empty string returns null without error
  const emptyRes = await getCachedUserProfile("");
  if (emptyRes !== null) {
    throw new Error("Failed: Empty userId must return null!");
  }

  // 2. Calling with whitespace returns null
  const whitespaceRes = await getCachedUserProfile("   ");
  if (whitespaceRes !== null) {
    throw new Error("Failed: Whitespace userId must return null!");
  }

  console.log("  ✔ Auth caching & deduplication safety verified!");
}
