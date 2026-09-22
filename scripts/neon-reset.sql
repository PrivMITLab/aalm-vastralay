-- ==============================================================================
-- 👑 AALM VASTRALAY (आलम वस्त्रालय) — ENTERPRISE NEON SQL SCRIPT
-- ==============================================================================
-- इस SQL स्क्रिप्ट को आप Neon.tech के "SQL Editor" में पेस्ट करके सीधे Run कर सकते हैं।
--
-- 🟢 विकल्प 1 (RECOMMENDED / अनुशंसित): केवल डेमो/टेस्ट डेटा साफ करें।
--    * कैटेगरीज (Categories), कूपन्स (Coupons), सेटिंग्स (Settings), और 
--      एडमिन अकाउंट (Admin User) 100% सुरक्षित रहेंगे, कुछ भी डिलीट नहीं होगा!
--
-- ⚠️ विकल्प 2 (NUCLEAR REBUILD / संपूर्ण रीक्रिएशन):
--    * अगर डेटाबेस को बिल्कुल शून्य से नया बनाना हो, तो सभी 16 टेबल्स को 
--      ड्रॉप करके तुरंत सही DDL, इंडेक्स, और डिफ़ॉल्ट कैटेगरीज/कूपन्स के साथ बना देगा।
-- ==============================================================================


-- ==============================================================================
-- 🟢 विकल्प 1: सुरक्षित डेमो डेटा सफाई (SAFE CLEAN WIPE)
-- नीचे दिए गए ब्लॉक को कॉपी करें और Neon SQL Editor में रन करें:
-- ==============================================================================

BEGIN;

-- 1. सभी टेस्ट व डमी रिव्यूज हटाएं
DELETE FROM "reviews";

-- 2. सभी टेस्ट ऑर्डर्स, ऑर्डर आइटम्स, कार्ट और विशलिस्ट हटाएं
DELETE FROM "order_items";
DELETE FROM "orders";
DELETE FROM "cart";
DELETE FROM "wishlist";

-- 3. सभी डमी प्रोडक्ट्स और वेरिएंट्स हटाएं
DELETE FROM "product_variants";
DELETE FROM "products";

-- 4. सभी टेस्ट नोटिफिकेशन्स हटाएं
DELETE FROM "notifications";

-- 5. सभी टेस्ट वेंडर्स/सेलर स्टोर्स हटाएं
DELETE FROM "stores";

-- 6. सभी नॉन-एडमिन टेस्ट/फेक यूजर्स हटाएं (सुपर एडमिन हमेशा सुरक्षित रहेगा)
DELETE FROM "users" WHERE "role" != 'admin';

-- 7. रेट लिमिट और अस्थायी लॉगिन अटेम्पट्स साफ करें
DELETE FROM "rate_limits";
DELETE FROM "login_attempts";

-- 🛡️ ध्यान दें (STRICT SAFETY GUARANTEE):
-- निम्नलिखित टेबल्स को इस स्क्रिप्ट में कभी भी डिलीट नहीं किया जाता है:
--  ✔ "categories"  -> सभी साड़ी, सूट, लहंगा, शेरवानी कैटेगरीज सुरक्षित हैं
--  ✔ "coupons"     -> 'WELCOME10' आदि सभी डिस्काउंट कूपन सुरक्षित हैं
--  ✔ "settings"    -> बैनर, फोन, कलर, UPI आदि सभी एडमिन सेटिंग्स सुरक्षित हैं
--  ✔ "audit_logs"  -> सुरक्षा व ऑडिट ट्रेल्स सुरक्षित हैं
--  ✔ "users"       -> एडमिन यूजर (role = 'admin') सुरक्षित है

COMMIT;

-- सफाई के बाद लाइव डेटाबेस का स्टेटस जांचें:
SELECT 
  (SELECT count(*) FROM "users" WHERE "role" = 'admin') AS live_admins,
  (SELECT count(*) FROM "categories")                   AS preserved_categories,
  (SELECT count(*) FROM "coupons")                      AS preserved_coupons,
  (SELECT count(*) FROM "settings")                     AS preserved_settings,
  (SELECT count(*) FROM "audit_logs")                   AS preserved_audit_logs,
  (SELECT count(*) FROM "products")                     AS wiped_products_count,
  (SELECT count(*) FROM "orders")                       AS wiped_orders_count;



-- ==============================================================================
-- ⚠️ विकल्प 2: संपूर्ण न्यूक्लियर रीसेट व रीक्रिएशन (NUCLEAR REBUILD & SEED)
-- यदि आप सभी टेबल्स को डिलीट करके बिल्कुल नई 16 टेबल्स + डिफॉल्ट डेटा बनाना चाहते हैं,
-- तो केवल तभी नीचे दिए गए पूरे ब्लॉक को Neon SQL Editor में रन करें:
-- ==============================================================================
/*

BEGIN;

-- 1. सभी पुरानी टेबल्स ड्रॉप करें (CASCADE के साथ सुरक्षित तरीके से)
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "cart" CASCADE;
DROP TABLE IF EXISTS "wishlist" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "stores" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "login_attempts" CASCADE;
DROP TABLE IF EXISTS "rate_limits" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 2. बिल्कुल नई 16 एंटरप्राइज टेबल्स का निर्माण करें
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clerk_id" text NOT NULL UNIQUE,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "phone" text,
  "role" text DEFAULT 'customer' NOT NULL,
  "avatar_url" text,
  "password_hash" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_role_check" CHECK ("role" IN ('customer','seller','admin'))
);

CREATE TABLE "stores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "store_name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "logo_url" text,
  "banner_url" text,
  "address" text,
  "city" text,
  "state" text,
  "pincode" text,
  "gst_number" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "rating" numeric(3, 2) DEFAULT 0,
  "total_sales" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "parent_id" uuid REFERENCES "categories"("id"),
  "icon_url" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "store_id" uuid REFERENCES "stores"("id") ON DELETE CASCADE,
  "category_id" uuid REFERENCES "categories"("id"),
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "price" numeric(10, 2) NOT NULL,
  "mrp" numeric(10, 2),
  "discount_percent" numeric(5, 2) GENERATED ALWAYS AS (CASE WHEN mrp > price THEN ((mrp - price) / mrp * 100) ELSE 0 END) STORED,
  "stock" integer DEFAULT 0 NOT NULL,
  "shipping_weight_grams" integer DEFAULT 0 NOT NULL,
  "sku" text UNIQUE,
  "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "video_url" text,
  "tags" text[],
  "is_active" boolean DEFAULT true NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "rating" numeric(3, 2) DEFAULT 0,
  "total_reviews" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "product_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "size" text,
  "color" text,
  "price_adjustment" numeric(10, 2) DEFAULT 0 NOT NULL,
  "stock" integer DEFAULT 0 NOT NULL,
  "sku" text UNIQUE
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_number" text NOT NULL UNIQUE,
  "customer_id" uuid REFERENCES "users"("id"),
  "store_id" uuid REFERENCES "stores"("id"),
  "status" text DEFAULT 'pending' NOT NULL,
  "payment_method" text,
  "payment_status" text DEFAULT 'pending' NOT NULL,
  "subtotal" numeric(10, 2) NOT NULL,
  "shipping_fee" numeric(10, 2) DEFAULT 0 NOT NULL,
  "total" numeric(10, 2) NOT NULL,
  "shipping_address" jsonb NOT NULL,
  "tracking_number" text,
  "courier" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "orders_status_check" CHECK ("status" IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  CONSTRAINT "orders_payment_method_check" CHECK ("payment_method" IN ('cod','online','upi'))
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" uuid REFERENCES "products"("id"),
  "variant_id" uuid REFERENCES "product_variants"("id"),
  "quantity" integer NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "total" numeric(10, 2) NOT NULL
);

CREATE TABLE "cart" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "variant_id" uuid REFERENCES "product_variants"("id"),
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "cart_user_product_variant_unique" UNIQUE("user_id","product_id","variant_id")
);

CREATE TABLE "wishlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "wishlist_user_product_unique" UNIQUE("user_id","product_id")
);

CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
  "user_id" uuid REFERENCES "users"("id"),
  "order_id" uuid REFERENCES "orders"("id"),
  "rating" integer NOT NULL,
  "title" text,
  "body" text,
  "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE TABLE "coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL UNIQUE,
  "discount_type" text NOT NULL,
  "discount_value" numeric(10, 2) NOT NULL,
  "min_order_value" numeric(10, 2) DEFAULT 0 NOT NULL,
  "max_discount" numeric(10, 2),
  "usage_limit" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "valid_from" timestamp with time zone,
  "valid_until" timestamp with time zone,
  "is_active" boolean DEFAULT true NOT NULL,
  CONSTRAINT "coupons_discount_type_check" CHECK ("discount_type" IN ('percentage','fixed'))
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "body" text,
  "data" jsonb,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
  "label" text DEFAULT 'Home' NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "address_line" text NOT NULL,
  "landmark" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "pincode" text NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text,
  "group" text DEFAULT 'general' NOT NULL,
  "label" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "actor_email" text,
  "action" text NOT NULL,
  "target" text,
  "detail" text,
  "ip" text,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "login_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "identifier" text NOT NULL,
  "ip" text,
  "success" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "rate_limits" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "window_start" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. परफॉर्मेंस इंडेक्सेस बनाएं
CREATE INDEX "idx_addresses_user" ON "addresses" ("user_id");
CREATE INDEX "idx_audit_created" ON "audit_logs" ("created_at");
CREATE INDEX "idx_audit_actor" ON "audit_logs" ("actor_id");
CREATE INDEX "idx_cart_user" ON "cart" ("user_id");
CREATE INDEX "idx_login_attempt_identifier" ON "login_attempts" ("identifier","created_at");
CREATE INDEX "idx_orders_customer" ON "orders" ("customer_id");
CREATE INDEX "idx_orders_store" ON "orders" ("store_id");
CREATE INDEX "idx_orders_status" ON "orders" ("status");
CREATE INDEX "idx_products_store" ON "products" ("store_id");
CREATE INDEX "idx_products_category" ON "products" ("category_id");
CREATE INDEX "idx_products_active" ON "products" ("is_active") WHERE is_active = true;
CREATE INDEX "idx_reviews_product" ON "reviews" ("product_id");

-- 4. डिफ़ॉल्ट सुपर एडमिन अकाउंट बनाएं (Admin@123)
INSERT INTO "users" ("clerk_id", "email", "full_name", "phone", "role", "password_hash")
VALUES (
  'super_admin_primary',
  'admin@aalmvastralay.com',
  'Aalm Vastralay Administrator',
  '9999999999',
  'admin',
  'd4a9603f905c065f479a81b37ebf5139:41d99908cf8eb4793fdf6c63a5aa1cb9c1ec13efbaee69c2777f98ee09bb7b0f6991ee767c29367ff1cb85cb52fbc9470c184c8a2ce477ad5a24aa76c8c9a59a'
)
ON CONFLICT ("email") DO NOTHING;

-- 5. भारतीय पारंपरिक परिधान कैटेगरीज (Indian Ethnic Wear Categories)
-- (क) मुख्य श्रेणियां (Main Parent Categories)
INSERT INTO "categories" ("name", "slug", "sort_order")
VALUES 
  ('Women''s Ethnic', 'women', 1),
  ('Men''s Ethnic', 'men', 2),
  ('Kids Ethnic', 'kids', 3),
  ('Accessories', 'accessories', 4)
ON CONFLICT ("slug") DO NOTHING;

-- (ख) उप-श्रेणियां (Sub Categories)
INSERT INTO "categories" ("name", "slug", "parent_id", "sort_order")
SELECT c.name, c.slug, p.id, c.sort_order
FROM (
  VALUES
    ('Lehengas', 'lehengas', 'women', 1),
    ('Sarees', 'sarees', 'women', 2),
    ('Anarkali Suits', 'anarkali-suits', 'women', 3),
    ('Salwar Kameez', 'salwar-kameez', 'women', 4),
    ('Gowns', 'gowns', 'women', 5),
    ('Sherwanis', 'sherwanis', 'men', 1),
    ('Kurta Sets', 'kurta-sets', 'men', 2),
    ('Nehru Jackets', 'nehru-jackets', 'men', 3),
    ('Indo-Western', 'indo-western', 'men', 4),
    ('Girls Ethnic', 'girls-ethnic', 'kids', 1),
    ('Boys Ethnic', 'boys-ethnic', 'kids', 2),
    ('Dupattas', 'dupattas', 'accessories', 1),
    ('Jewellery', 'jewellery', 'accessories', 2),
    ('Juttis & Mojaris', 'footwear', 'accessories', 3)
) AS c(name, slug, parent_slug, sort_order)
JOIN "categories" p ON p.slug = c.parent_slug
ON CONFLICT ("slug") DO NOTHING;

-- 6. डिफ़ॉल्ट आधिकारिक कूपन
INSERT INTO "coupons" ("code", "discount_type", "discount_value", "min_order_value", "max_discount", "is_active")
VALUES 
  ('WELCOME10', 'percentage', 10, 999, 500, true),
  ('FESTIVE50', 'fixed', 500, 2999, 500, true)
ON CONFLICT ("code") DO NOTHING;

COMMIT;

-- सत्यापन करें:
SELECT 
  (SELECT count(*) FROM "users" WHERE "role" = 'admin') AS admins_created,
  (SELECT count(*) FROM "categories")                   AS categories_created,
  (SELECT count(*) FROM "coupons")                      AS coupons_created;

*/
