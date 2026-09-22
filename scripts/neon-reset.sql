-- ==============================================================================
-- 👑 AALM VASTRALAY (आलम वस्त्रालय) — NEON 1-CLICK CLEAN WIPE SCRIPT
-- ==============================================================================
-- यह स्क्रिप्ट Neon SQL Editor में 1-Click में सारा डेमो डेटा (Products, Orders, 
-- Stores, Mock Reviews, Fake Users, और Demo Audit Logs) तुरंत साफ कर देगी।
--
-- 🛡️ क्या सुरक्षित रहेगा (100% Preserved):
--  ✔ categories (आपकी सभी 18 श्रेणियां - साड़ी, लहंगा, कुर्ता, शेरवानी सुरक्षित रहेंगी)
--  ✔ coupons (WELCOME10 आदि कूपन्स सुरक्षित रहेंगे)
--  ✔ settings (बैनर, फोन नंबर, थीम आदि सभी सेटिंग्स सुरक्षित रहेंगी)
--  ✔ Super-Admin (admin@aalmvastralay.com सुरक्षित रहेगा)
-- ==============================================================================

BEGIN;

-- 1. सभी डेमो/टेस्ट टेबल्स को एक साथ CASCADE के साथ खाली (Truncate) करें
TRUNCATE TABLE 
  "order_items",
  "orders",
  "reviews",
  "cart",
  "wishlist",
  "product_variants",
  "products",
  "notifications",
  "addresses",
  "audit_logs",
  "login_attempts",
  "rate_limits",
  "stores"
CASCADE;

-- 2. सुपर एडमिन को छोड़कर बाकी सभी डेमो/फेक यूजर्स (जैसे priya, rajwada आदि) हटाएं
DELETE FROM "users" WHERE "role" != 'admin';

-- 3. सुनिश्चित करें कि सुपर एडमिन अकाउंट 100% एक्टिव रहे (Password: Admin@123)
INSERT INTO "users" ("clerk_id", "email", "full_name", "phone", "role", "password_hash")
VALUES (
  'super_admin_primary',
  'admin@aalmvastralay.com',
  'Aalm Vastralay Administrator',
  '9999999999',
  'admin',
  'd4a9603f905c065f479a81b37ebf5139:41d99908cf8eb4793fdf6c63a5aa1cb9c1ec13efbaee69c2777f98ee09bb7b0f6991ee767c29367ff1cb85cb52fbc9470c184c8a2ce477ad5a24aa76c8c9a59a'
)
ON CONFLICT ("email") DO UPDATE SET "role" = 'admin';

COMMIT;

-- 📊 सत्यापन (Verification): रिजल्ट में देखें कि डेमो डेटा 0 हुआ या नहीं
SELECT 
  (SELECT count(*) FROM "users" WHERE "role" = 'admin') AS live_admins,
  (SELECT count(*) FROM "users" WHERE "role" != 'admin') AS fake_users_left,
  (SELECT count(*) FROM "categories")                   AS preserved_categories,
  (SELECT count(*) FROM "coupons")                      AS preserved_coupons,
  (SELECT count(*) FROM "settings")                     AS preserved_settings,
  (SELECT count(*) FROM "audit_logs")                   AS audit_logs_count,
  (SELECT count(*) FROM "products")                     AS products_count,
  (SELECT count(*) FROM "orders")                       AS orders_count,
  (SELECT count(*) FROM "stores")                       AS stores_count;
