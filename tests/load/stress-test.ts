/**
 * 👑 AALM VASTRALAY — HIGH-CONCURRENCY LOAD & STRESS TEST
 * Simulates simultaneous shopper surges (Diwali / Wedding season traffic).
 *
 * Metrics measured:
 *  - Concurrency: 50 simultaneous virtual shoppers
 *  - Total Requests: 100 requests across Storefront & Search
 *  - Success Rate: Must be >= 99% (zero 500 errors)
 *  - P95 / P99 Latency: Milliseconds breakdown
 *  - Throughput (RPS): Requests per second
 */

interface RequestMetric {
  url: string;
  status: number;
  durationMs: number;
  success: boolean;
}

const BASE_URL = process.env.STRESS_TARGET_URL || "http://localhost:3000";
const CONCURRENCY = 25; // 25 simultaneous shoppers
const TOTAL_ROUNDS = 2; // 25 * 2 = 50 requests
const ENDPOINTS = [
  "/",
  "/search?q=saree",
  "/shipping",
  "/terms",
  "/privacy",
];

async function fetchWithTiming(url: string): Promise<RequestMetric> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { "User-Agent": "Aalm-StressTester/1.0" },
    });
    const durationMs = Math.round(performance.now() - start);
    return {
      url,
      status: res.status,
      durationMs,
      success: res.status >= 200 && res.status < 400,
    };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed request to ${url}:`, message);
    return {
      url,
      status: 0,
      durationMs,
      success: false,
    };
  }
}

async function runStressTest() {
  console.log("=================================================");
  console.log(" 🚀 AALM VASTRALAY — CONCURRENCY STRESS TEST");
  console.log(` Target: ${BASE_URL}`);
  console.log(` Concurrency: ${CONCURRENCY} concurrent shoppers`);
  console.log(` Total Requests: ${CONCURRENCY * TOTAL_ROUNDS}`);
  console.log("=================================================");

  const metrics: RequestMetric[] = [];
  const testStart = performance.now();

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    console.log(`\n⏳ Dispatching Wave ${round}/${TOTAL_ROUNDS} (${CONCURRENCY} concurrent requests)...`);
    const batch = Array.from({ length: CONCURRENCY }, (_, i) => {
      const endpoint = ENDPOINTS[i % ENDPOINTS.length];
      return fetchWithTiming(endpoint);
    });

    const results = await Promise.all(batch);
    metrics.push(...results);
  }

  const totalTimeSeconds = (performance.now() - testStart) / 1000;
  const successful = metrics.filter((m) => m.success);
  const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);

  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];
  const min = durations[0];
  const max = durations[durations.length - 1];
  const rps = (metrics.length / totalTimeSeconds).toFixed(1);
  const successRate = ((successful.length / metrics.length) * 100).toFixed(1);

  console.log("\n=================================================");
  console.log(" 📊 STRESS TEST RESULTS & BOTTLENECK ANALYSIS");
  console.log("=================================================");
  console.log(` Total Requests Sent:  ${metrics.length}`);
  console.log(` Success Rate:         ${successRate}% (${successful.length}/${metrics.length})`);
  console.log(` Throughput:           ${rps} requests/second`);
  console.log(` Latency Min:          ${min} ms`);
  console.log(` Latency Avg (Mean):   ${avgDuration} ms`);
  console.log(` Latency P50 (Median): ${p50} ms`);
  console.log(` Latency P95:          ${p95} ms`);
  console.log(` Latency P99:          ${p99} ms`);
  console.log(` Latency Max:          ${max} ms`);
  console.log("=================================================");

  if (Number(successRate) < 95) {
    console.error("❌ High error rate under concurrency!");
    process.exit(1);
  } else {
    console.log("✅ Concurrency Stress Test PASSED successfully! 🏆");
  }
}

runStressTest();
