import http from "k6/http";
import { check, sleep } from "k6";

/**
 * 👑 AALM VASTRALAY — K6 LOAD & CONCURRENCY STRESS TEST
 * Simulates 100 Virtual Users (VUs) simultaneously hitting key storefront endpoints.
 */
export const options = {
  stages: [
    { duration: "10s", target: 20 },  // Warm up: 0 se 20 users ramp up
    { duration: "30s", target: 100 }, // Peak load: 100 concurrent users hitting simultaneously
    { duration: "10s", target: 0 },   // Cool down: ramp down back to 0
  ],
  thresholds: {
    // 95% requests 500ms ke andar complete honi chahiye
    http_req_duration: ["p(95)<500"],
    // Failure rate 1% se kam hona chahiye
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";

export default function runLoadTest() {
  // 1. Hit Homepage
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    "Homepage status is 200": (r) => r.status === 200,
    "Homepage response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // User 1 second read pause leta hai

  // 2. Hit Search API / Page
  const resSearch = http.get(`${BASE_URL}/search?q=saree`);
  check(resSearch, {
    "Search page status is 200": (r) => r.status === 200,
  });

  sleep(1);

  // 3. Hit Static Policy Page (Edge cached)
  const resShipping = http.get(`${BASE_URL}/shipping`);
  check(resShipping, {
    "Shipping policy status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
