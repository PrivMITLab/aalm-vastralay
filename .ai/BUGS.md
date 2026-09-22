# 🐛 AALM VASTRALAY — BUG DEFENSE & INCIDENT REGISTER
# Location: .ai/BUGS.md

## Resolved Issues

### Incident 001: Neon SQL CTE Syntax Error on Partial Copy
- **Symptom:** `ERROR: syntax error at or near "'Accessories'"` when pasting category seeding script in Neon SQL Editor.
- **Root Cause:** The top lines of the query (`INSERT INTO "categories" ...`) were truncated when pasting, leaving only the trailing values tuple.
- **Resolution:** Refactored `scripts/neon-reset.sql` to use direct, standalone `INSERT INTO ... ON CONFLICT ("slug") DO NOTHING` statements with zero CTE dependency.

### Incident 002: Windows Regional Flag Render Bug
- **Symptom:** Windows displays literal letters "IN" instead of an Indian national flag emoji 🇮🇳.
- **Root Cause:** Windows OS does not ship color flag glyphs for regional indicator symbols.
- **Resolution:** Replaced emoji with sharp, luxury SVG `Award` / `Sparkles` icon with tricolor theme badges.

### Incident 003: Accidental Category & Coupon Wiping Concern
- **Symptom:** Risk of losing categories and coupons when clearing demo products.
- **Resolution:** Updated `wipeDemoData()` and Option 1 in `scripts/neon-reset.sql` to strictly protect `categories`, `coupons`, `settings`, `audit_logs`, and admin.
