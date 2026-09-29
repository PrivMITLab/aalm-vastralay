/**
 * 👑 AALM VASTRALAY — SUITE 39: OPENPANEL COOKIELESS CLIENT ANALYTICS TRACKER
 * Location: tests/unit/analytics-tracker.test.ts
 *
 * Verifies:
 *  1. PII Sanitization Contract (strips email, phone, password, token).
 *  2. Queue & Batching Mechanics.
 *  3. Fail-Soft Flush when unconfigured.
 */

import assert from "node:assert";
import {
  AnalyticsTracker,
  sanitizeAnalyticsProps,
} from "../../src/lib/analytics";

export async function testAnalyticsTracker() {
  console.log("  ▶ Running OpenPanel Cookieless Analytics Tracker Tests...");

  const tracker = new AnalyticsTracker();
  tracker.clearQueue();

  // 1. PII Sanitization Contract
  const rawProps = {
    productId: "prod_12345",
    category: "Banarasi Sarees",
    price: 4999,
    customerEmail: "priya.sharma@example.com",
    customerPhone: "9876543210",
    userPassword: "SecretPassword123!",
    authToken: "bearer_xyz_987",
  };

  const cleaned = sanitizeAnalyticsProps(rawProps);
  assert.strictEqual(cleaned.productId, "prod_12345");
  assert.strictEqual(cleaned.category, "Banarasi Sarees");
  assert.strictEqual(cleaned.price, 4999);
  assert.strictEqual(cleaned.customerEmail, undefined);
  assert.strictEqual(cleaned.customerPhone, undefined);
  assert.strictEqual(cleaned.userPassword, undefined);
  assert.strictEqual(cleaned.authToken, undefined);

  // 2. Generic PII Pattern Masking
  const genericProps = {
    searchTerm: "user@domain.com",
    userContact: "9123456780",
    validSearch: "Lehenga Choli",
  };
  const cleanedGeneric = sanitizeAnalyticsProps(genericProps);
  assert.strictEqual(cleanedGeneric.searchTerm, undefined);
  assert.strictEqual(cleanedGeneric.userContact, undefined);
  assert.strictEqual(cleanedGeneric.validSearch, "Lehenga Choli");

  // 3. Queue Mechanics
  assert.strictEqual(tracker.getQueueLength(), 0);
  tracker.track("product_view", { productId: "p_101", price: 2500 });
  assert.strictEqual(tracker.getQueueLength(), 1);
  tracker.track("add_to_cart", { productId: "p_101", quantity: 1 });
  assert.strictEqual(tracker.getQueueLength(), 2);

  // 4. Clear Queue
  tracker.clearQueue();
  assert.strictEqual(tracker.getQueueLength(), 0);

  // 5. Fail-soft Flush (unconfigured environment)
  tracker.track("page_view", { path: "/sarees" });
  const flushed = tracker.flush();
  assert.strictEqual(flushed, true);
  assert.strictEqual(tracker.getQueueLength(), 0);

  console.log("  ✔ OpenPanel Cookieless Analytics telemetry queue & PII stripping verified!");
}
