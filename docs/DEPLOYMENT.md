# 🚀 AALM VASTRALAY — COMPLETE PRODUCTION DEPLOYMENT GUIDE
# Location: docs/DEPLOYMENT.md

यह गाइड **Aalm Vastralay (Next.js 16 + Neon PostgreSQL + Cloudflare Worker + Vercel)** को 100% फ्री टियर पर लाइव और सुरक्षित डिप्लॉय करने के लिए सम्पूर्ण स्टेप-बाय-स्टेप निर्देश प्रदान करती है।

---

## 📑 विषय-सूची (Table of Contents)
1. [🐘 1. Neon Serverless PostgreSQL सेटअप (Database)](#1-neon-setup)
2. [⚡ 2. Vercel डिप्लॉयमेंट व Environment Variables (Web App)](#2-vercel-setup)
3. [🛡️ 3. Cloudflare Worker + Backblaze B2 सेटअप (Media CDN)](#3-cloudflare-worker-setup)
4. [🔑 4. Environment Variables Checklist](#4-env-checklist)
5. [🔄 5. डेटाबेस इनिशियलाइज़ेशन (Zero-Downtime Bootstrap)](#5-bootstrap)
6. [📱 6. Android / Kotlin से संबंधित स्पष्टीकरण](#6-kotlin-clarification)

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
   - *नोट:* यदि आप बिना पूलर (`ep-...aws.neon.tech`) वाला डायरेक्ट URL लगाते हैं, तो Vercel के कई सर्वरलेस फंक्शन एक साथ चलने पर डेटाबेस कनेक्शन लिमिट खत्म (exhaust) हो सकती है। इसलिए हमेशा `-pooler` वाला URL ही `DATABASE_URL` में डालें!

---

<a id="2-vercel-setup"></a>
## ⚡ 2. Vercel डिप्लॉयमेंट व Environment Variables (Web App)

### स्टेप्स:
1. **GitHub Repository कनेक्ट करें:**
   - [https://vercel.com](https://vercel.com) खोलें।
   - **Add New Project** -> अपना `aalm-vastralay` रिपोजिटरी इंपोर्ट करें।
   - Framework Preset: **Next.js** (स्वतः डिटेक्ट होगा)।
2. **Environment Variables जोड़ें:**
   - Vercel में **Settings -> Environment Variables** में जाएं।
   - नीचे दिए गए 5 आवश्यक वेरिएबल्स जोड़ें (Production, Preview, Development तीनों टिक रखें):

| Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require` | Neon Pooled Connection String |
| `AUTH_SECRET` | `e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15` | 64-character random hex string |
| `ENCRYPTION_SECRET` | `7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6` | 64-character random hex string |
| `POW_SECRET` | `aalm_pow_shield_super_secure_key_2026` | Bot defense signature key |
| `NEXT_PUBLIC_SITE_URL` | `https://aalm-vastralay.vercel.app` (या आपका कस्टम डोमेन) | Canonical domain for SEO & Auth |
| `COOKIE_SECURE` | `true` | Enforces HTTPS-only cookies in production |
| `NEXT_PUBLIC_B2_WORKER_URL` | `https://aalm-b2-proxy.alamwastraly.workers.dev` | Cloudflare Worker endpoint |
| `BOOTSTRAP_TOKEN` | `aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c` | One-time DB schema initializer token |
| `ADMIN_EMAIL` | `admin@aalmvastralay.com` | Default admin email |
| `ADMIN_PASSWORD` | `StrongAdminPassword@2026` | Default admin password |

3. **Deploy दबाएं:**
   - Vercel ऑटोमैटिकली `npm run build` चलाकर 1-2 मिनट में आपकी साइट को लाइव कर देगा।

---

<a id="3-cloudflare-worker-setup"></a>
## 🛡️ 3. Cloudflare Worker + Backblaze B2 सेटअप (Media CDN)

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
   यह कमांड एक `id` लौटाएगी, जैसे: `id = "a1b2c3d4e5f6..."`।  
   इसे `cloudflare-worker/wrangler-b2-proxy.toml` की लाइन 22 में पेस्ट करें:
   ```toml
   [[kv_namespaces]]
   binding = "B2_TOKEN_KV"
   id = "a1b2c3d4e5f6..."
   ```
3. **B2 Secrets Cloudflare में सुरक्षित रूप से दर्ज करें:**
   ```bash
   npx wrangler secret put B2_KEY_ID --config wrangler-b2-proxy.toml
   # प्रॉम्प्ट आने पर अपना Backblaze Application Key ID डालें

   npx wrangler secret put B2_APP_KEY --config wrangler-b2-proxy.toml
   # प्रॉम्प्ट आने पर अपना Backblaze Application Key डालें
   ```
4. **डिप्लॉय करें:**
   ```bash
   npx wrangler deploy --config wrangler-b2-proxy.toml
   ```
   कमांड पूरा होते ही आपको आपका वर्कर यूआरएल मिल जाएगा:  
   `https://aalm-b2-proxy.alamwastraly.workers.dev`  
   इसे Vercel के `NEXT_PUBLIC_B2_WORKER_URL` में पेस्ट कर दें।

---

<a id="4-env-checklist"></a>
## 🔑 4. Complete Environment Variables Checklist

```env
# 1. डेटाबेस (Neon Serverless PostgreSQL Pooled)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# 2. सुरक्षा व सीक्रेट्स (टर्मिनल में node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" से बनाएं)
AUTH_SECRET="e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15"
ENCRYPTION_SECRET="7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6"
POW_SECRET="aalm_pow_shield_super_secure_key_2026"

# 3. डोमेन व कुकीज़
COOKIE_SECURE="true"
NEXT_PUBLIC_SITE_URL="https://aalm-vastralay.vercel.app"
NEXT_PUBLIC_USE_WSRV="true"

# 4. मीडिया व B2 प्रॉक्सी
NEXT_PUBLIC_B2_WORKER_URL="https://aalm-b2-proxy.alamwastraly.workers.dev"

# 5. सुपर एडमिन व बूटस्ट्रैप
ADMIN_EMAIL="admin@aalmvastralay.com"
ADMIN_PASSWORD="YourStrongPassword@2026"
BOOTSTRAP_TOKEN="aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c"
SKIP_SEED="true"
```

---

<a id="5-bootstrap"></a>
## 🔄 5. डेटाबेस इनिशियलाइज़ेशन (Zero-Downtime Bootstrap)

डिप्लॉय होने के बाद एक बार ब्राउज़र में यह सुरक्षित बूटस्ट्रैप यूआरएल खोलें:
```text
https://aalm-vastralay.vercel.app/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true
```
- यह आपके डेटाबेस में सभी 16 टेबल्स (Users, Products, Categories, Orders, Cart, Settings आदि) सुरक्षित रूप से तैयार कर देगा।
- किसी भी पुराने डेटा को डिलीट किए बिना सारे ज़रूरी कॉलम्स और इंडेक्स बना देगा।

---

<a id="6-kotlin-clarification"></a>
## 📱 6. Kotlin / Android से संबंधित स्पष्टीकरण

> **यूजर का सवाल:** *"kyu kotlin likhe ho esmein kya jarurat hain batao?"*

**स्पष्टीकरण:**
1. **वेब मार्केटप्लेस में कोई Kotlin कोड की आवश्यकता नहीं है:** यह पूरा प्रोजेक्ट **Next.js 16 (React + TypeScript + Tailwind CSS)** आधारित ई-कॉमर्स वेब मार्केटप्लेस है।
2. **Kotlin फाइल्स क्यों बनी थीं?** पिछले एक टर्न में चैट में Android Jetpack Compose Push Notification Animation का प्रॉम्प्ट गलती से पेस्ट हो गया था, जिसे देखकर असिस्टेंट ने `docs/android/` फोल्डर में कुछ सैंपल Kotlin फाइल्स बना दी थीं।
3. **सफाई (Cleanup):** वेब प्रोजेक्ट को साफ और व्यवस्थित रखने के लिए उन सभी अप्रयुक्त `.kt` फाइलों को रिपोजिटरी से पूरी तरह हटा दिया गया है (`git rm -rf docs/android`). आपकी वेब ऐप 100% शुद्ध TypeScript/JavaScript स्टैक पर चल रही है।
