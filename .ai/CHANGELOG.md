# 📜 AALM VASTRALAY — PROJECT CHANGELOG
# Location: .ai/CHANGELOG.md

## [2026-09-22] — Enterprise Test Suite & Safe Reset Architecture
### Added
- **7 Automated Enterprise Test Suites (`tests/`):**
  - `tests/encryption.test.ts`: AES-256-GCM authenticated cipher and PII phone/email masking.
  - `tests/commerce.test.ts`: Indian Lakhs/Crores currency formatting, discount math, free shipping calculation.
  - `tests/ethnic-features.test.ts`: 6-digit Indian PIN code regex, ethnic sizing ranking (XS to XXL), order step mapping.
  - `tests/auth-security.test.ts`: Scrypt password salt/hash and role integrity.
  - `tests/coupons-categories.test.ts`: Discount rules (percentage vs fixed), order minimums, max discount caps, and category hierarchies.
  - `tests/seller-privacy-isolation.test.ts`: Multi-vendor isolation verifying sellers cannot alter competitor stores.
  - `tests/admin-customization.test.ts`: All 93 zero-code settings and JSON default parsing safety.
- **Enterprise Neon SQL Script (`scripts/neon-reset.sql`):**
  - Safe clean wipe preserving categories, coupons, settings, audit logs, and admin.
  - Complete 16-table DDL recreate option with default admin, categories, and coupon seeds.
- **Vibe Coding Master Rules & Memory Engine (`.ai/`):**
  - Full `.ai/` directory structure with `RULES.md`, `CONTEXT.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `DECISIONS.md`.
