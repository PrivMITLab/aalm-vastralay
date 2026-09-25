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

### Incident 015: Google Drive & External Image URLs Breaking in Admin Banner Preview
- **Symptom:** Pasting a Google Drive sharing link (`drive.google.com/file/d/.../view?usp=sharing`) in `/admin/banners` rendered a blank / purple box with missing background banner image.
- **Root Cause:**
  1. `/admin/banners` was rendering raw `src={banner.url}` without passing it through `resolveImage()`. Because Google Drive sharing links point to an HTML webpage rather than a raw image stream, the browser `<img />` tag failed to render.
  2. The page was a static Server Component without real-time client-side sync, leaving users with no visual feedback while typing or testing URLs.
  3. `home.announcementText` and `home.marqueeText` were absent from `SETTINGS_FIELDS`, causing them to be ignored on submit.
- **Resolution:**
  1. Built `src/components/admin/BannerEditor.tsx` with live synchronized preview, instant `google-drive-cdn` / `dropbox-raw` indicator badges, and safe `onError` fallback to `/brand/poster.png`.
  2. Implemented `canonicalizeImageUrl` in `src/lib/image-resolver.ts` to automatically convert Google Drive (`/view`, `/uc?id=`, `/file/d/`) into `https://lh3.googleusercontent.com/d/{id}` and normalize Dropbox, GitHub, and OneDrive links.
  3. Built secure SSRF-protected `/api/admin/scrape-image` endpoint with 1-click "Auto-Detect / Scrape" button to extract OpenGraph banners from arbitrary web URLs.
  4. Added `home.announcementText` and `home.marqueeText` to `SETTINGS_FIELDS` under `group: "home"` and enabled `revalidatePath("/admin/banners")`.

### Incident 016: Vercel Function Invocations & Neon Query Spikes on Empty DB
- **Symptom:** Vercel dashboard reported 3,100+ function invocations and high Neon query counts over a 6-hour window even on empty/low-traffic environments.
- **Root Cause:**
  1. `Header.tsx` ran 3 separate database queries for cart count, wishlist count, and unread notifications on every page render even for guest visitors without cookies.
  2. Over 82 server actions executed `revalidatePath("/", "layout")`, indiscriminately purging all server-side caches and forcing every route to re-render.
- **Resolution:**
  1. Wrapped site settings and brand resolution in `unstable_cache` with tag `site-settings` (revalidate 3600).
  2. Consolidated user cart, wishlist, and notification counts into a single combined SQL query, bypassing DB queries completely for guest sessions.
  3. Replaced indiscriminate layout revalidations with targeted `updateTag()` invalidation (`site-settings`, `products`, `categories`, `cart-${userId}`).

### Incident 017: Bot Protection Replay Vulnerability & Inspect-Element Bypass
- **Symptom:** Bots could solve an ALTCHA challenge once and replay the identical payload repeatedly across form endpoints; users could inspect the submit button in DevTools, delete the `disabled` attribute, and submit unverified forms.
- **Root Cause:** PoW verification was stateless with no database store tracking consumed challenges; server actions did not strictly validate that the verified token matched the form action and client IP.
- **Resolution:**
  1. Created `pow_used` table with `ON CONFLICT DO NOTHING` atomic insert and 1-hour background pruning to reject replayed challenges.
  2. Added strict payload binding in `verifySolution` checking action name, challenge age, and IP prefix.
  3. Form actions fail-closed if PoW payload is missing, expired, or invalid.

### Incident 019: Native `<details>` Disclosure Glitch & Mobile Drawer Scroll Lock
- **Symptom:** In desktop header navigation, clicking category tabs rendered an empty/stuck floating box over the hero banner; categories with zero children opened empty focus rings; mobile drawer had nested scroll stutter and touch target issues.
- **Root Cause:**
  1. Desktop categories and account menu used native HTML `<details>`/`<summary>` elements without outside-click dismissal or link-click dismissal handlers.
  2. Categories lacking subcategories rendered as empty `<details>` elements instead of direct navigation links.
  3. Mobile drawer `<aside>` had `overflow-y-auto` while its inner container also had `overflow-y-auto`, creating dual scroll container lockups.
- **Resolution:**
  1. Replaced native `<details>` in `HeaderNav.tsx` with semantic `<Link>` elements for leaf categories and smooth CSS hover/focus dropdowns with outside-click dismissal.
  2. Refactored mobile drawer to `overflow-hidden` on parent `<aside>` and kinetic `overscroll-contain` on the single scrollable view container.
  3. Single-level categories in mobile drawer now render direct navigation links with `ChevronRight`, eliminating dead accordion clicks.
