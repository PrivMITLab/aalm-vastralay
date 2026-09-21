import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Altcha-style proof-of-work bot protection – self-hosted, no API keys, no third party.
 *
 * Flow
 *  1. Server issues a signed challenge   (GET /api/security/challenge)
 *  2. Browser brute-forces a `number` whose PBKDF2 hash starts with N zeros ("weight")
 *  3. Form is submitted together with the solution
 *  4. Server re-computes the hash in ~1 ms and verifies the signature + expiry
 *
 * Because the challenge is HMAC-signed, an attacker cannot invent an easy puzzle,
 * and because the solution is expensive to find, mass form spam becomes uneconomical.
 */

const SECRET = process.env.POW_SECRET ?? process.env.AUTH_SECRET ?? "aalm-vastralay-pow-secret";
const ITERATIONS = 1000;
const KEY_LEN = 32;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

export type PowChallenge = {
  algorithm: "PBKDF2/SHA-256";
  challenge: string;
  salt: string;
  iterations: number;
  maxnumber: number;
  zeros: number;
  expires: number;
  signature: string;
};

export type PowSolution = {
  algorithm?: string;
  challenge?: string;
  salt?: string;
  number?: number;
  signature?: string;
  zeros?: number;
};

export function createChallenge(difficulty: number, maxnumber: number): PowChallenge {
  const challenge = randomBytes(20).toString("hex");
  const salt = randomBytes(12).toString("hex");
  const zeros = Math.min(5, Math.max(2, Math.floor(difficulty)));
  const expires = Date.now() + CHALLENGE_TTL_MS;
  const signature = sign({ algorithm: "PBKDF2/SHA-256", challenge, salt, iterations: ITERATIONS, maxnumber, zeros, expires });
  return { algorithm: "PBKDF2/SHA-256", challenge, salt, iterations: ITERATIONS, maxnumber, zeros, expires, signature };
}

function sign(payload: Record<string, string | number>) {
  const data = `${payload.algorithm}|${payload.challenge}|${payload.salt}|${payload.iterations}|${payload.maxnumber}|${payload.zeros}|${payload.expires}`;
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function solveHash(challenge: string, salt: string, number: number, iterations = ITERATIONS) {
  return pbkdf2Sync(challenge, `${salt}?${number}`, iterations, KEY_LEN, "sha256").toString("hex");
}

/** Browser-side compatible hash (same parameters) used by the client solver. */
export function solutionPreview(challenge: string, salt: string, number: number, iterations = ITERATIONS) {
  return solveHash(challenge, salt, number, iterations).slice(0, 16);
}

export type PowVerification = { ok: boolean; error?: string; elapsedMs?: number };

export function verifySolution(solution: PowSolution | null | undefined, challenge: PowChallenge | null | undefined): PowVerification {
  if (!solution || !challenge) return { ok: false, error: "Security check missing. Please reload the page." };
  const expected = sign({
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    salt: challenge.salt,
    iterations: challenge.iterations,
    maxnumber: challenge.maxnumber,
    zeros: challenge.zeros,
    expires: challenge.expires,
  });
  if (!safeEqual(expected, String(solution.signature ?? ""))) return { ok: false, error: "Security challenge could not be verified. Please reload." };
  if (Date.now() > challenge.expires) return { ok: false, error: "Security challenge expired. Please try again." };
  if (String(solution.challenge) !== challenge.challenge) return { ok: false, error: "Security challenge mismatch. Please reload." };
  const number = Number(solution.number);
  if (!Number.isInteger(number) || number < 0 || number > challenge.maxnumber) return { ok: false, error: "Invalid security solution." };

  const started = Date.now();
  const hash = solveHash(challenge.challenge, challenge.salt, number, challenge.iterations);
  const prefix = "0".repeat(challenge.zeros);
  if (!hash.startsWith(prefix)) return { ok: false, error: "Security check failed. Please try again." };
  return { ok: true, elapsedMs: Date.now() - started };
}

/** Combines challenge + solution into the single form value the client submits. */
export function verifyPayload(payload: string | null | undefined): PowVerification {
  if (!payload) return { ok: false, error: "Security check missing. Please reload the page." };
  let parsed: { challenge?: PowChallenge; solution?: PowSolution };
  try {
    parsed = JSON.parse(payload) as { challenge?: PowChallenge; solution?: PowSolution };
  } catch {
    return { ok: false, error: "Security payload was malformed." };
  }
  return verifySolution(parsed.solution, parsed.challenge);
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
