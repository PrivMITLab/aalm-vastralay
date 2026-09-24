# 👑 AALM VASTRALAY (आलम वस्त्रालय) — MASTER DEVELOPER & OPERATIONS MANUAL
# Version: 3.5.0-Enterprise · Target: Production & Staging Environments
# File Location: docs/MASTER_DEVELOPER_GUIDE.md

---

## 📖 Table of Contents
1. [🌟 Executive Platform Architecture & Multi-Cloud Topology](#1-architecture)
2. [🔑 Complete Environment Variables Reference (.env Master Blueprint)](#2-env-reference)
3. [🔐 Cryptographic Key Generation (32-Byte Hex Secrets)](#3-key-generation)
4. [☁️ Cloud Services Deployment Guide (Step-by-Step)](#4-deployment-guide)
   - 4.1 [Vercel (Frontend & Server Actions Engine)](#41-vercel)
   - 4.2 [Neon Serverless PostgreSQL (Database Engine)](#42-neon)
   - 4.3 [Cloudflare Worker & Backblaze B2 (Media Streaming & CDN Proxy)](#43-cloudflare-b2)
   - 4.4 [Google Apps Script (Zero-Cost Transactional OTP & Email Engine)](#44-gas-email)
   - 4.5 [ImageKit CDN & WSRV.nl Image Acceleration](#45-image-cdn)
5. [📱 Live Route Map & Visual UI Inspection Catalog (Kaha Kya Dikhega)](#5-route-catalog)
   - 5.1 [Homepage (`/`)](#51-homepage)
   - 5.2 [Catalog & Product Detail Pages (`/products`, `/products/[slug]`)](#52-catalog)
   - 5.3 [Cart & Checkout Funnel (`/cart`, `/checkout`)](#53-checkout)
   - 5.4 [Order Tracking & Lifecycle Management (`/track`, `/orders/[id]`)](#54-tracking)
   - 5.5 [Hassle-Free Returns & Reverse Logistics (`/returns`, `/orders/[id]/return`)](#55-returns)
   - 5.6 [Seller Multi-Vendor Portal (`/seller`, `/seller/dashboard`)](#56-seller)
   - 5.7 [Admin Command Center & Zero-Code Customizer (`/admin`, `/admin/settings`)](#57-admin)
   - 5.8 [Social OpenGraph Red Card & Browser Favicon](#58-social-brand)
   - 5.9 [Statutory Legal Pages (`/privacy`, `/terms`, `/returns`, `/cookies`)](#59-legal)
6. [🧪 Developer Verification & Feature Testing Runbook (Feature Check Matrix)](#6-testing-runbook)
   - 6.1 [Automated CLI Test Suites (`npm test`, `typecheck`, `lint`)](#61-cli-tests)
   - 6.2 [Diagnostic & Healthcheck Endpoints](#62-endpoints)
   - 6.3 [Manual End-to-End (E2E) 10-Feature Verification Matrix](#63-e2e-matrix)
7. [🛠️ Troubleshooting, Edge Cases & Operational Runbook](#7-troubleshooting)

---

<a id="1-architecture"></a>
## 1. 🌟 Executive Platform Architecture & Multi-Cloud Topology

Aalm Vastralay (आलम वस्त्रालय) is architected as an **Ultra-Resilient, Zero-Maintenance, High-Throughput Indian Ethnic Marketplace**. To eliminate single points of failure and keep infrastructure operating costs near **$0/month** until scaling into tens of thousands of orders, the platform delegates responsibilities across specialized, best-of-breed serverless providers:

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                CUSTOMER BROWSER / MOBILE APP           │
                                    └───────────────┬────────────────────────┬───────────────┘
                                                    │                        │
                             HTTP Requests / Pages  │                        │ Direct Image Streaming
                                                    ▼                        ▼
                       ┌────────────────────────────────────────┐   ┌────────────────────────────────┐
                       │             VERCEL EDGE CDN            │   │      CLOUDFLARE WORKER         │
                       │   (Next.js 15 App Router Frontend,     │   │   (b2-proxy at edge PoPs)      │
                       │    Server Actions, API Endpoints)      │   │   - $0 Bandwidth Alliance      │
                       └──────┬────────────┬─────────────┬──────┘   │   - 1-Year Cache-Control       │
                              │            │             │          └───────────────┬────────────────┘
          SQL Transactions    │            │             │                          │
          (Connection Pooled) │            │ Dispatch    │ Direct Media Upload      │ Authorized
                              ▼            │ Emails      │ Token Negotiation        │ Read Stream
        ┌───────────────────────────┐      │             ▼                          ▼
        │   NEON POSTGRESQL (AWS)   │      │   ┌──────────────────┐   ┌──────────────────────────────┐
        │   Region: ap-south-1      │      │   │  IMAGEKIT / B2   │   │     BACKBLAZE B2 BUCKET      │
        │   - 0-loss Migrations     │      │   │  Media Optimizer │   │   (Private Cold Storage)     │
        │   - PgBouncer Pooling     │      │   └──────────────────┘   └──────────────────────────────┘
        └───────────────────────────┘      ▼
                               ┌──────────────────────┐
                               │  GOOGLE APPS SCRIPT  │
                               │  Zero-Cost Email OTP │
                               └──────────────────────┘
```

### Architectural Responsibilities:
1. **Frontend & Application Tier (Vercel):** Next.js 15 App Router with React Server Components (RSC), Turbopack, Dynamic OpenGraph Image Generation, Server Actions for mutations, and Edge middleware for role-based route security.
2. **Data Tier (Neon Serverless PostgreSQL):** Relational ACID storage hosted in **Mumbai (`ap-south-1`)** for <15ms round-trip latency across India. Uses PgBouncer connection pooling to absorb concurrent spikes during festive flash sales.
3. **Media Streaming Tier (Cloudflare Worker + Backblaze B2):** High-resolution ethnic apparel images (often 5MB–15MB RAW) are stored in Backblaze B2 private buckets. Cloudflare Worker proxies and caches them across 300+ edge locations with **$0 egress fees** via the Cloudflare Bandwidth Alliance.
4. **Notification Tier (Google Apps Script):** Custom Gmail API relay script for 100% free transactional OTPs, order placement receipts, and password reset links without requiring expensive third-party mail servers (SendGrid, Resend, or AWS SES).
5. **Logistics Integration Tier:** Indian PIN code circle resolver, Shiprocket, and Delhivery courier APIs for automated AWB generation, shipping label PDF creation, and live tracking.

---

<a id="2-env-reference"></a>
## 2. 🔑 Complete Environment Variables Reference (.env Master Blueprint)

The platform requires specific environment variables to function correctly in development, staging, and production. Below is the exhaustive reference mapping every single variable, its criticality, purpose, and where to acquire it.

| Variable Name | Criticality | Category | Example Value | Description & Source |
| :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | 🔴 **MANDATORY** | Database | `postgresql://neondb_owner:pass@ep-xyz-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require` | Connection pooled connection string from [neon.tech](https://neon.tech). Must contain `-pooler` host and `sslmode=require`. |
| `AUTH_SECRET` | 🔴 **MANDATORY** | Security | `e4f2b1a8...` (64-char hex) | 32-byte cryptographically secure random key for JWT signing and session cookie encryption. |
| `ENCRYPTION_SECRET`| 🔴 **MANDATORY** | Security | `8c3d7e1f...` (64-char hex) | 32-byte hex key for AES-256-GCM encryption of customer PII, phone numbers, and seller bank details. |
| `POW_SECRET` | 🔴 **MANDATORY** | Security | `aalm_pow_shield_prod_2026` | Secret salt for proof-of-work challenge generation to defeat DDoS and credential stuffing bots. |
| `NEXT_PUBLIC_SITE_URL` | 🔴 **MANDATORY** | Domain | `https://aalm-vastralay.vercel.app` | Canonical domain used for generating absolute URLs, OpenGraph previews, and sitemap generation. |
| `ADMIN_EMAIL` | 🔴 **MANDATORY** | Super Admin | `admin@aalmvastralay.com` | Email address of the platform owner with root administrative permissions. |
| `ADMIN_PASSWORD` | 🔴 **MANDATORY** | Super Admin | `Ch@ngeMeInProd2026!` | Initial password for the super admin account (auto-hashed using scrypt during bootstrap). |
| `BOOTSTRAP_TOKEN` | 🟡 **RECOMMENDED**| Setup | `aalm_boot_9f7c2b4e8a1d6e3f` | Secret token required to trigger one-time database schema migration at `/api/bootstrap`. |
| `SKIP_SEED` | 🟢 **OPTIONAL** | Setup | `true` | When set to `true`, disables mock dummy data seeding in production so the database remains pristine. |
| `COOKIE_SECURE` | 🟡 **RECOMMENDED**| Security | `true` | Enforces `SameSite=Lax; Secure; HttpOnly` on session cookies in HTTPS environments. |
| `NEXT_PUBLIC_USE_WSRV` | 🟢 **OPTIONAL** | Media | `true` | Automatically routes external and uncompressed product images through `wsrv.nl` WebP accelerator. |
| `GAS_EMAIL_URL` | 🟡 **RECOMMENDED**| Email | `https://script.google.com/macros/s/AKfycb.../exec` | Web app URL generated after deploying the Google Apps Script email relay. |
| `GAS_SECRET_TOKEN`| 🟡 **RECOMMENDED**| Email | `aalm_gas_token_secure_99` | Shared authentication secret sent in headers to prevent unauthorized access to your email relay. |
| `NEXT_PUBLIC_B2_WORKER_URL`| 🟢 **OPTIONAL** | Media CDN | `https://aalm-b2-proxy.workers.dev` | Live URL of the deployed Cloudflare Worker proxying Backblaze B2 private bucket storage. |
| `B2_KEY_ID` | 🟢 **OPTIONAL** | Media CDN | `005abc123...` | Backblaze B2 Application Key ID (used by B2 direct uploader and Cloudflare worker). |
| `B2_APP_KEY` | 🟢 **OPTIONAL** | Media CDN | `K005xyz789...` | Backblaze B2 Application Master Secret Key. |
| `B2_BUCKET_NAME` | 🟢 **OPTIONAL** | Media CDN | `aalm-vastralay-cold-storage` | Exact name of the Backblaze B2 bucket storing assets. |
| `B2_BUCKET_ID` | 🟢 **OPTIONAL** | Media CDN | `4a7b9c...` | Internal ID of the Backblaze B2 storage bucket. |
| `NEXT_PUBLIC_IMAGEKIT_URL` | 🟢 **OPTIONAL** | Media CDN | `https://ik.imagekit.io/aalmvastralay` | ImageKit endpoint URL for real-time face-centering and crop transformations. |
| `IMAGEKIT_PRIVATE_KEY` | 🟢 **OPTIONAL** | Media CDN | `private_abc...` | ImageKit private key for generating secure signed upload presigns. |
| `SHIPROCKET_EMAIL`| 🟢 **OPTIONAL** | Courier | `logistics@aalmvastralay.com` | Shiprocket account email for automated dispatch, manifest generation, and Delhivery pickup. |
| `SHIPROCKET_PASSWORD`| 🟢 **OPTIONAL** | Courier | `ShipRocketProdPassword!` | Shiprocket account password used to negotiate temporary 24-hour bearer tokens. |

---

<a id="3-key-generation"></a>
## 3. 🔐 Cryptographic Key Generation (32-Byte Hex Secrets)

The marketplace enforces **enterprise-grade cryptography** (scrypt password hashing with unique salts, AES-256-GCM authenticated encryption for sensitive PII, and SHA-256 JWT signatures). 

> [!CAUTION]
> Never use weak, predictable passwords or generic strings like `123456` or `secret` for `AUTH_SECRET` or `ENCRYPTION_SECRET`. Doing so leaves session cookies and encrypted customer records vulnerable.

### Generation Commands (Choose any method):

#### Method A: Using Node.js (Recommended for any terminal / OS)
Run this single-line command in your PowerShell or bash terminal:
```bash
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('BOOTSTRAP_TOKEN=aalm_boot_' + require('crypto').randomBytes(16).toString('hex'))"
```

#### Method B: Using OpenSSL (Linux / macOS / Git Bash)
```bash
openssl rand -hex 32
```

#### Method C: Using Windows PowerShell Native Cryptography
```powershell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [BitConverter]::ToString($bytes) -replace '-',''
```

Each generated key will look like a 64-character hexadecimal string, e.g.:
`d9c5780d6f29e1fa371e72e8bc1a39d48b17329f60c4a457492cbb3e85e2194a`

Copy and paste these unique keys into your `.env.local` file (for local development) and into the **Vercel Project Dashboard** (for production).

---

<a id="4-deployment-guide"></a>
## 4. ☁️ Cloud Services Deployment Guide (Step-by-Step)

<a id="41-vercel"></a>
### 4.1 Vercel (Frontend & Server Actions Engine)
Vercel hosts the Next.js 15 web application, executes React Server Components, handles image optimization, and terminates SSL with zero configuration.

#### Step-by-Step Setup:
1. Push your repository to GitHub: `https://github.com/alamwastraly-sketch/aalm-vastralay`.
2. Login to [Vercel](https://vercel.com) and click **"Add New..." ➔ "Project"**.
3. Import the `aalm-vastralay` repository.
4. **Build & Development Settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. **Environment Variables Configuration:**
   - Expand the **"Environment Variables"** section.
   - Paste all mandatory variables from Section 2 (`DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_SECRET`, `POW_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BOOTSTRAP_TOKEN`, `SKIP_SEED`).
6. Click **Deploy**. Vercel will build the application and provide a live URL: `https://aalm-vastralay.vercel.app`.

---

<a id="42-neon"></a>
### 4.2 Neon Serverless PostgreSQL (Database Engine)
Neon provides serverless PostgreSQL with instant autoscaling, branching, and automated connection pooling via PgBouncer.

#### Step-by-Step Setup:
1. Sign up at [neon.tech](https://neon.tech).
2. Create a new project named `aalm-vastralay`.
3. Select **AWS** as the cloud provider and choose the **Mumbai (`ap-south-1`)** region for lowest latency to Indian customers.
4. In the Neon Dashboard, locate the **Connection Details** widget:
   - Check the box **"Pooled connection"** (this automatically inserts `-pooler` into the hostname).
   - Ensure the connection type is set to **`PostgreSQL`**.
   - Your connection string will look like:
     ```
     postgresql://neondb_owner:npg_SECRET@ep-royal-firefly-a1b2c3-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require
     ```
5. Paste this entire string into `DATABASE_URL` in Vercel and `.env.local`.
6. **Execute First-Time Zero-Loss Migration:**
   After deploying to Vercel, open your browser and visit:
   `https://aalm-vastralay.vercel.app/api/bootstrap?token=YOUR_BOOTSTRAP_TOKEN`
   The system will automatically initialize all required PostgreSQL tables, indexes, constraints, and create the initial Super Admin account without dropping any data.

---

<a id="43-cloudflare-b2"></a>
### 4.3 Cloudflare Worker & Backblaze B2 (Media Streaming & CDN Proxy)
This tier delivers high-resolution ethnic wear photos (lehengas, sarees, sherwanis) with 100% free bandwidth via Cloudflare's Bandwidth Alliance.

#### Step-by-Step Setup:

##### A. Configure Backblaze B2:
1. Log in to [backblaze.com/b2](https://www.backblaze.com/b2/).
2. Create a new Bucket:
   - Name: `aalm-vastralay-cold-storage`
   - Files in Bucket: **Private**
   - Default Encryption: Enabled (AES-256)
3. Navigate to **App Keys** and click **"Add a New Application Key"**:
   - Key Name: `aalm-worker-access`
   - Allow access to Bucket: `aalm-vastralay-cold-storage`
   - Type of Access: `Read and Write`
4. Note down your `keyID`, `applicationKey`, and `bucketId`.

##### B. Deploy Cloudflare Worker (`workers/b2-proxy`):
1. Install Cloudflare Wrangler CLI globally (or run via npx):
   ```bash
   cd workers/b2-proxy
   npx wrangler login
   ```
2. Store your Backblaze B2 credentials safely inside Cloudflare's encrypted secret store:
   ```bash
   npx wrangler secret put B2_KEY_ID
   # When prompted, paste your Backblaze B2 keyID
   
   npx wrangler secret put B2_APP_KEY
   # When prompted, paste your Backblaze B2 applicationKey
   ```
3. Deploy the worker to Cloudflare's global edge network:
   ```bash
   npx wrangler deploy
   ```
4. Wrangler will display the live worker URL:
   `https://aalm-b2-proxy.<your-subdomain>.workers.dev`
5. Test the worker in your browser or curl:
   ```bash
   curl -I https://aalm-b2-proxy.<your-subdomain>.workers.dev/health
   # Expected response: 200 OK
   ```
6. Add this worker URL to Vercel environment variables:
   `NEXT_PUBLIC_B2_WORKER_URL="https://aalm-b2-proxy.<your-subdomain>.workers.dev"`

---

<a id="44-gas-email"></a>
### 4.4 Google Apps Script (Zero-Cost Transactional OTP & Email Engine)
Why pay \$15–\$50/month for SendGrid or AWS SES when Google provides 100 completely free daily transactional emails via Gmail API with 99.9% inbox deliverability?

#### Step-by-Step Setup:
1. Go to [script.google.com](https://script.google.com) and click **"New project"**.
2. Rename the project to `Aalm-Vastralay-Email-Relay`.
3. Replace the default code with the script located at [`docs/GAS_EMAIL_GUIDE.md`](GAS_EMAIL_GUIDE.md):
   ```javascript
   function doPost(e) {
     var secretToken = "YOUR_SHARED_SECRET_TOKEN"; // Match GAS_SECRET_TOKEN in .env
     var data = JSON.parse(e.postData.contents);
     
     if (data.token !== secretToken) {
       return ContentService.createTextOutput(JSON.stringify({ status: "unauthorized" }))
         .setMimeType(ContentService.MimeType.JSON);
     }
     
     MailApp.sendEmail({
       to: data.to,
       subject: data.subject,
       htmlBody: data.htmlBody
     });
     
     return ContentService.createTextOutput(JSON.stringify({ status: "sent" }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
4. Click **Deploy ➔ New deployment**.
5. Select type: **Web app**.
   - Description: `Production Email Gateway`
   - Execute as: **Me (your Gmail account)**
   - Who has access: **Anyone**
6. Click **Deploy**, authorize Gmail permissions, and copy the **Web App URL**:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. Set in `.env` / Vercel:
   ```env
   GAS_EMAIL_URL="https://script.google.com/macros/s/AKfycb.../exec"
   GAS_SECRET_TOKEN="YOUR_SHARED_SECRET_TOKEN"
   ```

---

<a id="45-image-cdn"></a>
### 4.5 ImageKit CDN & WSRV.nl Image Acceleration
The marketplace features a multi-tiered Universal Media Resolver ([`src/lib/image-resolver.ts`](../src/lib/image-resolver.ts)) that supports four distinct media protocols:
1. **Google Drive Links:** Converted automatically to direct high-speed thumbnail caching streams.
2. **Backblaze B2 Keys (`b2:products/...`):** Routed through the Cloudflare edge worker.
3. **ImageKit (`ik:...` or custom endpoint):** Dynamically resized and converted to next-gen AVIF/WebP formats.
4. **Direct URLs (`http://...` or `https://...`):** Automatically proxied through `wsrv.nl` with WebP compression when `NEXT_PUBLIC_USE_WSRV="true"`.

---

<a id="5-route-catalog"></a>
## 5. 📱 Live Route Map & Visual UI Inspection Catalog (Kaha Kya Dikhega)

This catalog details how every single screen and page looks, what features it provides, its URL, and how a developer or QA engineer can verify its functionality.

---

<a id="51-homepage"></a>
### 5.1 Homepage (`/`)
* **Live Route:** [`https://aalm-vastralay.vercel.app/`](https://aalm-vastralay.vercel.app/)
* **Visual Appearance & Component Breakdown:**
  1. **Top Announcement Strip:** Marquee animation with golden shimmer text: *"Cash on Delivery Available Across India · Free Fall & Pico on All Sarees · 7-Day Hassle-Free Returns"*.
  2. **Royal Heritage Header:**
     - Left: Royal Maroon Medallion with golden Devanagari **"आ"** brand logo.
     - Center: Instant autocomplete search bar with voice search and Hindi/English ethnic keyword detection ("Banarasi", "Bridal Lehenga", "Kurta").
     - Right: Currency switcher (₹ INR), Saved Wishlist counter badge, Bag (Cart) counter badge, Dark/Light mode toggle, and User Account button.
  3. **Festive Occasions Strip (हॉरिजॉन्टल स्क्रोल):** Smooth horizontal swipe pills representing Indian wedding traditions:
     - 💍 Haldi Ceremony (Yellow & Mustard)
     - 🌿 Mehendi Celebrations (Green & Mint)
     - 🌸 Sangeet & Cocktail (Rani Pink & Pastel)
     - 👑 Grand Bridal Dulhan (Deep Maroon & Crimson)
     - 🪔 Chhath & Traditional Pooja (Vermilion & Saffron)
  4. **Dynamic Hero Showcase:** High-impact bridal slider with luxury CTA buttons *"Shop Bridal Collection"* and *"Explore Artisans"*.
  5. **Indian Trust Matrix:** Four interactive guarantee badges:
     - 🇮🇳 *Direct from Weavers (Varanasi, Surat, Bhagalpur, Chanderi)*
     - 💵 *100% Cash on Delivery (COD) Supported*
     - 🚚 *28,000+ Verified Delivery Pincodes*
     - 📹 *Live Video Call Inspection on WhatsApp*
  6. **WhatsApp Floating Pulse Button:** Bottom-right corner pulsating green badge offering instant customer assistance via WhatsApp.

---

<a id="52-catalog"></a>
### 5.2 Catalog & Product Detail Pages (`/products`, `/products/[slug]`)
* **Live Routes:** 
  - Catalog: [`https://aalm-vastralay.vercel.app/products`](https://aalm-vastralay.vercel.app/products)
  - Detail: [`https://aalm-vastralay.vercel.app/products/royal-banarasi-silk-saree`](https://aalm-vastralay.vercel.app/products/royal-banarasi-silk-saree)
* **Visual Appearance & Features:**
  1. **Multi-Faceted Ethnic Filters:**
     - Filter by Occasion (Wedding, Reception, Haldi, Mehendi, Daily Festive).
     - Filter by Fabric (Katan Silk, Georgette, Organza, Velvet, Chanderi).
     - Filter by Colorway (Rani Pink, Royal Maroon, Emerald Green, Mustard Yellow, Peacock Blue).
     - Price Range Slider with instant client-side URL state synchronization.
  2. **Product Detail View:**
     - **High-Definition Image Carousel:** Multi-angle zoom supporting up to 8 images per garment with swipe gestures on mobile.
     - **Pricing Display:** Net Selling Price in bold ₹ INR, strikethrough Maximum Retail Price (MRP), and calculated percentage savings badge (e.g., `35% OFF`).
     - **📏 Ethnic Size Guide Modal:**
       - Interactive Inch (Inches) ↔ Centimeter (CM) toggle switch.
       - Accurate measurements for Women (Bust, Waist, Hip, Blouse Length, Lehenga Flair) and Men (Chest, Shoulder, Kurta Length).
       - Alteration margin notes explaining built-in 2-inch side seams.
     - **📍 Real-Time Indian Pincode & COD Estimator:**
       - Input field accepting any 6-digit Indian Postal PIN code.
       - Validates delivery circles and renders green confirmation badge: *"Estimated delivery in 4-6 business days · Cash on Delivery available at 800001"*.
     - **💬 WhatsApp Family Consultation (सलाह लें):**
       - Button opens WhatsApp with pre-composed message containing product title, price, and direct link so customers can seek advice from family before buying.
     - **📱 Sticky Mobile Action Bar:**
       - Sticks to the bottom of mobile viewports when scrolling: displays garment price, green WhatsApp inquiry button, and prominent *"Add to Bag"* button.

---

<a id="53-checkout"></a>
### 5.3 Cart & Checkout Funnel (`/cart`, `/checkout`)
* **Live Routes:**
  - Shopping Bag: [`https://aalm-vastralay.vercel.app/cart`](https://aalm-vastralay.vercel.app/cart)
  - One-Page Checkout: [`https://aalm-vastralay.vercel.app/checkout`](https://aalm-vastralay.vercel.app/checkout)
* **Visual Appearance & Features:**
  1. **Interactive Cart Summary:**
     - Free Shipping Progress Meter: Visual bar showing progress toward free delivery (e.g., *"Add ₹499 more to unlock FREE Delivery across India"*).
     - Coupon Code Engine: Real-time validation for codes like `UTSAV10`, `BRIDAL500`, or `WELCOME100` with instant savings recalculation.
  2. **Frictionless Indian Checkout Flow:**
     - **Guest Mode:** Customers can complete orders with just their phone number and delivery address without mandatory sign-up.
     - **Indian Address Form:** State and District auto-fill instantly upon typing a 6-digit PIN code.
     - **Payment Gateways Supported:**
       - **Dynamic UPI QR Code:** Generates an on-screen intent QR code compatible with Google Pay, PhonePe, Paytm, and BHIM UPI with an 8-minute countdown timer and UTR reference number submission.
       - **Cash on Delivery (COD):** Zero advance payment required; pay the courier agent upon doorstep delivery.
       - **Online Net Banking / Cards:** Direct payment gateway integration.

---

<a id="54-tracking"></a>
### 5.4 Order Tracking & Lifecycle Management (`/track`, `/orders/[id]`)
* **Live Route:** [`https://aalm-vastralay.vercel.app/track`](https://aalm-vastralay.vercel.app/track)
* **Visual Appearance & Features:**
  1. **Dual Search Modes:** Customers can look up orders by entering **Order ID** (e.g., `ORD-2026-9812`) or registered **Mobile Phone Number**.
  2. **5-Stage Visual Progress Stepper:**
     - 📝 Order Placed & Confirmed
     - 📦 Handcrafted & Quality Checked by Artisan
     - 🚚 Dispatched via Express Courier (Delhivery / Shiprocket)
     - 🛵 Out for Doorstep Delivery
     - 🎁 Delivered Safely
  3. **Interactive Tracking Actions:**
     - Direct tracking link to courier portal with live AWB number.
     - Download Statutory GST Tax Invoice (Rule 46 compliant PDF).
     - 1-Click WhatsApp Support link with auto-populated Order ID.

---

<a id="55-returns"></a>
### 5.5 Hassle-Free Returns & Reverse Logistics (`/returns`, `/orders/[id]/return`)
* **Live Routes:**
  - Policy: [`https://aalm-vastralay.vercel.app/returns`](https://aalm-vastralay.vercel.app/returns)
  - Return Request: [`https://aalm-vastralay.vercel.app/orders/[id]/return`](https://aalm-vastralay.vercel.app/orders/[id]/return)
* **Visual Appearance & Features:**
  1. **7-Day Eligibility Checker:** Checks if the order is within the 7-day delivery window.
  2. **Return Reason Selector:**
     - Size/Fitting mismatch (Free size exchange or return).
     - Color/Fabric difference from photo.
     - Defective piece or transit damage.
  3. **Photo Proof Upload:** Direct browser upload for garment condition verification.
  4. **Instant Refund Mode:** Choice between original payment source or instant Aalm Store Wallet credit with an extra 5% bonus.

---

<a id="56-seller"></a>
### 5.6 Seller Multi-Vendor Portal (`/seller`, `/seller/dashboard`)
* **Live Routes:**
  - Seller Landing & Onboarding: [`https://aalm-vastralay.vercel.app/seller`](https://aalm-vastralay.vercel.app/seller)
  - Seller Command Center: [`https://aalm-vastralay.vercel.app/seller/dashboard`](https://aalm-vastralay.vercel.app/seller/dashboard)
* **Visual Appearance & Features:**
  1. **0% Marketplace Commission Guarantee:** Transparent value proposition highlighting ₹0 platform commission for verified Indian weavers and boutique artisans.
  2. **Strict Multi-Tenant Isolation:** Sellers can only view and edit their own products, inventory, and order fulfillment slips. Database queries strictly enforce `seller_id = session.user.id`.
  3. **Garment Listing Creator:**
     - Multi-image uploader with auto-thumbnail generation.
     - Attribute selectors for Traditional Weave type (Banarasi, Kanjivaram, Paithani, Bandhani), Fabric, and Occasion.
     - SKU, stock inventory count, and size variation matrix.
  4. **Order Dispatch & Manifest:** Generate printable shipping dispatch labels with barcode and customer address.

---

<a id="57-admin"></a>
### 5.7 Admin Command Center & Zero-Code Customizer (`/admin`, `/admin/settings`)
* **Live Routes:**
  - Dashboard: [`https://aalm-vastralay.vercel.app/admin`](https://aalm-vastralay.vercel.app/admin)
  - Zero-Code Settings: [`https://aalm-vastralay.vercel.app/admin/settings`](https://aalm-vastralay.vercel.app/admin/settings)
* **Visual Appearance & Features:**
  1. **Marketplace Analytics Overview:**
     - Gross Merchandise Value (GMV in ₹ Lakhs / Crores).
     - Total orders processed, COD vs Online split, and active customer counts.
  2. **94 Zero-Code Settings Customizer:**
     - Toggle festive banners and top announcement text without modifying code.
     - Enable/disable emergency flash sales with live countdown clocks.
     - Configure Free Shipping threshold (e.g., ₹999 or ₹1,499).
     - Switch payment modes (Enable/Disable COD globally or by state).
  3. **Audit Log & Security Center:** Real-time log of administrative logins, order cancellations, and refund approvals.

---

<a id="58-social-brand"></a>
### 5.8 Social OpenGraph Red Card & Browser Favicon
* **Visual Verification Checklist:**
  1. **WhatsApp Link Preview (Red Card):**
     - When sharing `https://aalm-vastralay.vercel.app/` on WhatsApp, Telegram, or Facebook, the link renders a **rich royal maroon preview card** (`#420b12` to `#7a1f2b`).
     - Features the golden Devanagari **"आ"** medallion logo, headline *"Aalm Vastralay – Wedding & Ethnic Wear Marketplace"*, and four pill badges: *Cash on Delivery · 7-Day Returns · Verified Sellers · 0% Commission*.
  2. **Browser Tab Icon (Favicon):**
     - Across Chrome, Edge, Safari, and Firefox, the browser tab displays the official **Golden "आ" Royal Maroon Medallion** icon (replacing any generic emojis).

---

<a id="59-legal"></a>
### 5.9 Statutory Legal Pages (`/privacy`, `/terms`, `/returns`, `/cookies`)
* **Live Routes:**
  - Privacy Policy: [`https://aalm-vastralay.vercel.app/privacy`](https://aalm-vastralay.vercel.app/privacy)
  - Terms of Service: [`https://aalm-vastralay.vercel.app/terms`](https://aalm-vastralay.vercel.app/terms)
  - Shipping & Returns: [`https://aalm-vastralay.vercel.app/returns`](https://aalm-vastralay.vercel.app/returns)
  - Cookie Policy: [`https://aalm-vastralay.vercel.app/cookies`](https://aalm-vastralay.vercel.app/cookies)
* **Compliance Standards:**
  - Written in full compliance with the **Digital Personal Data Protection Act (DPDP Act 2023)**, **Information Technology Act 2000**, and **Consumer Protection (E-Commerce) Rules 2020**.
  - Includes Grievance Officer contact details, response SLAs, customer consent mechanisms, and transparent dispute resolution procedures.

---

<a id="6-testing-runbook"></a>
## 6. 🧪 Developer Verification & Feature Testing Runbook (Feature Check Matrix)

Follow this structured testing guide to verify that all components, security layers, and ecommerce capabilities are functioning properly.

---

<a id="61-cli-tests"></a>
### 6.1 Automated CLI Test Suites
The codebase includes 23 enterprise test suites covering encryption, commerce math, role security, PIN code routing, and GST tax engines.

#### Step 1: Run the Complete Automated Test Suite
```bash
npm test
```
* **Expected Output:**
  ```text
  👑 AALM VASTRALAY — AUTOMATED ENTERPRISE TEST SUITE
  ▶ Running Encryption & PII Security Tests... [Passed]
  ▶ Running Indian Commerce & Currency Tests... [Passed]
  ▶ Running Indian Ethnic & Pincode Feature Tests... [Passed]
  ▶ Running Authentication & Role Security Tests... [Passed]
  ▶ Running Coupons & Category Hierarchy Tests... [Passed]
  ▶ Running Seller Multi-Vendor Privacy & Scoping Tests... [Passed]
  ▶ Running Admin Zero-Code Customization Tests... [Passed]
  ▶ Running Universal Media Resolver Tests... [Passed]
  ▶ Running Statutory GST Tax Invoice & Lifecycle Tests... [Passed]
  🏆 ALL 23/23 ENTERPRISE TEST SUITES PASSED!
  ```

#### Step 2: Run Strict TypeScript Verification
```bash
npm run typecheck
```
* **Expected Output:** Exits with code `0` and **0 type errors**. (Zero `any` types allowed).

#### Step 3: Run ESLint Code Quality Verification
```bash
npm run lint
```
* **Expected Output:** Exits with code `0` and **0 warnings or errors**.

---

<a id="62-endpoints"></a>
### 6.2 Diagnostic & Healthcheck Endpoints
Developers can inspect the live status of all background infrastructure using built-in API health probes:

| Endpoint | HTTP Method | Expected Output | Purpose |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | `{"status":"healthy","database":"connected","timestamp":"..."}` | Basic uptime probe for Vercel and monitoring tools. |
| `/api/diagnostic` | `GET` | `{"services":{"postgres":true,"b2":true,"email":true}}` | Verifies connections to database, Cloudflare worker, and email relay. |
| `/api/bootstrap` | `GET` | `{"status":"migrated","tablesCreated":18,"admin":"ready"}` | Executes zero-loss database schema migrations (requires `?token=...`). |

---

<a id="63-e2e-matrix"></a>
### 6.3 Manual End-to-End (E2E) 10-Feature Verification Matrix

Use this step-by-step checklist to test the platform manually in any browser:

| # | Feature / User Story | Test Action & Input | Expected System Behavior | Pass / Fail |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Browse & Search** | Open `/` and type *"Banarasi"* in the search bar. | Instant search results render with matching sarees, prices, and weaver tags. | [ ] |
| **2** | **Occasion Filter** | On `/products`, click the *"Haldi Ceremony"* pill. | Garment catalog filters instantly to yellow and mustard ethnic wear. | [ ] |
| **3** | **Pincode & COD Check**| Open any product, enter PIN code `800001` (Patna). | Displays green confirmation badge with expected delivery date and COD eligibility. | [ ] |
| **4** | **Size Guide Modal** | Click *"Size Guide"* on a bridal lehenga page; toggle **Inches / CM**. | Modal opens smoothly; measurements update accurately between metric and imperial. | [ ] |
| **5** | **WhatsApp Consult** | Click *"परिवार को दिखाएं / सलाह लें"* on any product. | Opens WhatsApp with pre-filled product name, price in ₹, and direct link. | [ ] |
| **6** | **Cart & Coupon** | Add item to cart; apply coupon code `UTSAV10`. | Cart recalculates with instant 10% discount and updates free shipping progress bar. | [ ] |
| **7** | **UPI QR Payment** | Proceed to checkout; select **Dynamic UPI QR Code**. | Renders QR code with an 8-minute countdown timer and UTR input field. | [ ] |
| **8** | **COD Checkout** | Select **Cash on Delivery (COD)**; enter shipping address. | Order placed successfully; redirect to `/orders/[id]` with order confirmation. | [ ] |
| **9** | **Live Order Track** | Open `/track` and enter the newly created Order ID. | Stepper indicates *"Order Placed & Confirmed"* with download invoice link. | [ ] |
| **10**| **Admin Zero-Code** | Login at `/admin`; toggle announcement banner text. | Changes reflect on homepage within seconds without rebuilding the application. | [ ] |

---

<a id="7-troubleshooting"></a>
## 7. 🛠️ Troubleshooting, Edge Cases & Operational Runbook

### Issue 1: WhatsApp Link Preview Shows Plain Text Instead of Red Card
* **Root Cause:** WhatsApp cached an earlier link preview before the updated OpenGraph assets were deployed, or the site URL was set to an unresolvable domain.
* **Resolution:**
  1. Ensure `NEXT_PUBLIC_SITE_URL` in Vercel is set to `https://aalm-vastralay.vercel.app` (or your live custom domain).
  2. Append a query parameter when sharing on WhatsApp to bypass Meta's crawler cache:  
     `https://aalm-vastralay.vercel.app/?v=3`
  3. WhatsApp will fetch fresh headers and display the **Royal Maroon Red Card** immediately.

### Issue 2: Browser Tab Shows Blue Dress Emoji (👗) Instead of Royal Logo
* **Root Cause:** Browser favicon cache has stored the legacy inline SVG data URI.
* **Resolution:**
  1. Open the website: `https://aalm-vastralay.vercel.app/`.
  2. Perform a hard refresh using keyboard shortcuts:
     - **Windows / Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
     - **macOS:** `Cmd + Shift + R`
  3. The browser will purge the cached icon and load [`public/favicon.ico`](../public/favicon.ico) and [`public/favicon.svg`](../public/favicon.svg) showing the royal **"आ"** medallion.

### Issue 3: Neon PostgreSQL "Too Many Connections" or Connection Timeout
* **Root Cause:** Using the direct connection string instead of the PgBouncer pooled connection string.
* **Resolution:**
  1. In Neon Console, ensure **"Pooled connection"** is toggled ON.
  2. Check that the host in `DATABASE_URL` contains `-pooler`:  
     `ep-firefly-123456-pooler.ap-south-1.aws.neon.tech`
  3. Always ensure query strings include `sslmode=require`.

### Issue 4: Email OTP Not Delivering to Customer
* **Root Cause:** Google Apps Script quota reached (100 free emails/day) or permissions not granted to "Anyone".
* **Resolution:**
  1. Visit the Google Apps Script project dashboard.
  2. Verify deployment settings: **Execute as: Me** and **Who has access: Anyone**.
  3. Test the endpoint manually using curl:
     ```bash
     curl -X POST -H "Content-Type: application/json" \
       -d '{"token":"YOUR_SECRET_TOKEN","to":"test@example.com","subject":"Test","htmlBody":"<p>Hello</p>"}' \
       https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
     ```

---

## 👑 Conclusion & Certification
Aalm Vastralay is engineered to deliver a seamless blend of **Indian ethnic luxury aesthetics** and **enterprise-grade resilience**. By following this operations manual, developers and system administrators can deploy, monitor, and scale the marketplace with complete confidence.

*For further assistance, refer to the master index at [`docs/README.md`](README.md) or open an issue on the repository.*
