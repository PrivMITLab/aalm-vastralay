import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// In Node.js (local dev), @neondatabase/serverless needs the 'ws' WebSocket
// polyfill.  In Cloudflare Workers the native WebSocket is available, so the
// require() will throw and we fall through silently.
try {
  neonConfig.webSocketConstructor = require("ws");
} catch {
  // Cloudflare Workers environment — native WebSocket is available
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/aalm_vastralay";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
export type DB = typeof db;
