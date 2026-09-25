# 🗄️ AALM VASTRALAY — DATABASE & ZERO-LOSS MIGRATION GUIDE
# Location: .ai/DATABASE.md

## 1. Golden Principle: ZERO DATA LOSS ON UPDATES

Jab bhi aap koi naya feature add karte hain ya existing feature update karte hain, **PURANA DATA KABHI BHI DESTROY NAHI HONA CHAHIYE**.

### The 3 Rules of Safe Database Migration:

### Rule 1: "Expand & Contract Pattern" (Additive-Only Changes)
- **KABHI BHI** existing column ko seedhe `RENAME` ya `DROP` na karein.
- **HAMESHA** naya column `ADD COLUMN IF NOT EXISTS ... DEFAULT ...` ke sath add karein:
  ```sql
  -- ✅ SAHI TAREEKA:
  ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fabric_care" text DEFAULT 'Dry Clean Only';
  ```
- Purana code purane columns ko padhta rahega aur naya code naye column ko use karega. Kuchh bhi crash nahi hoga.

### Rule 2: "Non-Destructive Defaults"
- Koi bhi naya column add karte waqt `NOT NULL` bina `DEFAULT` value ke na lagayein:
  - ❌ `ALTER TABLE "orders" ADD COLUMN "gift_wrap" boolean NOT NULL;` -> **Crash! (Purane rows me error aayega)**
  - ✅ `ALTER TABLE "orders" ADD COLUMN "gift_wrap" boolean DEFAULT false NOT NULL;` -> **Safe! (Purane rows me automatically `false` chala jayega)**

### Rule 3: "Soft Deletes instead of Hard Deletes"
- Live e-commerce me kabhi bhi records ko hard `DELETE` na karein agar unka historical connection hai:
  - Product delete hone par: `UPDATE products SET is_active = false WHERE id = ...;`
  - User disable hone par: `UPDATE users SET is_active = false WHERE id = ...;`
  - Isse purane orders, invoices, aur financial reports hamesha intact rahenge.

---

## 2. Table Catalog (All 17 Tables)

| Table | Purpose | Primary Key | Foreign Keys |
|---|---|---|---|
| `users` | Customer, Seller, and Admin accounts | UUID | — |
| `stores` | Multi-vendor seller storefronts | UUID | `owner_id -> users.id` |
| `categories` | Ethnic categories & subcategories | UUID | `parent_id -> categories.id` |
| `products` | Ethnic wear apparel listings | UUID | `store_id -> stores.id`, `category_id -> categories.id` |
| `product_variants`| Sizing (XS-XXL) & color inventory | UUID | `product_id -> products.id` |
| `orders` | Customer purchases & statuses | UUID | `customer_id -> users.id`, `store_id -> stores.id` |
| `order_items` | Products within an order | UUID | `order_id -> orders.id`, `product_id -> products.id` |
| `cart` | Shopping cart items | UUID | `user_id -> users.id`, `product_id -> products.id` |
| `wishlist` | Saved favorite products | UUID | `user_id -> users.id`, `product_id -> products.id` |
| `reviews` | Customer ratings & photos | UUID | `product_id -> products.id`, `user_id -> users.id` |
| `coupons` | Promo codes & discounts | UUID | — |
| `notifications` | User alerts feed | UUID | `user_id -> users.id` |
| `addresses` | Customer delivery locations | UUID | `user_id -> users.id` |
| `settings` | Zero-code site customizations | Text (key) | `updated_by -> users.id` |
| `audit_logs` | Admin action trail | UUID | `actor_id -> users.id` |
| `login_attempts` | Brute force defense logs | UUID | — |
| `rate_limits` | IP request throttling | Text (key) | — |
| `pow_used` | Single-use PoW anti-replay challenge store | Text (`challenge_hash`) | — |

---

## 3. Safe Clean Reset Rule (Demo Data Only)

Jab bhi database me se testing/demo data clean karna ho, **Option 1 (Safe Clean Wipe)** hi chalana chahiye:
- **Clean hone wali tables:** `reviews`, `order_items`, `orders`, `cart`, `wishlist`, `product_variants`, `products`, `stores`, `users WHERE role != 'admin'`.
- **KABHI BHI DELETE NA HONE WALI TABLES (100% PRESERVED):**
  - `categories` (Saree, Lehenga, Kurta, etc.)
  - `coupons` (WELCOME10, FESTIVE, etc.)
  - `settings` (Banners, UPI, Phone, Theme, Colors)
  - `audit_logs` (Security & admin audit trail)
  - `users WHERE role = 'admin'` (Super Admin account)

---

## 4. Recent Zero-Loss Additive Migrations
1. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;` (Webhook soft-delete support)
2. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp" text;`
3. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp_expires_at" timestamp with time zone;`
4. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "upi_utr" text;`
5. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotency_key" text;`
6. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone;`
7. `CREATE INDEX IF NOT EXISTS "idx_products_fts" ON "products" USING gin (to_tsvector('english', "title" || ' ' || coalesce("description", '')));` (Full-text search)
8. `CREATE TABLE IF NOT EXISTS "push_subscriptions" (...);`
9. `CREATE TABLE IF NOT EXISTS "pow_used" ("challenge_hash" text PRIMARY KEY, "used_at" timestamptz DEFAULT now() NOT NULL);`
10. `CREATE INDEX IF NOT EXISTS "idx_pow_used_at" ON "pow_used" ("used_at");`

