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

## 2. BETTER AUTH & GOOGLE APPS SCRIPT (GAS) EMAIL WEBHOOK
 
### Free Self-Hosted Auth Configuration
1. Authentication engine runs completely self-hosted via Better Auth with Neon PostgreSQL persistence.
2. Zero monthly active user (MRU) caps, zero credit card requirement, zero third-party subscription lock-in.
3. Secure cryptographic session cookies with HMAC SHA-256 verification and timing-safe token checks.
 
### 100% Free Email Webhook via Google Apps Script (GAS)
- Deploy Google Apps Script webhook using your personal/business Gmail account.
- Add to `.env.local`:
  - `GAS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"`
  - `GAS_SECRET_TOKEN="your_random_secret_token"`
- GAS sends password reset OTPs, order updates, and marketing emails with zero third-party fees.
 
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
- **Merchant VPA:** Configurable via `NEXT_PUBLIC_UPI_VPA` in `.env.local` (e.g. `merchant@upi`)
- **Supported Apps:** Google Pay, PhonePe, Paytm, BHIM, and all UPI-compatible bank apps.
- **Features:** 5-minute countdown security timer, live amount encoding, 12-digit UTR verification input, Web Audio confirmation chime.

### WhatsApp Commerce
- **Store WhatsApp:** Configurable via `NEXT_PUBLIC_SUPPORT_PHONE` in `.env.local`
- **Order Confirmations:** Auto-generates pre-filled order confirmation message link for customers.
- **Bridal Consultation:** Direct WhatsApp chat link for lehenga/saree custom stitching measurements.
- **Dispatch Updates:** 1-Click WhatsApp tracking notification for Admin & Sellers.
