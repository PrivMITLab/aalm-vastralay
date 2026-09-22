-- ==============================================================================
-- 👑 AALM VASTRALAY (आलम वस्त्रालय) — NEON SQL RESET SCRIPT
-- ==============================================================================
-- इस स्क्रिप्ट को आप Neon.tech के "SQL Editor" में जाकर सीधे Run कर सकते हैं।
-- 
-- विकल्प 1 (RECOMMENDED): केवल डेमो व टेस्ट डाटा साफ करें (टेबल्स व एडमिन सुरक्षित रहेंगे)
-- विकल्प 2 (NUCLEAR RESET): सब कुछ डिलीट करके शुरू से बिल्कुल नई 16 टेबल्स बनाएं
-- ==============================================================================

-- ==============================================================================
-- 🟢 विकल्प 1 (Option 1): केवल डेमो/फेक डाटा डिलीट करें (CLEAN WIPE)
-- [Run this in Neon SQL Editor to clear all test orders, products, and fake users]
-- ==============================================================================

BEGIN;

-- 1. सभी टेस्ट व डमी रिव्यूज हटाएं
DELETE FROM reviews;

-- 2. सभी टेस्ट ऑर्डर्स और कार्ट हटाएं
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart;
DELETE FROM wishlist;

-- 3. सभी डमी प्रोडक्ट्स और वेरिएंट्स हटाएं
DELETE FROM product_variants;
DELETE FROM products;

-- 4. सभी नोटिफिकेशन्स हटाएं
DELETE FROM notifications;

-- 5. सभी टेस्ट स्टोर्स हटाएं
DELETE FROM stores;

-- 6. सुपर-एडमिन को छोड़कर बाकी सभी टेस्ट कस्टमर व फेक यूजर्स हटाएं
DELETE FROM users WHERE role != 'admin';

-- 7. रेट लिमिट और पुराने लॉग्स साफ करें
DELETE FROM rate_limits;
DELETE FROM login_attempts;

COMMIT;

-- जांचें कि कितने रिकॉर्ड्स बचे हैं (Check remaining counts):
SELECT 
  (SELECT count(*) FROM users) AS remaining_users,
  (SELECT count(*) FROM products) AS remaining_products,
  (SELECT count(*) FROM categories) AS remaining_categories,
  (SELECT count(*) FROM settings) AS remaining_settings;


-- ==============================================================================
-- ⚠️ विकल्प 2 (Option 2): संपूर्ण न्यूक्लियर रीसेट (HARD DROP & RECREATE SCHEMA)
-- [WARNING: इससे सभी टेबल्स ड्रॉप होकर बिल्कुल नई 16 टेबल्स बन जाएंगी]
-- ==============================================================================
/*
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
*/
