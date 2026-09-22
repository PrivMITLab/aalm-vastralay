import { testEncryption } from "./encryption.test";
import { testCommerce } from "./commerce.test";
import { testEthnicFeatures } from "./ethnic-features.test";
import { testAuthSecurity } from "./auth-security.test";

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
  console.log(` 🏆 ALL ${passedCount}/${suites.length} TEST SUITES PASSED IN ${duration}s!`);
  console.log(" Production verification completed successfully. ✅");
  console.log("=======================================================\n");
  process.exit(0);
}

runAllTests();
