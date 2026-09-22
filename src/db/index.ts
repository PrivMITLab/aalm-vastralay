import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// In Node.js (local dev / Vercel), @neondatabase/serverless needs the 'ws' WebSocket
// polyfill. In Cloudflare Workers the native WebSocket is available, so the
// require() will throw and we fall through silently.
try {
  neonConfig.webSocketConstructor = require("ws");
} catch {
  // Cloudflare Workers environment — native WebSocket is available
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

const globalForDb = globalThis as unknown as {
  __aalmVastralayPool?: Pool;
  __aalmVastralayDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export const pool =
  globalForDb.__aalmVastralayPool ??
  new Pool({ connectionString: databaseUrl });

export const db =
  globalForDb.__aalmVastralayDb ??
  drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__aalmVastralayPool = pool;
  globalForDb.__aalmVastralayDb = db;
}

export type DB = typeof db;
