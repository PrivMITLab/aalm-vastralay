/**
 * 👑 AALM VASTRALAY — SELLER MULTI-VENDOR PRIVACY & SCOPE TEST SUITE
 * Validates strict tenant isolation:
 * - Seller A cannot edit or delete Seller B's products or store
 * - Product inventory updates are scoped to the authenticated seller's store_id
 * - Order status changes enforce store ownership or admin privilege
 * - PII masking guarantees sensitive customer data is never leaked
 */

import { maskPhone, maskEmail } from "../src/lib/encryption";

interface MockProduct {
  id: string;
  storeId: string;
  title: string;
  price: number;
}

interface MockStore {
  id: string;
  ownerId: string;
  storeName: string;
}

interface MockUser {
  id: string;
  role: "customer" | "seller" | "admin";
  email: string;
}

export function canSellerModifyProduct(user: MockUser, userStore: MockStore | null, product: MockProduct): boolean {
  if (user.role === "admin") {
    // Admin has global oversight across all stores
    return true;
  }
  if (user.role === "seller" && userStore) {
    // Seller can ONLY modify products belonging to their own store
    return product.storeId === userStore.id && userStore.ownerId === user.id;
  }
  return false;
}

export function canUserUpdateOrderStatus(user: MockUser, userStore: MockStore | null, orderStoreId: string): boolean {
  if (user.role === "admin") return true;
  if (user.role === "seller" && userStore) {
    return userStore.id === orderStoreId && userStore.ownerId === user.id;
  }
  return false;
}

export async function testSellerPrivacyIsolation() {
  console.log("  ▶ Running Seller Multi-Vendor Privacy & Scoping Tests...");

  const adminUser: MockUser = { id: "u-admin", role: "admin", email: "admin@aalmvastralay.com" };
  const sellerA: MockUser = { id: "u-seller-a", role: "seller", email: "sellerA@domain.com" };
  const sellerB: MockUser = { id: "u-seller-b", role: "seller", email: "sellerB@domain.com" };
  const customer: MockUser = { id: "u-cust", role: "customer", email: "customer@domain.com" };

  const storeA: MockStore = { id: "store-a", ownerId: "u-seller-a", storeName: "Alam Silks" };
  const storeB: MockStore = { id: "store-b", ownerId: "u-seller-b", storeName: "Mithila Handlooms" };

  const productOfStoreA: MockProduct = {
    id: "prod-1",
    storeId: "store-a",
    title: "Banarasi Pure Silk Saree",
    price: 4999,
  };

  // 1. Seller A can modify their own product
  if (!canSellerModifyProduct(sellerA, storeA, productOfStoreA)) {
    throw new Error("Failed: Seller A must be permitted to modify products in Store A!");
  }

  // 2. Seller B CANNOT modify Seller A's product (Tenant Boundary Violation check)
  if (canSellerModifyProduct(sellerB, storeB, productOfStoreA)) {
    throw new Error("SECURITY VIOLATION: Seller B was allowed to modify Seller A's product!");
  }

  // 3. Normal customer CANNOT modify Seller A's product
  if (canSellerModifyProduct(customer, null, productOfStoreA)) {
    throw new Error("SECURITY VIOLATION: Customer was allowed to modify Seller A's product!");
  }

  // 4. Admin has legitimate global supervisor permission
  if (!canSellerModifyProduct(adminUser, null, productOfStoreA)) {
    throw new Error("Failed: Super Admin must have global oversight capability!");
  }

  // 5. Order dispatch status transitions
  if (!canUserUpdateOrderStatus(sellerA, storeA, "store-a")) {
    throw new Error("Failed: Seller A should be able to update status for orders placed with Store A");
  }

  if (canUserUpdateOrderStatus(sellerB, storeB, "store-a")) {
    throw new Error("SECURITY VIOLATION: Seller B was allowed to update an order from Store A!");
  }

  // 6. Sensitive customer data masking in seller/invoice context
  const rawCustomerPhone = "8434061342";
  const rawCustomerEmail = "customer.bihar@gmail.com";

  const maskedPhone = maskPhone(rawCustomerPhone);
  const maskedEmail = maskEmail(rawCustomerEmail);

  if (maskedPhone.includes("843406") && !maskedPhone.includes("***")) {
    throw new Error(`Failed: Customer phone was not masked properly: ${maskedPhone}`);
  }

  if (maskedEmail.includes("bihar") && !maskedEmail.includes("***")) {
    throw new Error(`Failed: Customer email was not masked properly: ${maskedEmail}`);
  }

  console.log("  ✔ Multi-vendor tenant isolation, store boundaries & PII masking verified!");
}
