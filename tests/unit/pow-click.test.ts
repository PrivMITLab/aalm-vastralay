import assert from "node:assert/strict";
import {
  createChallenge,
  hashIp,
  solveHash,
  type PowChallenge,
} from "@/lib/pow";
import {
  memoryStore,
  verifyPayloadAndConsume,
  type ChallengeStore,
} from "@/lib/pow-store";

/**
 * Click-to-solve PoW defense tests: fresh solve passes, replay dies,
 * cross-action/IP transplants die, expiry dies, tampering dies, and an
 * inspect-enabled empty submit dies server-side.
 *
 * Pure unit tests — an in-memory single-use store is injected so no live
 * database is needed. The production default store runs identical SQL.
 */

function bruteForce(c: PowChallenge): number {
  const prefix = "0".repeat(c.zeros);
  for (let n = 0; n <= c.maxnumber; n++) {
    if (solveHash(c.challenge, c.salt, n, c.iterations).startsWith(prefix)) return n;
  }
  return -1;
}

function toPayload(c: PowChallenge, n: number): string {
  return JSON.stringify({
    challenge: c,
    solution: { algorithm: c.algorithm, challenge: c.challenge, salt: c.salt, number: n, signature: c.signature, zeros: c.zeros },
  });
}

export async function testPowClickDefense() {
  console.log("  ▶ Running Click-to-Solve PoW Single-Use & Binding Tests...");

  // 1. Fresh bound solve passes (order action, pinned IP).
  {
    const store: ChallengeStore = memoryStore();
    const ip = "49.37.112.9";
    const c = createChallenge(2, 1000000, { action: "order", ipHash: hashIp(ip), ttlMs: 180000 });
    const n = bruteForce(c);
    assert.ok(n >= 0, "solver must find a number for zeros=2");
    const verdict = await verifyPayloadAndConsume(toPayload(c, n), { action: "order", ip, strict: true, store });
    assert.ok(verdict.ok, `fresh solve must pass: ${verdict.error}`);
  }

  // 2. Same payload replayed → rejected as already used.
  {
    const store: ChallengeStore = memoryStore();
    const ip = "49.37.112.9";
    const c = createChallenge(2, 1000000, { action: "order", ipHash: hashIp(ip), ttlMs: 180000 });
    const body = toPayload(c, bruteForce(c));
    const first = await verifyPayloadAndConsume(body, { action: "order", ip, strict: true, store });
    assert.ok(first.ok, "first use must pass");
    const second = await verifyPayloadAndConsume(body, { action: "order", ip, strict: true, store });
    assert.ok(!second.ok && /already used/i.test(second.error ?? ""), `replay must die, got: ${second.error}`);
  }

  // 3. Newsletter token transplanted onto order → rejected.
  {
    const store: ChallengeStore = memoryStore();
    const ip = "49.37.112.9";
    const c = createChallenge(2, 1000000, { action: "newsletter", ipHash: hashIp(ip), ttlMs: 180000 });
    const verdict = await verifyPayloadAndConsume(toPayload(c, bruteForce(c)), { action: "order", ip, strict: true, store });
    assert.ok(!verdict.ok && /different form/i.test(verdict.error ?? ""), `cross-action must die, got: ${verdict.error}`);
  }

  // 4. Token solved for another IP → rejected across different subnets, but /24 mobile drift passes.
  {
    const store: ChallengeStore = memoryStore();
    // Issued for 49.37.112.9
    const c = createChallenge(2, 1000000, { action: "auth", ipHash: hashIp("49.37.112.9"), ttlMs: 180000 });
    const solved = toPayload(c, bruteForce(c));

    // 4a. Mobile /24 drift (same subnet 49.37.112.xxx, e.g. tower handover) -> PASSES
    const mobileDriftVerdict = await verifyPayloadAndConsume(solved, { action: "auth", ip: "49.37.112.88", strict: true, store });
    assert.ok(mobileDriftVerdict.ok, `mobile /24 drift must pass, got: ${mobileDriftVerdict.error}`);

    // 4b. Completely different network/botnet IP -> REJECTED
    const store2: ChallengeStore = memoryStore();
    const crossNetVerdict = await verifyPayloadAndConsume(solved, { action: "auth", ip: "103.22.77.4", strict: true, store: store2 });
    assert.ok(!crossNetVerdict.ok && /network changed/i.test(crossNetVerdict.error ?? ""), `cross-network IP transplant must die, got: ${crossNetVerdict.error}`);
  }

  // 5. Expired token → rejected even with a correct answer.
  {
    const store: ChallengeStore = memoryStore();
    const c = createChallenge(2, 1000000, { action: "auth", ttlMs: 60000 });
    const body = toPayload(c, bruteForce(c));
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + 20 * 60 * 1000;
      const verdict = await verifyPayloadAndConsume(body, { action: "auth", strict: true, store });
      assert.ok(!verdict.ok && /expired/i.test(verdict.error ?? ""), `expired must die, got: ${verdict.error}`);
    } finally {
      Date.now = realNow;
    }
  }

  // 6. Tampered signature → rejected.
  {
    const store: ChallengeStore = memoryStore();
    const c = createChallenge(2, 1000000, { action: "review", ttlMs: 180000 });
    const n = bruteForce(c);
    const parsed = JSON.parse(toPayload(c, n)) as { challenge: PowChallenge; solution: Record<string, unknown> };
    const sig = String(parsed.solution.signature);
    parsed.solution.signature = sig.slice(0, -1) + (sig.endsWith("A") ? "B" : "A");
    const verdict = await verifyPayloadAndConsume(JSON.stringify(parsed), { action: "review", strict: true, store });
    assert.ok(!verdict.ok, "tampered signature must die");
  }

  // 7. Inspect-enabled submit (empty payload, button force-unlocked) → dies server-side.
  {
    const store: ChallengeStore = memoryStore();
    const verdict = await verifyPayloadAndConsume("", { action: "order", ip: "1.2.3.4", strict: true, store });
    assert.ok(!verdict.ok, "empty payload must die server-side");
  }

  // 8. Legacy unbound token (pre-deploy format) still verifies — binding skipped, single-use enforced.
  {
    const store: ChallengeStore = memoryStore();
    const c = createChallenge(2, 1000000);
    assert.ok(c.action === undefined, "legacy challenge carries no action");
    const body = toPayload(c, bruteForce(c));
    const first = await verifyPayloadAndConsume(body, { action: "order", ip: "9.9.9.9", strict: true, store });
    assert.ok(first.ok, `legacy token must still pass: ${first.error}`);
    const second = await verifyPayloadAndConsume(body, { action: "order", ip: "9.9.9.9", strict: true, store });
    assert.ok(!second.ok, "legacy token replay must die");
  }

  console.log("  ✔ Click-to-solve single-use, binding, expiry & tamper defense verified!");
}
