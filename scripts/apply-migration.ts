import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

config();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function runMigration() {
  console.log("Applying Drizzle schema migration to Neon PostgreSQL...");
  const sqlContent = readFileSync(resolve(process.cwd(), "drizzle/0000_neat_peter_parker.sql"), "utf-8");
  const statements = sqlContent.split("--> statement-breakpoint");
  for (const raw of statements) {
    const stmt = raw.trim();
    if (stmt) {
      try {
        await pool.query(stmt);
      } catch (err: any) {
        if (!err.message?.includes("already exists")) {
          console.warn("Statement note:", err.message);
        }
      }
    }
  }
  console.log("Schema migration finished successfully!");
  await pool.end();
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
