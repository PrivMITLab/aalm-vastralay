/**
 * 👑 AALM VASTRALAY — UNIT TESTS: FAIL-CLOSED REQUIRED ENVIRONMENT VARIABLES
 * Reference: docs/RULES.md Section 3 (Zero Secret / Fail-Closed Architecture Law).
 *
 * Verifies:
 *  1. Returns trimmed value when environment variable is populated.
 *  2. Production (NODE_ENV=production): Throws [FATAL] Error if variable is missing or empty.
 *  3. Development / Test (NODE_ENV!=production): Emits [SECURITY WARNING] and returns safe dev fallback.
 *  4. Fallback chain: Checks secondary key (e.g. POW_SECRET -> AUTH_SECRET) correctly.
 *  5. Rejects whitespace-only variables as empty.
 */

import { getRequiredEnv } from "../../src/lib/required-env";

function setNodeEnv(value: string | undefined) {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env["NODE_ENV"];
  } else {
    env["NODE_ENV"] = value;
  }
}

export async function testRequiredEnv() {
  console.log("  ▶ Running Required Env & Zero-Default Secrets Tests...");

  const originalNodeEnv = process.env.NODE_ENV;
  const originalTestVar = process.env.TEST_REQUIRED_SECRET_VAR;
  const originalFallbackVar = process.env.TEST_FALLBACK_SECRET_VAR;

  try {
    // ── 1. Populated variable returns trimmed value ───────────────────────────
    process.env.TEST_REQUIRED_SECRET_VAR = "   my-secure-production-token-123   ";
    const val = getRequiredEnv("TEST_REQUIRED_SECRET_VAR");
    if (val !== "my-secure-production-token-123") {
      throw new Error(`FAIL: Expected trimmed value 'my-secure-production-token-123', got: '${val}'`);
    }

    // ── 2. Production fail-closed: missing var throws [FATAL] ─────────────────
    setNodeEnv("production");
    delete process.env.TEST_REQUIRED_SECRET_VAR;

    let threwMissing = false;
    let missingErrorMsg = "";
    try {
      getRequiredEnv("TEST_REQUIRED_SECRET_VAR");
    } catch (err) {
      threwMissing = true;
      missingErrorMsg = err instanceof Error ? err.message : String(err);
    }

    if (!threwMissing) {
      throw new Error("FAIL: getRequiredEnv did NOT throw in production when env var was missing");
    }
    if (!missingErrorMsg.includes("[FATAL]") || !missingErrorMsg.includes("TEST_REQUIRED_SECRET_VAR")) {
      throw new Error(`FAIL: Expected [FATAL] error message mentioning variable, got: '${missingErrorMsg}'`);
    }

    // ── 3. Production fail-closed: whitespace-only var throws [FATAL] ──────────
    process.env.TEST_REQUIRED_SECRET_VAR = "     ";
    let threwWhitespace = false;
    try {
      getRequiredEnv("TEST_REQUIRED_SECRET_VAR");
    } catch {
      threwWhitespace = true;
    }

    if (!threwWhitespace) {
      throw new Error("FAIL: getRequiredEnv did NOT throw in production when env var was whitespace-only");
    }

    // ── 4. Non-production: missing var warns and returns dev fallback ──────────
    setNodeEnv("development");
    delete process.env.TEST_REQUIRED_SECRET_VAR;

    let warnCalled = false;
    let warnMsg = "";
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      warnCalled = true;
      warnMsg = args.map(String).join(" ");
    };

    let devResult = "";
    try {
      devResult = getRequiredEnv("TEST_REQUIRED_SECRET_VAR");
    } finally {
      console.warn = originalWarn;
    }

    if (!warnCalled || !warnMsg.includes("[SECURITY WARNING]")) {
      throw new Error(`FAIL: Expected console.warn with [SECURITY WARNING] in development, got: '${warnMsg}'`);
    }
    if (!devResult || !devResult.startsWith("dev-insecure-")) {
      throw new Error(`FAIL: Expected default dev fallback starting with 'dev-insecure-', got: '${devResult}'`);
    }

    // ── 5. Fallback key chaining (e.g. POW_SECRET -> AUTH_SECRET) ─────────────
    delete process.env.TEST_REQUIRED_SECRET_VAR;
    process.env.TEST_FALLBACK_SECRET_VAR = "fallback-secret-value-777";
    setNodeEnv("production");

    const chainedVal = getRequiredEnv(["TEST_REQUIRED_SECRET_VAR", "TEST_FALLBACK_SECRET_VAR"]);
    if (chainedVal !== "fallback-secret-value-777") {
      throw new Error(`FAIL: Fallback chain failed, expected 'fallback-secret-value-777', got: '${chainedVal}'`);
    }

    // When both are missing in production -> throws [FATAL]
    delete process.env.TEST_FALLBACK_SECRET_VAR;
    let threwChainedMissing = false;
    try {
      getRequiredEnv(["TEST_REQUIRED_SECRET_VAR", "TEST_FALLBACK_SECRET_VAR"]);
    } catch (err) {
      threwChainedMissing = true;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("[FATAL]")) {
        throw new Error(`FAIL: Chained missing should throw [FATAL], got: '${msg}'`);
      }
    }

    if (!threwChainedMissing) {
      throw new Error("FAIL: getRequiredEnv did NOT throw in production when all chained keys were missing");
    }

  } finally {
    // ── Restore initial environment state ────────────────────────────────────
    setNodeEnv(originalNodeEnv);

    if (originalTestVar !== undefined) {
      process.env.TEST_REQUIRED_SECRET_VAR = originalTestVar;
    } else {
      delete process.env.TEST_REQUIRED_SECRET_VAR;
    }

    if (originalFallbackVar !== undefined) {
      process.env.TEST_FALLBACK_SECRET_VAR = originalFallbackVar;
    } else {
      delete process.env.TEST_FALLBACK_SECRET_VAR;
    }
  }

  console.log("  ✔ Fail-closed required-env production fatal & dev warning verified!");
}
