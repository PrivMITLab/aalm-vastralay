import { config } from "dotenv";
config();
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as NodePgPool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

const isNeon = databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require");

const globalForDb = globalThis as typeof globalThis & {
  __aalmVastralayPool?: NeonPool | NodePgPool;
  __aalmVastralayDb?: any;
};

export const pool =
  globalForDb.__aalmVastralayPool ??
  (isNeon
    ? new NeonPool({ connectionString: databaseUrl })
    : new NodePgPool({
        connectionString: databaseUrl,
        max: 10,
      }));

export const db = (
  globalForDb.__aalmVastralayDb ??
  (isNeon
    ? drizzleNeon(pool as NeonPool, { schema })
    : drizzlePg(pool as NodePgPool, { schema }))
) as ReturnType<typeof drizzlePg<typeof schema>>;

if (process.env.NODE_ENV !== "production") {
  globalForDb.__aalmVastralayPool = pool;
  globalForDb.__aalmVastralayDb = db;
}

export type DB = typeof db;

