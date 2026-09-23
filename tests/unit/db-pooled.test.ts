/**
 * 👑 AALM VASTRALAY — UNIT TEST: NEON POOLED CONNECTION VALIDATION
 * Validates Optimization 1.1:
 *  - Pooled connection strings (-pooler) pass validation.
 *  - Direct endpoints without -pooler emit warning in development.
 *  - Direct endpoints fail with error in production.
 *  - Localhost bypasses the check cleanly.
 */

import { validateDatabaseUrl } from "../../src/db/index";

export async function testDbPooledValidation() {
  console.log("  ▶ Running Neon Pooled Connection Validation Tests...");

  // 1. Missing or empty string
  const emptyRes = validateDatabaseUrl("");
  if (emptyRes.isValid) {
    throw new Error("Failed: Empty DATABASE_URL should be invalid!");
  }

  // 2. Localhost connection
  const localRes = validateDatabaseUrl("postgresql://postgres:postgres@127.0.0.1:5432/test");
  if (!localRes.isValid || !localRes.isPooled) {
    throw new Error("Failed: Localhost URL must be valid and accepted!");
  }

  // 3. Proper Neon pooled URL
  const pooledUrl = "postgresql://user:pass@ep-cool-butterfly-123456-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require";
  const pooledRes = validateDatabaseUrl(pooledUrl);
  if (!pooledRes.isValid || !pooledRes.isPooled) {
    throw new Error("Failed: Neon URL with -pooler must pass validation as pooled!");
  }

  // 4. Neon direct URL in development mode
  const directUrl = "postgresql://user:pass@ep-cool-butterfly-123456.ap-south-1.aws.neon.tech/neondb?sslmode=require";
  const devDirectRes = validateDatabaseUrl(directUrl, "development");
  if (!devDirectRes.isValid || devDirectRes.isPooled || !devDirectRes.warning) {
    throw new Error("Failed: Direct URL in development must be flagged as non-pooled with a warning!");
  }

  // 5. Neon direct URL in production mode
  const prodDirectRes = validateDatabaseUrl(directUrl, "production");
  if (prodDirectRes.isValid || !prodDirectRes.error) {
    throw new Error("Failed: Direct URL in production must hard-fail validation!");
  }

  console.log("  ✔ Neon pooled connection validation passed!");
}
