import { config } from "dotenv";
import { Pool } from "pg";
config();
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("DATABASE_URL not set"); process.exit(1); }
const pool = new Pool({ connectionString: dbUrl });

const SETTINGS_DEFAULTS: Array<[string, string, string, string]> = [
  ["site.name", "Aalm Vastralay", "brand", "Site name"],
  ["site.tagline", "India's zero-commission marketplace for wedding & ethnic wear", "brand", "Tagline"],
  ["site.logoText", "AV", "brand", "Logo monogram"],
  ["theme.defaultMode", "system", "theme", "Default colour mode"],
  ["theme.allowUserToggle", "true", "theme", "Show dark-mode switch"],
  ["theme.primary", "#4A148C", "theme", "Primary brand colour"],
  ["theme.primaryLight", "#6A1B9A", "theme", "Primary (dark mode)"],
  ["theme.accent", "#D4AF37", "theme", "Accent / gold colour"],
  ["theme.accentLight", "#E6CA65", "theme", "Accent (dark mode)"],
  ["theme.bgLight", "#FAF9F6", "theme", "Light background"],
  ["theme.bgDark", "#12100f", "theme", "Dark background"],
  ["theme.surfaceDark", "#1c1917", "theme", "Dark surface / cards"],
  ["theme.radius", "1rem", "theme", "Corner radius"],
  ["theme.fontDisplay", "Georgia, \"Times New Roman\", serif", "theme", "Display font stack"],
  ["theme.density", "comfortable", "theme", "Layout density"],
  ["security.botProtection", "pow", "security", "Bot protection"],
  ["security.powDifficulty", "3", "security", "Proof-of-work weight (leading zeros)"],
  ["security.powMaxIterations", "100000", "security", "Max iterations offered to clients"],
  ["security.formRateLimit", "8", "security", "Form submissions per minute / IP"],
  ["security.authRateLimit", "10", "security", "Sign-in attempts per 10 minutes / IP"],
  ["security.apiRateLimit", "120", "security", "API requests per minute / IP"],
  ["security.lockThreshold", "6", "security", "Failed logins before lockout"],
  ["security.lockMinutes", "15", "security", "Lockout duration"],
  ["security.sessionDays", "30", "security", "Session lifetime"],
  ["security.requireStrongPassword", "true", "security", "Require strong passwords"],
  ["security.trustProxyHeaders", "true", "security", "Trust proxy IP headers"],
  ["products.pageSize", "24", "commerce", "Products per page"],
  ["products.defaultSort", "relevance", "commerce", "Default catalogue sorting"],
];

async function main() {
  let inserted = 0;
  for (const [key, value, group, label] of SETTINGS_DEFAULTS) {
    const r = await pool.query(
      `INSERT INTO settings (key, value, "group", label, updated_at) VALUES ($1,$2,$3,$4, NOW())
       ON CONFLICT (key) DO NOTHING`, [key, value, group, label]);
    if (r.rowCount && r.rowCount > 0) inserted++;
  }
  await pool.query(`UPDATE products SET shipping_weight_grams = 2800 WHERE shipping_weight_grams = 0 AND category_id IN (SELECT id FROM categories WHERE slug = 'lehengas')`);
  await pool.query(`UPDATE products SET shipping_weight_grams = 900 WHERE shipping_weight_grams = 0 AND category_id IN (SELECT id FROM categories WHERE slug = 'sarees')`);
  await pool.query(`UPDATE products SET shipping_weight_grams = 2000 WHERE shipping_weight_grams = 0 AND category_id IN (SELECT id FROM categories WHERE slug = 'sherwanis')`);
  await pool.query(`UPDATE products SET shipping_weight_grams = 800 WHERE shipping_weight_grams = 0`);
  console.log(`[db:bootstrap] OK · ${inserted} setting(s) added`);
  await pool.end();
}
main().catch((err) => { console.error(err); process.exit(1); });
