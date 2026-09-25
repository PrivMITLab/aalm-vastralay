import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

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
const DEFAULT_CHALLENGE_TTL_MS = 10 * 60 * 1000;

/**
 * Actions a challenge can be bound to. Binding stops a token solved for one
 * form (e.g. newsletter) from being replayed on another (e.g. checkout).
 * Challenges issued without an action are legacy and skip binding checks.
 */
export const POW_ACTIONS = ["newsletter", "order", "auth", "review", "contact"] as const;
export type PowAction = (typeof POW_ACTIONS)[number];

/** Type guard for action strings coming from query params or tokens. */
export function isPowAction(value: unknown): value is PowAction {
  return typeof value === "string" && (POW_ACTIONS as readonly string[]).includes(value);
}

export type PowChallenge = {
  algorithm: "PBKDF2/SHA-256";
  challenge: string;
  salt: string;
  iterations: number;
  maxnumber: number;
  zeros: number;
  expires: number;
  signature: string;
  /** Bound form action. Absent on legacy challenges (binding skipped). */
  action?: PowAction;
  /** HMAC of the IP the challenge was issued for. Absent on legacy challenges. */
  ipHash?: string;
};

export type PowSolution = {
  algorithm?: string;
  challenge?: string;
  salt?: string;
  number?: number;
  signature?: string;
  zeros?: number;
};

export type PowChallengeOptions = {
  /** Challenge lifetime in ms. Defaults to 10 min; click-to-solve uses 3 min. */
  ttlMs?: number;
  /** Binds the token to one form action. Omit for legacy unbound challenges. */
  action?: PowAction;
  /** Binds the token to the solver's IP (pre-hashed by the issuer). */
  ipHash?: string;
};

/**
 * Issues a signed challenge. The HMAC covers every field, so an attacker
 * cannot invent an easy puzzle or transplant fields between tokens.
 */
export function createChallenge(difficulty: number, maxnumber: number, opts: PowChallengeOptions = {}): PowChallenge {
  const challenge = randomBytes(20).toString("hex");
  const salt = randomBytes(12).toString("hex");
  const zeros = Math.min(5, Math.max(2, Math.floor(difficulty)));
  const ttl = Math.min(30 * 60 * 1000, Math.max(30 * 1000, Math.floor(opts.ttlMs ?? DEFAULT_CHALLENGE_TTL_MS)));
  const expires = Date.now() + ttl;
  const base = { algorithm: "PBKDF2/SHA-256", challenge, salt, iterations: ITERATIONS, maxnumber, zeros, expires } as const;
  const signature = sign({ ...base, action: opts.action ?? "", ipHash: opts.ipHash ?? "" });
  const out: PowChallenge = { ...base, signature };
  if (opts.action) out.action = opts.action;
  if (opts.ipHash) out.ipHash = opts.ipHash;
  return out;
}

function sign(payload: Record<string, string | number>) {
  const data = `${payload.algorithm}|${payload.challenge}|${payload.salt}|${payload.iterations}|${payload.maxnumber}|${payload.zeros}|${payload.expires}|${payload.action ?? ""}|${payload.ipHash ?? ""}`;
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** Legacy signature (pre-binding format) so in-flight tokens survive deploys. */
function signLegacy(payload: Record<string, string | number>) {
  const data = `${payload.algorithm}|${payload.challenge}|${payload.salt}|${payload.iterations}|${payload.maxnumber}|${payload.zeros}|${payload.expires}`;
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/**
 * Extracts the network subnet prefix for IP-binding:
 * - IPv4: First 3 octets (e.g. "49.37.112" from "49.37.112.9"), permitting standard /24 mobile carrier drift.
 * - IPv6: First 4 hextets (e.g. "2001:db8:85a3:8d3"), permitting standard /64 mobile network drift.
 * This blocks botnets and cross-network token transplants while avoiding false rejections
 * when mobile shoppers switch cellular towers or rotate ephemeral host octets.
 */
export function getIpSubnetPrefix(ip: string | null | undefined): string {
  if (!ip) return "unknown";
  const clean = String(ip).trim().toLowerCase();
  // Strip port if present (e.g. "1.2.3.4:5678")
  const withoutPort = clean.includes(":") && !clean.includes("::") && clean.split(":").length === 2 && !clean.includes("[")
    ? clean.split(":")[0]
    : clean.replace(/^\[|\]$/g, "");

  // IPv4 check: 4 dot-separated decimal octets
  const ipv4Match = withoutPort.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (ipv4Match) {
    return ipv4Match[1];
  }

  // IPv6 check: contains colons
  if (withoutPort.includes(":")) {
    const segments = withoutPort.split(":");
    // Take first 4 segments (/64 standard subscriber allocation)
    return segments.slice(0, 4).join(":");
  }

  return withoutPort.slice(0, 40);
}

/**
 * One-way HMAC hash of a caller's IP subnet for challenge binding.
 * The raw IP never enters the token; the server recomputes this at submit time
 * and compares it. Allows /24 mobile network drift to prevent customer friction.
 */
export function hashIp(ip: string | null | undefined): string {
  const subnet = getIpSubnetPrefix(ip);
  return createHmac("sha256", SECRET)
    .update(`pow-ip|${subnet}`)
    .digest("base64url")
    .slice(0, 32);
}

/** Stable fingerprint of a challenge string for single-use tracking. */
export function hashChallenge(challenge: string): string {
  return createHash("sha256").update(`pow-use|${challenge}`).digest("hex");
}

export function solveHash(challenge: string, salt: string, number: number, iterations = ITERATIONS) {
  return pbkdf2Sync(challenge, `${salt}?${number}`, iterations, KEY_LEN, "sha256").toString("hex");
}

/** Browser-side compatible hash (same parameters) used by the client solver. */
export function solutionPreview(challenge: string, salt: string, number: number, iterations = ITERATIONS) {
  return solveHash(challenge, salt, number, iterations).slice(0, 16);
}

export type PowVerification = { ok: boolean; error?: string; elapsedMs?: number };

export type PowVerifyOptions = {
  /** Rejects tokens bound to a different action. Legacy unbound tokens skip this. */
  expectedAction?: PowAction;
  /** Pre-hashed caller IP (see hashIp). Compared only when the token carries ipHash. */
  expectedIpHash?: string;
};

/**
 * Verifies a solution against its challenge: signature (timing-safe), expiry,
 * puzzle answer, then action/IP binding when the token carries them.
 * Pure function — single-use enforcement lives in pow-store.consumeChallenge.
 */
export function verifySolution(
  solution: PowSolution | null | undefined,
  challenge: PowChallenge | null | undefined,
  opts: PowVerifyOptions = {},
): PowVerification {
  if (!solution || !challenge) return { ok: false, error: "Suraksha jaanch missing hai. (Security check missing. Please reload the page.)" };
  const base = {
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    salt: challenge.salt,
    iterations: challenge.iterations,
    maxnumber: challenge.maxnumber,
    zeros: challenge.zeros,
    expires: challenge.expires,
  };
  const isLegacy = challenge.action === undefined && challenge.ipHash === undefined;
  const newSig = sign({ ...base, action: challenge.action ?? "", ipHash: challenge.ipHash ?? "" });
  const sigOk = safeEqual(newSig, String(solution.signature ?? "")) || (isLegacy && safeEqual(signLegacy(base), String(solution.signature ?? "")));
  if (!sigOk) return { ok: false, error: "Suraksha signature verify nahi ho saka. (Security challenge could not be verified. Please reload.)" };
  if (Date.now() > challenge.expires) return { ok: false, error: "Suraksha samay samapt ho gaya hai. (Security challenge expired. Please try again.)" };
  if (String(solution.challenge) !== challenge.challenge) return { ok: false, error: "Suraksha challenge asuvidha. (Security challenge mismatch. Please reload.)" };
  if (opts.expectedAction && challenge.action !== undefined && challenge.action !== opts.expectedAction) {
    return { ok: false, error: "Ye suraksha token kisi doosre form ke liye tha. (Security check was solved for a different form. Please verify again.)" };
  }
  if (challenge.ipHash !== undefined && opts.expectedIpHash !== undefined && challenge.ipHash !== opts.expectedIpHash) {
    return { ok: false, error: "Network badalne ke karan suraksha reset hui. (Network changed during verification. Please verify again.)" };
  }
  const number = Number(solution.number);
  if (!Number.isInteger(number) || number < 0 || number > challenge.maxnumber) return { ok: false, error: "Invalid security solution." };

  const started = Date.now();
  const hash = solveHash(challenge.challenge, challenge.salt, number, challenge.iterations);
  const prefix = "0".repeat(challenge.zeros);
  if (!hash.startsWith(prefix)) return { ok: false, error: "Security check failed. Please try again." };
  return { ok: true, elapsedMs: Date.now() - started };
}

/** Parsed payload shared by verifyPayload and the consuming verifier. */
export function parsePayload(payload: string | null | undefined): { challenge?: PowChallenge; solution?: PowSolution } | null {
  if (!payload) return null;
  try {
    return JSON.parse(payload) as { challenge?: PowChallenge; solution?: PowSolution };
  } catch {
    return null;
  }
}

/** Combines challenge + solution into the single form value the client submits. */
export function verifyPayload(payload: string | null | undefined, opts: PowVerifyOptions = {}): PowVerification {
  const parsed = parsePayload(payload);
  if (!parsed) return { ok: false, error: !payload ? "Security check missing. Please reload the page." : "Security payload was malformed." };
  return verifySolution(parsed.solution, parsed.challenge, opts);
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
