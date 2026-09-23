# 🛠️ AALM VASTRALAY — INFRASTRUCTURE SETUP & OPTIMIZATION GUIDE
# Location: .ai/SETUP.md

---

## 1. NEON DATABASE (PostgreSQL) — FREE TIER OPTIMIZATION

### Region Selection (Mandatory for India Latency)
- **Region:** AWS `ap-south-1` (Mumbai, India).
- **Latency:** ~15–30ms response for domestic shoppers across Bihar, UP, Delhi, Mumbai.

### Connection Pooling Configuration
- Always copy the **Pooled connection string** from Neon Dashboard:
  - Format: `postgresql://user:pass@ep-xxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require`
  - Notice the `-pooler` tag in the hostname.
- **Why?** Direct connections exhaust connections after ~20 queries in serverless; pooled connections multiplex through PgBouncer handling 10,000+ connections effortlessly.

---

## 2. CLERK AUTHENTICATION (50,000 MRU Optimization)

### Session Lifetime Setup (Clerk Dashboard)
1. Navigate to: **Clerk Dashboard > Configure > Sessions**.
2. Set **Session lifetime** to: `30 days` (prevents frequent re-authentications).
3. Set **Inactivity timeout** to: `7 days`.
4. Add custom claims in JWT Template if role-based claims are needed (`role: "{{user.public_metadata.role}}"`) to eliminate database queries for auth checks.

### Networkless JWT Verification
- In Clerk Dashboard > API Keys, copy the **JWT verification public key** (PEM format).
- Add to `.env.local`: `CLERK_JWT_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"`.

### Guest Browsing Policy
- Public pages, search, catalog, and cart require zero authentication.
- Authentication is strictly required only at Checkout and Account areas.

---

## 3. BACKBLAZE B2 + CLOUDFLARE WORKER (Cold Storage)

### Private Bucket Setup
1. Backblaze B2 Console: Create bucket `aalm-vastralay-cold-storage` with Files set to **Private**.
2. Cloudflare Bandwidth Alliance guarantees **$0 egress fees** between B2 and Cloudflare.

### B2 Lifecycle Rules
Set the following rules in B2 Bucket Settings:
- Rule 1: Files with prefix `temp/` delete after `7 days`.
- Rule 2: Files with prefix `archive/` delete after `365 days`.
- Rule 3: Abort incomplete multipart uploads after `7 days`.

### Cloudflare Worker Deployment
- Worker script: `cloudflare-worker/b2-proxy.js` (or `workers/b2-proxy/worker.js`).
- Cache header: `Cache-Control: public, max-age=31536000, immutable`.
- Edge caching eliminates repeated B2 downloads; images are served from Cloudflare's global edge.

---

## 4. DYNAMIC UPI QR & 1-CLICK WHATSAPP COMMERCE

### Dynamic UPI QR (Zero Gateway Fees)
- **Merchant VPA:** `8434061342@upi`
- **Supported Apps:** Google Pay, PhonePe, Paytm, BHIM, and all UPI-compatible bank apps.
- **Features:** 5-minute countdown security timer, live amount encoding, 12-digit UTR verification input, Web Audio confirmation chime.

### WhatsApp Commerce
- **Store WhatsApp:** `+91 84340 61342`
- **Order Confirmations:** Auto-generates pre-filled order confirmation message link for customers.
- **Bridal Consultation:** Direct WhatsApp chat link for lehenga/saree custom stitching measurements.
- **Dispatch Updates:** 1-Click WhatsApp tracking notification for Admin & Sellers.
