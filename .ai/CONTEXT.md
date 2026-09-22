# 🧠 AALM VASTRALAY — LIVE APP CONTEXT
# Location: .ai/CONTEXT.md

## 1. Project Overview
- **Project Name:** Aalm Vastralay (आलम वस्त्रालय) — Marketplace Platform
- **Owner / Proprietor:** Suheb Alam (Kalyanipur, Bihar, India)
- **Primary Domain:** Indian Ethnic Wear Marketplace (Sarees, Lehengas, Sherwanis, Kurta Sets, Dupattas, Jewellery)
- **Architecture:** Next.js 16 (App Router + Turbopack) + Drizzle ORM + Neon Serverless PostgreSQL + Tailwind CSS + Lucide React

## 2. Current Verified Status (Production Ready)
- **Build Status:** Next.js 16 Turbopack build passes with 0 errors (`npm run build`).
- **TypeScript Status:** Strict mode enabled, 0 type errors (`npm run typecheck`).
- **ESLint Status:** Clean, 0 errors/warnings (`npm run lint`).
- **Automated Tests:** 7 Enterprise test suites in `tests/` passing in ~0.26s (`npm test`).
- **Git Branch:** `main` (Remote: `https://github.com/alamwastraly-sketch/aalm-vastralay.git`).

## 3. Database Schema (16 Tables)
1. `users`: Customers, Sellers, and Admins (`clerk_id`, `email`, `role`, `password_hash`).
2. `stores`: Multi-vendor stores with Bihar/Indian address, GSTIN, ratings, and sales.
3. `categories`: 18 hierarchical ethnic categories (Women, Men, Kids, Accessories).
4. `products`: Catalog items with generated discount percentages, stock, weight, tags, SKU.
5. `product_variants`: Size (XS to XXL), color, price adjustment, inventory per variant.
6. `orders`: Orders with status tracking, payment methods (COD, Online, UPI), address snapshot.
7. `order_items`: Line items linked to products & variants with frozen purchase price.
8. `cart`: User cart items with variant specification.
9. `wishlist`: Customer favorite ethnic pieces.
10. `reviews`: Verified purchase ratings (1-5 stars) with photos and body.
11. `coupons`: Discount vouchers (percentage/fixed) with `min_order_value` and `max_discount` caps.
12. `notifications`: Real-time user alert feed.
13. `addresses`: Customer shipping addresses with default flag.
14. `settings`: 93 zero-code admin settings for banners, theme, brand, pricing, and toggles.
15. `audit_logs`: Administrative action audit trails with IP and user agent.
16. `login_attempts` & `rate_limits`: Brute-force lockout and IP throttling.

## 4. Key Security & Privacy Measures
- **AES-256-GCM authenticated encryption** for credentials and sensitive data.
- **PII Masking** (`maskPhone`, `maskEmail`) protects customer identities from leakages.
- **Multi-Vendor Tenant Boundary:** Sellers can only read/write their own store's products and orders (`storeId = currentSellerStore.id`).
- **Admin Zero-Code Customization:** Live customization without code changes via `/admin/settings`.
- **Protected Data Wipe:** Clean reset script strictly preserves categories, coupons, settings, audit logs, and admin account.
