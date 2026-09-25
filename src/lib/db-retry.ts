/**
 * 👑 AALM VASTRALAY — DATABASE RETRY & RESILIENCE HELPER
 *
 * Neon serverless Postgres operates over HTTP/WebSocket pools where cold starts
 * or transient connection blips can cause single-request "fetch failed" or timeout errors.
 *
 * withDbRetry wraps database reads and single-row updates with ONE automatic retry
 * after a 500ms backoff. Max 2 attempts total.
 */

const TRANSIENT_PATTERNS = [
  "fetch failed",
  "econnreset",
  "etimedout",
  "connection terminated",
  "connection refused",
  "query timeout",
  "neon",
  "timeout",
  "socket closed",
];

function isTransientDbError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return TRANSIENT_PATTERNS.some((pattern) => msg.includes(pattern));
}

export async function withDbRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: {
    requestId?: string;
    label?: string;
    maxAttempts?: number;
    delayMs?: number;
  } = {}
): Promise<T> {
  const {
    requestId = crypto.randomUUID().slice(0, 8),
    label = "db-operation",
    maxAttempts = 2,
    delayMs = 500,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (err) {
      lastError = err;
      const isTransient = isTransientDbError(err);

      if (attempt < maxAttempts && isTransient) {
        console.warn(
          `[DbRetry] [${requestId}] ${label} transient failure on attempt ${attempt}/${maxAttempts}. Retrying in ${delayMs}ms... Error:`,
          err instanceof Error ? err.message : err
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      console.error(
        `[DbRetry] [${requestId}] ${label} permanently failed on attempt ${attempt}/${maxAttempts}:`,
        err instanceof Error ? err.message : err
      );
      throw err;
    }
  }

  throw lastError;
}
