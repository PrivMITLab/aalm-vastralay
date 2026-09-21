import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database client.
 *
 * Works with any PostgreSQL – local Postgres in development, Neon in production.
 * Neon's pooled connection string (…-pooler.ap-south-1.aws.neon.tech) works as-is with `pg`.
 * Set DATABASE_URL in .env / .env.local.
 */
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

const globalForDb = globalThis as typeof globalThis & {
  __aalmVastralayPool?: Pool;
};

export const pool =
  globalForDb.__aalmVastralayPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
    ssl: databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__aalmVastralayPool = pool;
}

export const db = drizzle(pool, { schema });
export type DB = typeof db;
