import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { Pool, neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// In Node.js (local dev / Vercel), @neondatabase/serverless needs the 'ws' WebSocket
// polyfill. In Cloudflare Workers the native WebSocket is available, so the
// require() will throw and we fall through silently.
try {
  neonConfig.webSocketConstructor = require("ws");
} catch {
  // Cloudflare Workers environment — native WebSocket is available
}

/**
 * Validates whether a database connection string points to Neon's pooled endpoint (-pooler).
 * Direct connections exhaust serverless connection pools rapidly, whereas pooled connections
 * multiplex through PgBouncer handling 10,000+ simultaneous connections.
 */
export function validateDatabaseUrl(
  url: string | undefined,
  nodeEnv: string = process.env.NODE_ENV || "development"
): {
  isValid: boolean;
  isPooled: boolean;
  warning?: string;
  error?: string;
} {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      isPooled: false,
      error: "DATABASE_URL is missing or empty.",
    };
  }

  const isLocalhost = url.includes("localhost") || url.includes("127.0.0.1");
  if (isLocalhost) {
    return { isValid: true, isPooled: true };
  }

  const isNeon = url.includes("neon.tech");
  const isPooled = url.includes("-pooler");

  if (isNeon && !isPooled) {
    const warning =
      "WARNING: Using direct connection. Switch to pooled endpoint for serverless (e.g., ep-xxx-pooler.region.aws.neon.tech).";
    if (nodeEnv === "production" && process.env.ALLOW_DIRECT_DB !== "true") {
      return {
        isValid: false,
        isPooled: false,
        error: `Production requires a pooled connection string (-pooler). ${warning}`,
      };
    }
    return { isValid: true, isPooled: false, warning };
  }

  return { isValid: true, isPooled: true };
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

// Enforce and log validation on startup
const urlCheck = validateDatabaseUrl(databaseUrl);
if (urlCheck.warning) {
  console.warn(`[Neon DB] ${urlCheck.warning}`);
}
if (!urlCheck.isValid && urlCheck.error) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DIRECT_DB !== "true") {
    throw new Error(`[Neon DB CRITICAL] ${urlCheck.error}`);
  } else {
    console.warn(`[Neon DB] ${urlCheck.error}`);
  }
}

const globalForDb = globalThis as unknown as {
  __aalmVastralayPool?: Pool;
  __aalmVastralayDb?: ReturnType<typeof drizzle<typeof schema>>;
  __aalmVastralayHttpDb?: ReturnType<typeof drizzleHttp<typeof schema>>;
};

export const pool =
  globalForDb.__aalmVastralayPool ??
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000, // 10s connection timeout prevents hanging serverless instances
    idleTimeoutMillis: 30000,       // Closes idle connections quickly so Neon can suspend
    max: 10,                        // Prevent serverless connection explosion
  });

export const db =
  globalForDb.__aalmVastralayDb ??
  drizzle(pool, { schema });

/**
 * Returns an Edge-compatible HTTP Drizzle client using @neondatabase/serverless neon()
 * Ideal for Edge runtime routes with zero connection pool overhead.
 */
export function getHttpDb(customUrl?: string) {
  const targetUrl = customUrl || databaseUrl;
  const sqlClient = neon(targetUrl);
  return drizzleHttp(sqlClient, { schema });
}

export const httpDb =
  globalForDb.__aalmVastralayHttpDb ??
  getHttpDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__aalmVastralayPool = pool;
  globalForDb.__aalmVastralayDb = db;
  globalForDb.__aalmVastralayHttpDb = httpDb;
}

export type DB = typeof db;
export type HttpDB = typeof httpDb;

