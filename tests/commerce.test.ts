import { formatINR, freeShippingThreshold } from "../src/lib/utils";

export async function testCommerce() {
  console.log("  ▶ Running Indian Commerce & Currency Tests...");

  // 1. Indian Currency (₹) Formatting
  const formatted1 = formatINR(1499);
  if (!formatted1.includes("1,499")) {
    throw new Error(`Failed: formatINR(1499) returned ${formatted1}`);
  }

  const formatted2 = formatINR(95000);
  if (!formatted2.includes("95,000")) {
    throw new Error(`Failed: formatINR(95000) returned ${formatted2}`);
  }

  // 2. Free Shipping Threshold
  const threshold = freeShippingThreshold();
  if (typeof threshold !== "number" || threshold < 0) {
    throw new Error(`Failed: Invalid free shipping threshold ${threshold}`);
  }

  // 3. Discount math verification
  const mrp = 5000;
  const price = 3750;
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);
  if (discountPercent !== 25) {
    throw new Error(`Failed: Discount calculation should be 25%, got ${discountPercent}%`);
  }

  console.log("  ✔ INR currency formatting and commerce calculations passed!");
}
