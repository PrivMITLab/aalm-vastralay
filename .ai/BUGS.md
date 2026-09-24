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

### Incident 004: React 19 SSR Crash on `/admin/theme` (Error 3000360342)
- **Symptom:** `/admin/theme` threw "This page couldn't load - A server error occurred. ERROR 3000360342".
- **Root Cause:** `src/app/admin/theme/page.tsx` was an `async` Server Component with inline `onChange` event handlers on color inputs (`onChange={(e) => ...}`), which violates React 19 Server Component boundary rules and crashes during SSR.
- **Resolution:** Extracted color inputs, typography preview, and form handling into a dedicated `"use client"` component `src/components/admin/ThemeEditorForm.tsx` with live swatch states and loading indicators.

### Incident 005: Forgot Password Field Name Mismatch ("Passwords do not match")
- **Symptom:** Submitting the OTP and matching new passwords on `/forgot-password` always threw "पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match)".
- **Root Cause:** In `src/components/auth/ForgotPasswordForm.tsx`, the confirm password field was named `<input name="confirmPassword" ... />`, whereas `verifyOtpAndResetPassword` in `src/actions/auth.ts` looked only for `formData.get("confirm")` (which was `null`).
- **Resolution:** Updated `src/actions/auth.ts` to check `formData.get("confirmPassword") ?? formData.get("confirm")`.

### Incident 006: Serverless Read-Only Filesystem Image Upload Failure (`ENOENT`)
- **Symptom:** Uploading images on `/seller/products/new` threw `ENOENT: no such file or directory, mkdir '/var/task/public/uploads'`.
- **Root Cause:** Vercel functions execute in a read-only ephemeral container where `/var/task/public` cannot be written to.
- **Resolution:** Updated `src/lib/uploads.ts` to upload directly to Backblaze B2 via Cloudflare Worker proxy when configured, with a safe Data URI fallback on serverless environments to prevent disk write crashes. Also added store auto-provisioning in `src/app/api/uploads/product/route.ts`.

### Incident 007: Multi-Account Google Drive Link Resolution Failure
- **Symptom:** URLs like `https://drive.google.com/file/u/0/d/...` or `https://drive.google.com/file/u/1/d/...` or `drive.google.com/uc?id=...` were not recognized as valid Google Drive images.
- **Root Cause:** `GDRIVE_URL_REGEX` only searched for `file/d/` and `open?id=`.
- **Resolution:** Expanded regex to `/(?:drive|docs)\.google\.com\/(?:file\/(?:u\/\d+\/)?d\/|(?:open|uc)\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i` in `src/lib/image-resolver.ts`.

### Incident 008: Seller Order Status Update UI Lag / Stale View
- **Symptom:** Clicking the status update button on `/seller/orders` updated the database, but the page displayed old status until manual refresh.
- **Root Cause:** `updateOrderStatus` in `src/actions/seller.ts` lacked `revalidatePath`.
- **Resolution:** Added `revalidatePath("/seller/orders")`, `revalidatePath("/admin/orders")`, and `revalidatePath("/orders/" + orderId)` upon status change.

