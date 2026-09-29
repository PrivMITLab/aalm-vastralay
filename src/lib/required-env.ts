/**
 * 👑 AALM VASTRALAY — FAIL-CLOSED REQUIRED ENVIRONMENT VARIABLE ENFORCER
 * Enforces zero-default-secrets across production and development runtimes.
 * Reference: docs/RULES.md Section 3 (Zero Secret / Fail-Closed Architecture Law).
 *
 * Rules:
 *  1. Production (NODE_ENV === "production"):
 *     - Fails closed: Missing or empty environment variables throw a fatal error immediately.
 *     - Zero hardcoded fallback secrets in source code.
 *  2. Development & Test (NODE_ENV !== "production"):
 *     - Emits a console.warn warning.
 *     - Returns a safe, deterministic, non-sensitive dev fallback.
 *  3. Value returned is always whitespace-trimmed.
 */

export interface RequiredEnvOptions {
  /** Optional secondary fallback environment variable key(s) if primary key is not set */
  fallbackEnvKey?: string | string[];
  /** Optional developer fallback value for non-production environments */
  devFallback?: string;
  /** Context description for log/error messages */
  description?: string;
}

/**
 * Retrieves a required environment variable, ensuring no hardcoded secrets exist in source code.
 * In production: throws a [FATAL] Error if missing or empty.
 * In non-production: emits a warning and returns an insecure dev fallback.
 *
 * @param key Primary environment variable name, or array of fallback environment variable names
 * @param options Optional configuration for fallback keys, dev fallback, or description
 * @returns Trimmed string value
 */
export function getRequiredEnv(
  key: string | string[],
  options?: RequiredEnvOptions
): string {
  const keys: string[] = Array.isArray(key) ? [...key] : [key];
  if (options?.fallbackEnvKey) {
    const extra = Array.isArray(options.fallbackEnvKey)
      ? options.fallbackEnvKey
      : [options.fallbackEnvKey];
    keys.push(...extra);
  }

  for (const k of keys) {
    const val = process.env[k]?.trim();
    if (val && val.length > 0) {
      return val;
    }
  }

  const primaryKey = keys[0];
  const keysList = keys.length > 1 ? `${primaryKey} (or ${keys.slice(1).join(", ")})` : primaryKey;
  const desc = options?.description || keysList;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[FATAL] ${desc} env var is not set. ` +
      `Set ${primaryKey} in your Vercel / hosting environment to prevent security failures. ` +
      `Boot aborted.`
    );
  }

  console.warn(
    `[SECURITY WARNING] ${desc} is not set. ` +
    `Using insecure dev-only fallback. ` +
    `Set ${primaryKey} in .env.local before going to production.`
  );

  return options?.devFallback ?? `dev-insecure-${primaryKey.toLowerCase().replace(/_/g, "-")}-fallback`;
}
