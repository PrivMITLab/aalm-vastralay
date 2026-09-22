import { config } from "dotenv";
config();
import { initCleanBaseData, wipeDemoData } from "./init";

/**
 * Clean Production Seeder.
 * Runs clean base initialization (categories, settings, super-admin).
 * Zero fake products, zero fake reviews, zero fake users.
 */
export async function seed() {
  console.log("[db:seed] Initializing clean base data...");
  const res = await initCleanBaseData();
  console.log("[db:seed] Completed successfully:", res);
}

export async function resetAndSeed() {
  console.log("[db:seed] Wiping old demo data...");
  await wipeDemoData();
  await seed();
}

async function main() {
  const isReset = process.argv.includes("--reset");
  if (isReset) {
    await resetAndSeed();
  } else {
    await seed();
  }
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[db:seed] Error:", err);
    process.exit(1);
  });
}
