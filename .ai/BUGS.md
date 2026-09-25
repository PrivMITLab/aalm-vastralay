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

### Incident 009: Missing Active Navigation Highlighting & Tactile Click/Tap Feedback
- **Symptom:** Users could not tell which page was active or whether buttons/links were clicked in the Mobile Bottom Tab Bar, Admin Console sidebar, and Seller Hub. Tapping/clicking gave zero visual feedback, shadows, or color changes.
- **Root Cause:**
  - `MobileTabBar.tsx` was an `async` Server Component, unable to inspect `usePathname()` to highlight active tabs.
  - `AdminLayout` and `SellerLayout` used static navigation links without current path detection.
  - `globals.css` `.btn:active` used a tiny `translateY(1px)` with no scale, tap highlight color, or active shadow feedback.
  - Category activation buttons lacked loading and pending states.
- **Resolution:**
  - Created `src/components/ui/MobileTabBarClient.tsx` featuring `usePathname()` active pill styling (`bg-[color:var(--brand-soft)]/70`), royal/gold color highlight, top indicator bar, and `active:scale-90` tactile tap feedback.
  - Created `src/components/admin/AdminSidebarNav.tsx` and `src/components/seller/SellerSidebarNav.tsx` with gradient highlights, pulsating gold status dots, and `active:scale-[0.97]` click states.
  - Updated `AdminCategoriesPage` to use `SubmitButton` for instant pending indicators ("Adding Category…", "Saving…").
### Incident 010: UPI Payment Auto-Marked as "paid" on Checkout (Fraud Exposure)
- **Symptom:** Customers placing an order with UPI or Online payment had their `paymentStatus` immediately marked as `"paid"` in `src/actions/orders.ts` without any verification of funds received.
- **Root Cause:** Placeholder order creation logic set `paymentStatus: "paid"` on order submission.
- **Resolution:** Updated `paymentStatus` to default to `"pending-verification"` for UPI/Online methods. Added additive `upi_utr` column with strict 12-digit numeric validation (`/^[0-9]{12}$/`). Added server action `verifyUpiPayment` and interactive `<VerifyUpiButton />` in `/admin/orders` so only the administrator can mark the order as paid upon verifying the bank/UPI statement.

### Incident 011: Unmasked PII (Phone & Email) in Public/Admin/Seller Dashboards
- **Symptom:** Mobile numbers and email addresses of customers were shown in plaintext on administrative and vendor lists, creating risk of shoulder surfing, scraping, and accidental leakage.
- **Root Cause:** Lack of a centralized PII masking utility for list views.
- **Resolution:** Built `src/lib/masking.ts` with `maskPhone` (`8434061342` -> `8434****42`) and `maskEmail` (`ram@gmail.com` -> `r**@gmail.com`). Applied masking across `/admin/users`, `/admin/orders`, and `/seller/orders`.

### Incident 012: Heavy Image Payloads & Missing Browser Cache-Control
- **Symptom:** Product and catalog images loaded without compression on mobile networks; static logos and assets re-downloaded on every page visit.
- **Root Cause:** Missing `quality = 70` default in `src/lib/image-resolver.ts` and absent immutable cache headers in `next.config.ts`.
- **Resolution:** Configured `wsrv.nl` free proxy with `quality = 70`, `output = webp`, `fit = cover` reducing payload by >65%. Added 7-day `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` in `next.config.ts`.

### Incident 013: XSS & Internal Error Leakage in Public APIs
- **Symptom:** Query params (`awb`, `courier`, `order`, `pin`) were interpolated raw into the HTML shipping label in `/api/courier/label`; `/api/health` returned database error messages and stack traces in JSON responses.
- **Root Cause:** Absence of HTML entity escaping and unfiltered catch block returning `err.stack`.
- **Resolution:** Implemented `escapeHtml()` in `/api/courier/label/route.ts` to sanitize all dynamic HTML inputs. Suppressed client-side error details in `/api/health` while keeping robust server logging (`console.error`). Added `.replace(/</g, '\\u003c')` to JSON-LD `<Script>` tags in `layout.tsx` and `product/[slug]/page.tsx`.

### Incident 014: Unprotected Public Endpoints & Brute-Force Risk on Bootstrap
- **Symptom:** `/api/bootstrap` used `GET` with raw string equality for token check; `/api/bootstrap`, `/api/search`, and `/api/courier/label` had no rate limiting, leaving Neon connection pools vulnerable to quota exhaustion.
- **Root Cause:** Relying only on DB-backed rate limiting, which burns Neon connection pooler quotas for public bot traffic.
- **Resolution:** Created zero-cost `memoryRateLimit` in `src/lib/rate-limit.ts` with 5-minute memory sweep. Protected `/api/bootstrap` (5 req/min, `crypto.timingSafeEqual`, POST support, `confirm=yes` for demo wipes), `/api/search` (60 req/min), `/api/courier/label` (30 req/min), and `/api/health` (60 req/min).



