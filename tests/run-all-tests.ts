import { testEncryption } from "./encryption.test";
import { testCommerce } from "./commerce.test";
import { testEthnicFeatures } from "./ethnic-features.test";
import { testAuthSecurity } from "./auth-security.test";
import { testCouponsAndCategories } from "./coupons-categories.test";
import { testSellerPrivacyIsolation } from "./seller-privacy-isolation.test";
import { testAdminCustomization } from "./admin-customization.test";

async function runAllTests() {
  console.log("\n=======================================================");
  console.log(" 👑 AALM VASTRALAY — AUTOMATED ENTERPRISE TEST SUITE   ");
  console.log("=======================================================\n");

  const startTime = Date.now();
  let passedCount = 0;
  const suites = [
    { name: "Encryption & PII Security", fn: testEncryption },
    { name: "Indian Commerce & Currency", fn: testCommerce },
    { name: "Ethnic Wear & Pincode Logic", fn: testEthnicFeatures },
    { name: "Authentication & Role Security", fn: testAuthSecurity },
    { name: "Coupons & Category Tree Hierarchy", fn: testCouponsAndCategories },
    { name: "Seller Multi-Vendor Privacy & Isolation", fn: testSellerPrivacyIsolation },
    { name: "Admin Zero-Code Customization & Settings", fn: testAdminCustomization },
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

runAllTests();
