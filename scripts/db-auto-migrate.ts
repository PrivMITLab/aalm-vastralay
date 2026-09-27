/**
 * 👑 AALM VASTRALAY — ZERO-LOSS AUTO-MIGRATE RUNNER
 *
 * Runs non-destructive auto-migrations:
 * - Checks and creates missing tables (`CREATE TABLE IF NOT EXISTS`)
 * - Adds missing columns (`ADD COLUMN IF NOT EXISTS ... DEFAULT ...`)
 * - Ensures all performance indexes exist (`CREATE INDEX IF NOT EXISTS`)
 * - Seeds foundational categories, super-admin, and settings if missing
 *
 * Guaranteed: ZERO DATA LOSS. Never drops any table or column.
 */

import { config } from "dotenv";
config();

import { initCleanBaseData } from "../src/db/init";

async function main() {
  console.log("=================================================");
  console.log("👑 AALM VASTRALAY — ZERO-LOSS AUTO-MIGRATION ENGINE");
  console.log("=================================================");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("Please configure DATABASE_URL in your .env or .env.local file.");
    process.exit(1);
  }

  const startTime = Date.now();
  console.log("⏳ Initializing database connection and inspecting schema...");

  try {
    const res = await initCleanBaseData();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ AUTO-MIGRATION COMPLETED SUCCESSFULLY in ${duration}s!`);
    console.log(`   - Status: ${res.status}`);
    console.log(`   - Settings Configured: ${res.settingsCount}`);
    console.log(`   - Product Categories Active: ${res.categoriesCount}`);
    console.log(`   - Super Admin Active: ${res.totalAdmins > 0 ? "Yes" : "Created"}`);
    console.log(`   - Message: ${res.message}\n`);
    console.log("Your database is 100% synchronized and ready for production! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ AUTO-MIGRATION FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main();
