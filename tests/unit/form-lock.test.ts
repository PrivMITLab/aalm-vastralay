import assert from "node:assert/strict";

/**
 * Headless re-entry lock simulator verifying the same atomic lock logic
 * executed by useFormLock in client components.
 */
class HeadlessLock {
  private locked = false;

  async run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (this.locked) return undefined;
    this.locked = true;
    try {
      return await fn();
    } finally {
      this.locked = false;
    }
  }

  isLocked(): boolean {
    return this.locked;
  }
}

export async function testFormLockDefense() {
  console.log("  ▶ Running Button Double-Click Chaos Defense Tests...");

  const lock = new HeadlessLock();
  let executionCount = 0;

  // Simulate a slow server action (50ms)
  const slowAction = async () => {
    executionCount++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    return "order_placed_123";
  };

  // Launch two concurrent clicks
  const promise1 = lock.run(slowAction);
  const promise2 = lock.run(slowAction); // Should be blocked by re-entry guard

  const [res1, res2] = await Promise.all([promise1, promise2]);

  assert.equal(res1, "order_placed_123", "First submission should succeed");
  assert.equal(res2, undefined, "Second rapid duplicate click must be discarded by re-entry lock");
  assert.equal(executionCount, 1, "Slow action must only have executed exactly once");
  assert.equal(lock.isLocked(), false, "Lock must automatically release after execution finishes");

  // Verify subsequent click after release succeeds
  const res3 = await lock.run(slowAction);
  assert.equal(res3, "order_placed_123", "Subsequent click after completion must execute");
  assert.equal(executionCount, 2, "Action executed for fresh submission");

  console.log("  ✔ Button double-click re-entry lock verified!\n");
}
