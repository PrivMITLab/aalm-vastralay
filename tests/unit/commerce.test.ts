import { describe, it, expect } from "vitest";

/**
 * 👑 AALM VASTRALAY — CORE BUSINESS LOGIC FUNCTIONS & TESTS
 * Critical calculations: GST Statutory Slabs, Cart Totaling, and RFC Email Verification.
 */

// 1. Statutory Indian GST Calculator:
// Apparel <= ₹1000 par 5% GST, > ₹1000 par 12% GST lagta hai (Statutory Rule)
export function calculateGst(amount: number, unitPrice: number): { gstRate: number; gstAmount: number; totalWithGst: number } {
  if (amount < 0 || unitPrice < 0) {
    throw new Error("Amount and price must be non-negative");
  }
  const gstRate = unitPrice <= 1000 ? 0.05 : 0.12;
  const gstAmount = Math.round(amount * gstRate * 100) / 100;
  const totalWithGst = Math.round((amount + gstAmount) * 100) / 100;
  return { gstRate, gstAmount, totalWithGst };
}

// 2. Cart Total Calculator with Free Shipping Threshold (₹999)
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export function calculateCartTotal(items: CartItem[], discountAmount = 0): { subtotal: number; discount: number; shipping: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const effectiveDiscount = Math.min(discountAmount, subtotal);
  const discountedSubtotal = subtotal - effectiveDiscount;
  // Agar order ₹999 ya usse upar ho toh shipping FREE, warna ₹99 flat delivery fee
  const shipping = discountedSubtotal >= 999 || items.length === 0 ? 0 : 99;
  const total = discountedSubtotal + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(effectiveDiscount * 100) / 100,
    shipping,
    total: Math.round(total * 100) / 100,
  };
}

// 3. RFC 5322 Compliant Email Validator (No ReDoS Vulnerability)
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string" || email.length > 254) return false;
  // Strict standard regex guarding against malicious catastrophic backtracking
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

// ==========================================
// 🧪 VITEST TEST SUITE
// ==========================================
describe("Commerce & Business Logic Unit Tests", () => {
  describe("calculateGst() Statutory Slabs", () => {
    it("should apply 5% GST for apparel priced at or below ₹1000", () => {
      const result = calculateGst(1000, 1000);
      expect(result.gstRate).toBe(0.05);
      expect(result.gstAmount).toBe(50);
      expect(result.totalWithGst).toBe(1050);
    });

    it("should apply 12% GST for luxury apparel priced above ₹1000", () => {
      const result = calculateGst(2500, 2500);
      expect(result.gstRate).toBe(0.12);
      expect(result.gstAmount).toBe(300);
      expect(result.totalWithGst).toBe(2800);
    });

    it("should throw an error on negative price or amount", () => {
      expect(() => calculateGst(-500, 100)).toThrow("Amount and price must be non-negative");
    });
  });

  describe("calculateCartTotal() Rules", () => {
    it("should calculate correct subtotal and apply free shipping over ₹999", () => {
      const cart: CartItem[] = [
        { id: "1", title: "Banarasi Saree", price: 1500, quantity: 1 },
      ];
      const result = calculateCartTotal(cart, 0);
      expect(result.subtotal).toBe(1500);
      expect(result.shipping).toBe(0); // Free shipping because >= 999
      expect(result.total).toBe(1500);
    });

    it("should apply ₹99 shipping fee when subtotal is below ₹999", () => {
      const cart: CartItem[] = [
        { id: "2", title: "Cotton Kurti", price: 500, quantity: 1 },
      ];
      const result = calculateCartTotal(cart, 0);
      expect(result.subtotal).toBe(500);
      expect(result.shipping).toBe(99); // ₹99 shipping applied
      expect(result.total).toBe(599);
    });

    it("should handle coupon discounts without making total negative", () => {
      const cart: CartItem[] = [
        { id: "3", title: "Silk Dupatta", price: 400, quantity: 1 },
      ];
      const result = calculateCartTotal(cart, 500); // Discount exceeds subtotal
      expect(result.discount).toBe(400); // Capped to subtotal
      expect(result.shipping).toBe(99); // ₹99 shipping because discounted subtotal is 0 (< 999)
      expect(result.total).toBe(99);
    });
  });

  describe("validateEmail() Sanitization & Check", () => {
    it("should accept valid standard emails", () => {
      expect(validateEmail("customer@aalmvastralay.com")).toBe(true);
      expect(validateEmail("artisan.weaver@varanasi.org")).toBe(true);
    });

    it("should reject malformed or dangerous email strings", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("test@.com")).toBe(false);
      expect(validateEmail("<script>alert(1)</script>@test.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });
});
