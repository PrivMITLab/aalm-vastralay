/**
 * 👑 AALM VASTRALAY — NODE.JS RUNTIME CONNECTION POOL
 * Configures connection pooling for Vercel Serverless Functions and Node.js runtime.
 * Automatically limits max connections and sets idle timeouts to prevent exhausting Neon's free tier cap.
 */

import { Pool } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

const globalForPool = globalThis as unknown as {
  __aalmServerlessPool?: Pool;
};

export const serverlessPool =
  globalForPool.__aalmServerlessPool ??
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000, // 10s connection timeout
    idleTimeoutMillis: 30000,       // 30s idle timeout
    max: 10,                        // Max 10 connections
  });

// Attach pool to Vercel Functions lifecycle if available
try {
  const vercelFunctions = require("@vercel/functions");
  if (typeof vercelFunctions?.attachDatabasePool === "function") {
    vercelFunctions.attachDatabasePool(serverlessPool);
  }
} catch {
  // @vercel/functions is optional or running outside Vercel
}

if (process.env.NODE_ENV !== "production") {
  globalForPool.__aalmServerlessPool = serverlessPool;
}

export default serverlessPool;
