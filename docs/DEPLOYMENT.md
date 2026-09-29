# 🚀 Aalm Vastralay — Master Production Deployment Architecture & Runbook
**Location:** `docs/DEPLOYMENT.md`  
**Stack:** Next.js 16 (App Router + React 19) • Neon Serverless PostgreSQL (Mumbai) • Vercel Edge • Cloudflare Worker • Backblaze B2 • Google Apps Script

---

## 🏛️ Dedicated Production Manuals Hub

For deep, service-specific step-by-step production runbooks, refer to our specialized architectural guides:

| Pillar | Dedicated Production Manual | Core Capabilities & Focus |
|:---|:---|:---|
| 🐘 **Database Engine** | **[docs/NEON_POSTGRESQL.md](NEON_POSTGRESQL.md)** | Neon PostgreSQL 16 (Mumbai `ap-south-1`), PgBouncer connection pooler (`-pooler`), zero-loss schema auto-migrations, 1-click clean wipe. |
| ⚡ **Frontend & Compute** | **[docs/VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** | Next.js 16 SSR/ISR, Edge caching, Mumbai region config, custom DNS, zero-downtime releases, instant rollback. |
| 🛡️ **Edge Proxy & CDN** | **[docs/CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)** | Bandwidth Alliance $0 egress, KV token caching (`B2_TOKEN_KV`), HTTP 206 video range seeking, 1-year immutable caching. |
| 📦 **Cold Storage** | **[docs/BACKBLAZE_B2.md](BACKBLAZE_B2.md)** | Private bucket (`aalm-vastralay-media`), direct client presigned uploads (bypassing Vercel 4.5MB ceiling), production CORS rules. |
| 📧 **Transactional Mailer** | **[docs/GAS_MAILER.md](GAS_MAILER.md)** | 100% free Gmail inbox delivery, zero DNS/SPF/DKIM setup, 450/day circuit breaker, HMAC token auth, 10 royal templates. |
| 🔐 **Environment Variables** | **[docs/ENV_VARS_PRODUCTION.md](ENV_VARS_PRODUCTION.md)** | 100% production-ready secrets matrix, cryptographic 256-bit key generators, zero mock data, secret rotation playbook. |

---

## 📑 त्वरित विषय-सूची (Table of Contents)
1. [🐘 1. Neon Serverless PostgreSQL सेटअप (Database)](#1-neon-setup)
2. [⚡ 2. Vercel डिप्लॉयमेंट व Environment Variables (Web App)](#2-vercel-setup)
3. [🛡️ 3. Cloudflare Worker + Backblaze B2 सेटअप (Media CDN)](#3-cloudflare-worker-setup)
4. [📧 4. Google Apps Script (GAS) Mailer सेटअप](#4-gas-setup)
5. [🔑 5. Complete Production Environment Variables Matrix](#5-env-checklist)
6. [🔄 6. डेटाबेस इनिशियलाइज़ेशन (Zero-Downtime Bootstrap)](#6-bootstrap)
7. [📱 7. Kotlin / Android से संबंधित स्पष्टीकरण](#7-kotlin-clarification)

---

<a id="1-neon-setup"></a>
## 🐘 1. Neon Serverless PostgreSQL सेटअप (Database)

Neon दुनिया का सबसे आधुनिक सर्वरलेस PostgreSQL है जो 0.5 GB स्टोरेज हमेशा के लिए मुफ़्त देता है।

### स्टेप्स:
1. **साइन अप करें:** [https://neon.tech](https://neon.tech) पर जाएं और GitHub या Google से लॉगिन करें।
2. **प्रोजेक्ट बनाएं:**
   - **Project Name:** `aalm-vastralay`
   - **Postgres version:** `16` (Default)
   - **Region:** `Asia-Pacific (Mumbai) - ap-south-1` (भारत में सबसे तेज़ रिस्पॉन्स के लिए अनिवार्य)
3. **Connection String कॉपी करें (सबसे महत्वपूर्ण बात):**
   - डैशबोर्ड पर **Connection Details** विजेट देखें।
   - **Pooled connection** चेकबॉक्स को टिक (✓) करें।
   - Serverless (Vercel) पर हमेशा **Pooled (`-pooler`)** कनेक्शन स्ट्रिंग का उपयोग करें:
     ```text
     postgresql://neondb_owner:PASSWORD@ep-cool-flower-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require
     ```
   - *नोट:* यदि आप बिना पूलर वाला डायरेक्ट URL लगाते हैं, तो Vercel के कई सर्वरलेस फंक्शन एक साथ चलने पर डेटाबेस कनेक्शन लिमिट खत्म (exhaust) हो सकती है। इसलिए हमेशा `-pooler` वाला URL ही `DATABASE_URL` में डालें!

---

<a id="2-vercel-setup"></a>
## ⚡ 2. Vercel डिप्लॉयमेंट व Environment Variables (Web App)

> विस्तृत जानकारी के लिए देखें: [**docs/VERCEL_DEPLOYMENT.md**](VERCEL_DEPLOYMENT.md)

### स्टेप्स:
1. **GitHub Repository कनेक्ट करें:**
   - [https://vercel.com](https://vercel.com) खोलें।
   - **Add New Project** -> अपना `aalm-vastralay` रिपोजिटरी इंपोर्ट करें।
   - Framework Preset: **Next.js** (स्वतः डिटेक्ट होगा)।
2. **Environment Variables जोड़ें:**
   - Vercel में **Settings -> Environment Variables** में जाएं।
   - `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_SECRET`, `POW_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_B2_WORKER_URL`, `B2_KEY_ID`, `B2_APP_KEY`, `B2_BUCKET_ID`, `GAS_WEBHOOK_URL`, `GAS_SECRET_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BOOTSTRAP_TOKEN`, `SKIP_SEED` जोड़ें।
3. **Deploy दबाएं:**
   - Vercel ऑटोमैटिकली `npm run build` चलाकर 1-2 मिनट में आपकी साइट को लाइव कर देगा।

---

<a id="3-cloudflare-worker-setup"></a>
## 🛡️ 3. Cloudflare Worker + Backblaze B2 सेटअप (Media CDN)

> विस्तृत जानकारी के लिए देखें: [**docs/CLOUDFLARE_WORKER.md**](CLOUDFLARE_WORKER.md) और [**docs/BACKBLAZE_B2.md**](BACKBLAZE_B2.md)

यह वर्कर Backblaze B2 से बिना किसी डाउनलोड चार्ज ($0 Egress Bandwidth Alliance) के प्रोडक्ट फ़ोटो और वीडियो 1 वर्ष की इम्यूटेबल कैशिंग के साथ स्ट्रीम करता है।

### स्टेप्स:
1. **Cloudflare CLI (Wrangler) से लॉगिन करें:**
   ```bash
   cd cloudflare-worker
   npx wrangler login
   ```
2. **KV Namespace बनाएं (B2 Auth Token कैश करने के लिए):**
   ```bash
   npx wrangler kv namespace create B2_TOKEN_KV --config wrangler-b2-proxy.toml
   ```
   यह कमांड एक `id` लौटाएगी। इसे `cloudflare-worker/wrangler-b2-proxy.toml` में दर्ज करें।
3. **B2 Secrets Cloudflare में सुरक्षित रूप से दर्ज करें:**
   ```bash
   npx wrangler secret put B2_KEY_ID --config wrangler-b2-proxy.toml
   npx wrangler secret put B2_APP_KEY --config wrangler-b2-proxy.toml
   ```
4. **डिप्लॉय करें:**
   ```bash
   npx wrangler deploy --config wrangler-b2-proxy.toml
   ```
   कमांड पूरा होते ही आपको आपका वर्कर यूआरएल मिल जाएगा (उदा. `https://aalm-b2-proxy.<subdomain>.workers.dev` या `https://media.aalmvastralay.com`)।

---

<a id="4-gas-setup"></a>
## 📧 4. Google Apps Script (GAS) Mailer सेटअप

> विस्तृत जानकारी के लिए देखें: [**docs/GAS_MAILER.md**](GAS_MAILER.md)

1. [script.google.com/home](https://script.google.com/home) पर जाएं और नया प्रोजेक्ट बनाएं।
2. [`scripts/gas-webhook-code.gs`](../scripts/gas-webhook-code.gs) का पूरा कोड पेस्ट करें।
3. **Deploy -> New deployment -> Type: Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. प्राप्त Web App URL को `GAS_WEBHOOK_URL` में दर्ज करें।

---

<a id="5-env-checklist"></a>
## 🔑 5. Complete Production Environment Variables Matrix

> विस्तृत गाइड व की जनरेशन: [**docs/ENV_VARS_PRODUCTION.md**](ENV_VARS_PRODUCTION.md)

```env
# 1. डेटाबेस (Neon Serverless PostgreSQL Pooled - Mumbai)
DATABASE_URL="postgresql://neondb_owner:YOUR_DATABASE_PASSWORD@ep-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# 2. सुरक्षा व सीक्रेट्स (टर्मिनल में node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" से बनाएं)
AUTH_SECRET="e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15"
ENCRYPTION_SECRET="7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6"
POW_SECRET="aalm_pow_shield_demo_secret_key_change_me_in_prod"

# 3. डोमेन व कुकीज़
COOKIE_SECURE="true"
NEXT_PUBLIC_SITE_URL="https://example-marketplace.vercel.app"
NEXT_PUBLIC_B2_WORKER_URL="https://media.example.com"
NEXT_PUBLIC_USE_WSRV="true"

# 4. बैकब्लेज़ B2 स्टोरेज
B2_KEY_ID="004e8b9xxxxxxxx0000000001"
B2_APP_KEY="K004xxxxxxxxxxxxxxxxxxxxxxxxxxx"
B2_BUCKET_ID="4a5b6c7d8e9f0123456789ab"
B2_BUCKET_NAME="my-store-media-bucket"

# 5. ईमेल इंजन (Dual Hybrid: SMTP + GAS Fallback)
SMTP_USER="your-store-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
GAS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
GAS_SECRET_TOKEN="your_gas_mail_shared_secret_token_here"

# 6. सुपर एडमिन व बूटस्ट्रैप
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YourStrongSecurePassword@2026"
BOOTSTRAP_TOKEN="your_one_time_bootstrap_token_here"
SKIP_SEED="true"
```

---

<a id="6-bootstrap"></a>
## 🔄 6. डेटाबेस इनिशियलाइज़ेशन (Zero-Downtime Bootstrap)

डिप्लॉय होने के बाद एक बार टर्मिनल / PowerShell से यह सुरक्षित POST बूटस्ट्रैप चलाएं:
```bash
# Terminal / cURL:
curl -X POST "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```
या PowerShell (Windows) में:
```powershell
Invoke-RestMethod -Method Post -Uri "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```
*(सुरक्षा कारणों से `/api/bootstrap` केवल **POST** मेथड स्वीकार करता है ताकि गलती से कोई वेब बॉट या GET क्रॉलर डेटाबेस को ट्रिगर न करे।)*

---

<a id="7-kotlin-clarification"></a>
## 📱 7. Kotlin / Android से संबंधित स्पष्टीकरण

1. **वेब मार्केटप्लेस में कोई Kotlin कोड की आवश्यकता नहीं है:** यह पूरा प्रोजेक्ट **Next.js 16 (React + TypeScript + Tailwind CSS)** आधारित ई-कॉमर्स वेब मार्केटप्लेस है।
2. **सफाई (Cleanup):** वेब प्रोजेक्ट को साफ और व्यवस्थित रखने के लिए अप्रयुक्त `.kt` फाइलों को रिपोजिटरी से पूरी तरह हटा दिया गया है। आपकी वेब ऐप 100% शुद्ध TypeScript/JavaScript स्टैक पर चल रही है।
