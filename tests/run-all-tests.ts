import { testEncryption } from "./encryption.test";
import { testCommerce } from "./commerce.test";
import { testEthnicFeatures } from "./ethnic-features.test";
import { testAuthSecurity } from "./auth-security.test";
import { testCouponsAndCategories } from "./coupons-categories.test";
import { testSellerPrivacyIsolation } from "./seller-privacy-isolation.test";
import { testAdminCustomization } from "./admin-customization.test";
import { testMediaResolver } from "./media-resolver.test";
import { testDbPooledValidation } from "./unit/db-pooled.test";
import { testMiddlewareSkip } from "./unit/middleware-skip.test";
import { testGuestMode } from "./unit/guest-mode.test";
import { testClerkWebhookSecurity } from "./unit/clerk-webhook.test";
import { testUploadPresign } from "./unit/presign.test";
import { testAuthCache } from "./unit/auth-cache.test";
import { testUpiQrEngine } from "./unit/upi-qr.test";
import { testWhatsAppIntegration } from "./unit/whatsapp-integration.test";
import { testCatalogFilters } from "./unit/catalog-filters.test";
import { testPincodeEstimator } from "./unit/pincode-estimator.test";
import { runUgcReviewTests } from "./unit/ugc-review.test";
import { testPushNotifications } from "./unit/push-notifications.test";
import { testCourierIntegration } from "./unit/courier-integration.test";
import { testBrandAssets } from "./unit/brand-assets.test";
import { testGstInvoice } from "./gst-invoice.test";

async function runAllTests() {
  console.log("\n=======================================================");
  console.log(" 👑 AALM VASTRALAY — AUTOMATED ENTERPRISE TEST SUITE   ");
  console.log("=======================================================\n");

  const startTime = Date.now();
  let passedCount = 0;
  const suites = [
    { name: "Encryption & PII Security", fn: testEncryption },
    { name: "Indian Commerce & Currency", fn: testCommerce },
    { name: "Ethnic Wear & Sizing Logic", fn: testEthnicFeatures },
    { name: "Authentication & Role Security", fn: testAuthSecurity },
    { name: "Coupons & Category Tree Hierarchy", fn: testCouponsAndCategories },
    { name: "Seller Multi-Vendor Privacy & Isolation", fn: testSellerPrivacyIsolation },
    { name: "Admin Zero-Code Customization & Settings", fn: testAdminCustomization },
    { name: "Universal Media Resolver & CDN Engine", fn: testMediaResolver },
    { name: "Neon Pooled Connection Enforcement", fn: testDbPooledValidation },
    { name: "Vercel Middleware Static Skipping & Route Logic", fn: testMiddlewareSkip },
    { name: "Clerk 50K MRU Guest Mode Session Logic", fn: testGuestMode },
    { name: "Clerk Webhook Security & Tamper Resistance", fn: testClerkWebhookSecurity },
    { name: "B2 Presigned Upload & Metadata Security", fn: testUploadPresign },
    { name: "Server Component Request-Scoped Auth Caching", fn: testAuthCache },
    { name: "Dynamic UPI QR & 12-Digit UTR Verification", fn: testUpiQrEngine },
    { name: "1-Click WhatsApp Order Confirm & Live Tracking", fn: testWhatsAppIntegration },
    { name: "Catalog Visual Filters (Occasion, Color, Fabric)", fn: testCatalogFilters },
    { name: "Indian Pincode Circle Resolution & COD Serviceability", fn: testPincodeEstimator },
    { name: "Customer UGC Review Photos & Image Sanitization", fn: runUgcReviewTests },
    { name: "Service Worker Push Notifications & Order Dispatch", fn: testPushNotifications },
    { name: "Shiprocket & Delhivery Direct Courier & AWB Generation", fn: testCourierIntegration },
    { name: "Brand Identity, 20 Logos & 53-Icon Matrix Integrity", fn: testBrandAssets },
    { name: "Statutory GST Tax Invoice & Lifecycle Engine", fn: testGstInvoice },
  ];

  for (const suite of suites) {
    try {
      await suite.fn();
      passedCount++;
    } catch (err) {
      console.error(`\n❌ Test Suite '${suite.name}' FAILED:`, err);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n=======================================================");
  console.log(` 🏆 ALL ${passedCount}/${suites.length} ENTERPRISE TEST SUITES PASSED IN ${duration}s!`);
  console.log(" Strict zero-defect verification completed successfully. ✅");
  console.log("=======================================================\n");
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
