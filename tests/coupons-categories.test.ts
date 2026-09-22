/**
 * 👑 AALM VASTRALAY — COUPONS & CATEGORIES ENTERPRISE TEST SUITE
 * Validates discount calculations, minimum order restrictions,
 * maximum discount caps, and ethnic wear category tree hierarchies.
 */

interface CouponRule {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  validUntil?: Date;
}

export function calculateDiscount(subtotal: number, coupon: CouponRule): { valid: boolean; discount: number; reason?: string } {
  if (!coupon.isActive) {
    return { valid: false, discount: 0, reason: "Coupon is not active" };
  }

  if (coupon.validUntil && coupon.validUntil < new Date()) {
    return { valid: false, discount: 0, reason: "Coupon has expired" };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      discount: 0,
      reason: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
    };
  }

  let calculated = 0;
  if (coupon.discountType === "percentage") {
    calculated = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && calculated > coupon.maxDiscount) {
      calculated = coupon.maxDiscount;
    }
  } else {
    calculated = Math.min(coupon.discountValue, subtotal);
  }

  return {
    valid: true,
    discount: Math.round(calculated * 100) / 100,
  };
}

export async function testCouponsAndCategories() {
  console.log("  ▶ Running Coupons & Category Hierarchy Tests...");

  // 1. Percentage coupon with cap (WELCOME10: 10% off up to ₹500, min order ₹999)
  const welcome10: CouponRule = {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    isActive: true,
  };

  // Test below minimum order
  const belowMin = calculateDiscount(850, welcome10);
  if (belowMin.valid || belowMin.discount !== 0) {
    throw new Error("Failed: Coupon should be rejected when order subtotal is below minimum order value!");
  }

  // Test normal percentage calculation
  const normalOrder = calculateDiscount(2000, welcome10);
  if (!normalOrder.valid || normalOrder.discount !== 200) {
    throw new Error(`Failed: 10% of 2000 should be 200, got ${normalOrder.discount}`);
  }

  // Test maximum discount cap
  const bigOrder = calculateDiscount(10000, welcome10);
  if (!bigOrder.valid || bigOrder.discount !== 500) {
    throw new Error(`Failed: 10% of 10000 should be capped at maxDiscount ₹500, got ${bigOrder.discount}`);
  }

  // 2. Fixed amount coupon (FESTIVE50: Flat ₹500 off on ₹2999)
  const festive50: CouponRule = {
    code: "FESTIVE50",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 2999,
    isActive: true,
  };

  const fixedResult = calculateDiscount(3500, festive50);
  if (!fixedResult.valid || fixedResult.discount !== 500) {
    throw new Error(`Failed: Flat discount should be ₹500, got ${fixedResult.discount}`);
  }

  // 3. Inactive coupon rejection
  const inactiveCoupon: CouponRule = {
    code: "OLDPROMO",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 500,
    isActive: false,
  };
  const inactiveResult = calculateDiscount(1500, inactiveCoupon);
  if (inactiveResult.valid) {
    throw new Error("Failed: Inactive coupons must be rejected!");
  }

  // 4. Category Hierarchy Integrity (Women, Men, Kids, Accessories)
  const ETHNIC_CATEGORIES = [
    { name: "Women's Ethnic", slug: "women", parent: null },
    { name: "Lehengas", slug: "lehengas", parent: "women" },
    { name: "Sarees", slug: "sarees", parent: "women" },
    { name: "Anarkali Suits", slug: "anarkali-suits", parent: "women" },
    { name: "Men's Ethnic", slug: "men", parent: null },
    { name: "Sherwanis", slug: "sherwanis", parent: "men" },
    { name: "Kurta Sets", slug: "kurta-sets", parent: "men" },
    { name: "Kids Ethnic", slug: "kids", parent: null },
    { name: "Accessories", slug: "accessories", parent: null },
    { name: "Dupattas", slug: "dupattas", parent: "accessories" },
  ];

  const slugs = new Set<string>();
  for (const cat of ETHNIC_CATEGORIES) {
    if (slugs.has(cat.slug)) {
      throw new Error(`Failed: Duplicate category slug detected: ${cat.slug}`);
    }
    slugs.add(cat.slug);

    if (cat.parent) {
      const parentExists = ETHNIC_CATEGORIES.some((c) => c.slug === cat.parent && c.parent === null);
      if (!parentExists) {
        throw new Error(`Failed: Sub-category '${cat.name}' points to non-existent parent '${cat.parent}'`);
      }
    }
  }

  console.log("  ✔ Coupon discount rules, caps, thresholds & category hierarchies verified!");
}
