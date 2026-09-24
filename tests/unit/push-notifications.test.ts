/**
 * 👑 AALM VASTRALAY — PUSH NOTIFICATIONS & SERVICE WORKER TEST SUITE
 * Validates dispatch payload formatting, deep linking, and push subscription validation.
 */

import {
  buildDispatchNotificationPayload,
  isValidPushSubscription,
  type OrderDispatchNotificationInput,
} from "../../src/lib/push";

export function testPushNotifications() {
  console.log("  ▶ Running Push Notification Payload & Subscription Tests...");

  // 1. Valid dispatch payload structure
  const input: OrderDispatchNotificationInput = {
    orderId: "e7c5b6b1-4f13-4c91-b3b4-5c91b3b45c91",
    orderNumber: "AV-1082",
    courier: "Delhivery Express",
    trackingNumber: "DELHIVERY987654321",
    productName: "Royal Velvet Lehenga",
  };

  const payload = buildDispatchNotificationPayload(input);
  if (!payload.title.includes("Dispatched")) {
    throw new Error("Payload title missing dispatch indicator");
  }
  if (!payload.body.includes("AV-1082") || !payload.body.includes("Delhivery Express")) {
    throw new Error("Payload body missing order number or courier name");
  }
  if (payload.url !== `/orders/${input.orderId}`) {
    throw new Error("Payload url does not deep-link to order page");
  }
  if (payload.tag !== `order-dispatch-${input.orderId}`) {
    throw new Error("Payload tag mismatch");
  }

  // 2. Validate push subscription checks
  const validSub = {
    endpoint: "https://fcm.googleapis.com/fcm/send/sample-token",
    keys: {
      p256dh: "BMc_sample_key_1234567890",
      auth: "sample_auth_token_xyz",
    },
  };
  if (!isValidPushSubscription(validSub)) {
    throw new Error("Valid push subscription failed validation check");
  }

  // 3. Reject non-https endpoint
  const insecureSub = {
    endpoint: "http://insecure.com/send",
    keys: {
      p256dh: "key",
      auth: "auth",
    },
  };
  if (isValidPushSubscription(insecureSub)) {
    throw new Error("Insecure HTTP endpoint was improperly allowed");
  }

  // 4. Reject missing keys
  const incompleteSub = {
    endpoint: "https://fcm.googleapis.com/fcm/send/token",
    keys: {
      p256dh: "",
      auth: "",
    },
  };
  if (isValidPushSubscription(incompleteSub)) {
    throw new Error("Incomplete push subscription was improperly allowed");
  }

  console.log("  ✔ Push dispatch notification payload & subscription validation passed!");
}
