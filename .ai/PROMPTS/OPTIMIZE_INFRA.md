# ================================================================
# MASTER OPTIMIZATION PROMPT — NEON + VERCEL + CLERK + B2
# Rakhna kahan hai: .ai/PROMPTS/OPTIMIZE_INFRA.md
# Use karo jab bhi infrastructure, database, auth, ya storage optimize karna ho
# ================================================================

I want to optimize my e-commerce platform for maximum free-tier efficiency and production-grade reliability.

The stack is:
- Database: Neon (PostgreSQL with Drizzle ORM)
- Hosting: Vercel (Edge + Node.js runtimes)
- Auth: Clerk (50,000 MRU free tier)
- Cold Storage: Backblaze B2 (private bucket via Cloudflare Worker)

================================================================
STRICT SAFETY RULES (NEVER BREAK)
================================================================

1. FIRST READ THESE FILES:
   - .ai/RULES.md
   - .ai/CONTEXT.md
   - .ai/ARCHITECTURE.md
   - .ai/DATABASE.md
   - .ai/SECURITY.md
   - src/lib/db/index.ts (database connection)
   - src/middleware.ts (route protection)
   - next.config.ts (Vercel build config)

2. DO NOT DELETE, BREAK, OR REMOVE ANY EXISTING FEATURE.
   - All existing API routes, pages, and components must continue working.
   - No database columns or tables can be dropped.
   - Zero data loss protocol from .ai/DATABASE.md applies.
   - All existing tests in tests/ must continue passing.

3. OPTIMIZATION MUST BE ADDITIVE AND NON-DESTRUCTIVE:
   - Add connection pooling — don't change query logic.
   - Add edge caching — don't break dynamic data.
   - Add lazy loading — don't break SSR for SEO.
   - Add error boundaries — don't swallow errors silently.

================================================================
OPTIMIZATION 1: NEON DATABASE (PostgreSQL)
Goal: Stay in free tier (0.5 GiB storage, 100 CU-hours/month, 20 max connections)
================================================================

1. CONNECTION POOLING (MANDATORY):
   - Always use Neon's POOLED connection string in serverless functions (Vercel).
     Direct connection:   ep-xyz.region.aws.neon.tech (port 5432) — EXHAUSTS CONNECTIONS
     Pooled connection:   ep-xyz-pooler.region.aws.neon.tech (port 5432) — HANDLES 10,000+
   - Verify DATABASE_URL in .env.local uses the -pooler hostname.
   - In src/lib/db/index.ts:
     - Use `@neondatabase/serverless` with WebSocket/HTTP proxy for edge/serverless.
     - Set connection limits: max 1 connection per serverless function instance.
     - Add connection timeout (10 seconds) so hanging queries don't consume CU-hours.
     - Ensure idle connections close quickly (Neon auto-suspends after 5 min of inactivity).
     - NEVER use persistent connection pools (like pg-pool with max: 20) in serverless!

2. QUERY OPTIMIZATION:
   - Always use `db.select({ specific_fields })` instead of `db.select()` (SELECT *).
     Less data transferred = less compute used = less CU consumed.
   - Paginate ALL list queries (products, orders, reviews): LIMIT 20 OFFSET X.
     Never return unbounded result sets (no SELECT without LIMIT).
   - Use `count()` queries efficiently: `SELECT count(id)` not `SELECT count(*)`.
   - Add missing indexes for frequently filtered columns:
     - products: (is_active, category_id, created_at)
     - orders: (user_id, status, created_at)
     - order_items: (order_id)
     - reviews: (product_id, is_approved)
     - addresses: (user_id, is_default)
     - Check: All foreign keys MUST have indexes!
   - Use EXPLAIN ANALYZE on any query taking > 100ms.

3. COLD START MITIGATION:
   - Neon scales to zero after 5 minutes of inactivity (saves free tier compute).
   - First request after suspend takes ~1-2 seconds (cold start).
   - Handle cold starts gracefully:
     - 10-second timeout on DB queries with retry (1 retry, 500ms delay).
     - User sees skeleton UI, not a crash or 504 Gateway Timeout.
     - Health check endpoint (/api/health) can warm up DB if needed.

4. STORAGE MANAGEMENT:
   - Stay under 0.5 GiB:
     - No images/files in database! Only URLs/keys.
     - Regularly prune or archive audit_logs older than 90 days.
     - Delete expired sessions/tokens from rate_limits and login_attempts tables.
     - Run VACUUM periodically (or let Neon autovacuum handle it).

================================================================
OPTIMIZATION 2: VERCEL HOSTING & EDGE
Goal: Stay in free tier (100 GB bandwidth, 1M Edge middleware invocations, 100K serverless executions)
================================================================

1. ROUTING & MIDDLEWARE EFFICIENCY:
   - In src/middleware.ts:
     - EXCLUDE static assets from middleware matcher:
       matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
     - Don't run Clerk auth on purely static or public pages.
     - Keep middleware execution time under 10ms.
     - No database queries inside middleware! Ever.

2. RENDERING STRATEGY:
   - STATIC (SSG / ISR) for high-traffic, slow-changing pages:
     - Homepage: ISR with revalidate: 3600 (1 hour)
     - Category pages: ISR with revalidate: 1800 (30 min)
     - Static pages (about, contact, FAQ, terms, privacy): Pure SSG (generateStaticParams)
   - SERVER-RENDERED (SSR) for dynamic, personalized pages:
     - Cart, Checkout, Account, Order History, Admin panel
   - CLIENT-SIDE for interactive widgets:
     - Search modal, reviews widget, address selector, filter panel

3. IMAGE OPTIMIZATION OFF-LOADING:
   - Vercel Free Tier gives only 1,000 Image Optimization transformations/month!
   - DO NOT let Vercel optimize images. It will exhaust the quota immediately.
   - In next.config.ts:
     images: { unoptimized: true }  // Offload to ImageKit / wsrv.nl / Cloudflare!
   - All image optimization is handled by:
     - ImageKit: /tr:w-800,f-webp,q-80/ (transforms at edge, free 20 GB/month)
     - wsrv.nl: free, unlimited open-source image proxy with WebP conversion
     - Cloudflare Worker: caches transformed images at 300+ edge locations

4. SERVERLESS FUNCTION OPTIMIZATION:
   - Keep function bundle size small (import specific modules, not entire packages).
   - Use Edge runtime (`export const runtime = 'edge'`) for:
     - Health checks (/api/health)
     - Simple redirects
     - Webhook receivers (Clerk, Razorpay, Shiprocket)
     - Read-only cached queries
   - Use Node.js runtime for:
     - Complex business logic (checkout, payment verification)
     - Database writes and transactions
     - Cryptographic operations (AES-256-GCM)

5. CACHING HEADERS (HTTP CACHE-CONTROL):
   - Static pages: `public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200`
   - Product detail: `public, max-age=300, s-maxage=3600, stale-while-revalidate=1800`
   - API read routes: `public, s-maxage=60, stale-while-revalidate=300`
   - Dynamic/User data: `private, no-cache, no-store, must-revalidate`

================================================================
OPTIMIZATION 3: CLERK AUTHENTICATION
Goal: Stay in free tier (50,000 Monthly Active Users / MRU)
================================================================

1. SESSION & TOKEN MANAGEMENT:
   - Free tier gives 50,000 Monthly Active Users (MRU). This is generous, BUT:
     - Each unique user who makes an authenticated request in a month counts as 1 MRU.
     - Bot traffic or crawling protected routes can artificially inflate MRUs!
   - Protect against MRU inflation:
     - Public pages (home, browse, search, product detail) MUST NOT require Clerk auth.
     - Allow guest browsing and guest cart (localStorage).
     - Only require Clerk auth at: Checkout, Account, Wishlist (save), and Admin/Seller.
     - Bots/crawlers get public pages with zero Clerk tokens consumed.

2. CLERK CLIENT-SIDE OPTIMIZATION:
   - Use `<ClerkProvider>` with `telemetry: false` (minor privacy + performance).
   - Don't call `useUser()` or `useAuth()` in components that render on every page 
     unless necessary (like Navbar).
   - In Navbar: Use lightweight auth check, don't fetch full user profile on every render.
   - Cache user role in session token (Clerk custom claims):
     - Add `role` (admin, seller, customer) to Clerk JWT template.
     - Read role from JWT: `auth().sessionClaims?.role` — NO DATABASE QUERY NEEDED!
     - This eliminates 1 DB query on EVERY protected request!

3. WEBHOOKS OVER POLLING:
   - Never poll Clerk API for user status changes.
   - Use Clerk Webhooks:
     - `user.created` -> Insert into local `users` table
     - `user.updated` -> Update local `users` table
     - `user.deleted` -> Soft-delete in local `users` table
   - Local `users` table acts as a read replica — zero Clerk API calls for user data.

================================================================
OPTIMIZATION 4: BACKBLAZE B2 + CLOUDFLARE WORKER (Cold Storage)
Goal: 10 GB free B2 storage + unlimited free Cloudflare bandwidth via Bandwidth Alliance
================================================================

1. BANDWIDTH ALLIANCE (ZERO EGRESS COST):
   - Backblaze B2 + Cloudflare = $0 egress fees (free bandwidth between them).
   - Architecture:
     Client -> Cloudflare Worker -> Backblaze B2 (private bucket)
   - The B2 bucket MUST be PRIVATE (no public read).
   - The Cloudflare Worker signs requests using B2 S3-compatible credentials.

2. CLOUDFLARE WORKER CACHING:
   - Worker must cache B2 responses at the Cloudflare Edge:
     - Static product images: `Cache-Control: public, max-age=31536000, immutable`
     - B2 is only hit ONCE per image across all global requests for 1 year!
     - 10 GB B2 storage can serve millions of page views with zero B2 cost.
   - Worker script requirements:
     - Cache API (`caches.default`) for edge caching.
     - Support WebP conversion if possible, or pass-through to wsrv.nl.
     - Return proper Content-Type, Content-Length, and ETag headers.
     - Handle 404 gracefully (return placeholder or fallback).

3. UPLOAD PIPELINE:
   - Admin/Seller uploads image -> Presigned S3 URL generated by API route:
     POST /api/admin/uploads/presigned-url
     Returns: { uploadUrl, fileKey }
   - Client uploads DIRECTLY to B2 via presigned URL (never through Vercel serverless).
     This saves Vercel bandwidth and avoids 4.5 MB serverless body size limit!
   - Save file key in database as `b2:products/saree-123/front.webp`.
   - Frontend resolves via: `${B2_WORKER_URL}/products/saree-123/front.webp`.

4. STORAGE HYGIENE:
   - Auto-convert images to WebP BEFORE upload (client-side canvas or sharp).
     WebP is 70% smaller than JPEG/PNG = 3x more images in free 10 GB!
   - Max image dimensions: 1600x1600 (products don't need 4K).
   - Target file size: < 200 KB per image, < 50 KB for thumbnails.
   - Delete orphaned images: When product is deleted, queue B2 key for deletion.

================================================================
VERIFICATION CHECKLIST (AFTER OPTIMIZING)
================================================================

1. NEON:
   [ ] DATABASE_URL contains `-pooler` hostname
   [ ] Connection limit configured in db client
   [ ] Idle connection timeout set
   [ ] SELECT * replaced with specific columns in top 5 slowest queries
   [ ] Missing indexes added via migration (zero-loss, IF NOT EXISTS)

2. VERCEL:
   [ ] Static assets excluded from middleware matcher
   [ ] images: { unoptimized: true } in next.config.ts
   [ ] High-traffic pages use ISR / SSG
   [ ] Cache-Control headers set on API routes
   [ ] npm run build succeeds with minimal serverless bundle sizes

3. CLERK:
   [ ] Public pages don't require auth
   [ ] Guest cart works without login
   [ ] Role is stored in Clerk JWT session claims
   [ ] Webhook syncs users to local database

4. B2 + CLOUDFLARE:
   [ ] B2 bucket is private
   [ ] Cloudflare Worker proxies and caches images (Cache-Control: immutable)
   [ ] Client uploads via presigned URLs (bypasses Vercel)
   [ ] Images are WebP format, < 200 KB

5. TEST SUITE:
   [ ] npm test passes (all suites)
   [ ] npm run typecheck passes (0 errors)
   [ ] npm run lint passes (0 warnings)
   [ ] Manual test: Home, Product, Cart, Checkout, Admin all work
