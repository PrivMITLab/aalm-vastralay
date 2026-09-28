# 👑 Backblaze B2 + Cloudflare Worker — Setup Guide
**Location:** `docs/b2-cloudflare-setup.md`

> **TL;DR:** Sab kuch ek command mein ho jaata hai. Neeeche dekho.

---

## ⚡ One-Command Setup

### Windows (PowerShell)
```powershell
pwsh scripts/setup-b2-worker.ps1
```

### Mac / Linux (Bash)
```bash
bash scripts/setup-b2-worker.sh
```

**Script automatically karta hai:**
1. ✅ Cloudflare login check (agar nahi hai to browser mein open karta hai)
2. ✅ KV Namespace create (agar nahi hai to) — `B2_TOKEN_KV`
3. ✅ `wrangler-b2-proxy.toml` auto-update (account_id + KV id)
4. ✅ B2_KEY_ID + B2_APP_KEY **securely** prompt karke Cloudflare encrypted secrets mein store
5. ✅ Worker deploy → URL milta hai
6. ✅ `.env.local` auto-update with Worker URL

**Koi bhi credential file mein save nahi hoti. Ever.**

---

## 🅰️ Pehle Kya Chahiye (Pre-requisites)

Script run karne se **pehle** sirf yeh 2 cheezein chahiye:

### 1. Backblaze B2 Account + Private Bucket + App Key

| Step | Kya karna hai |
|---|---|
| [Sign Up](https://www.backblaze.com/b2/sign-up.html) | Free account banaaen (credit card nahi) |
| Bucket banaaen | **Buckets → Create Bucket** → Name: `aalm-vastralay-media` → **Private** |
| App Key banaaen | **Account → App Keys → Add New** → Bucket: `aalm-vastralay-media` → Read+Write |
| Keys note karein | `keyID` = `B2_KEY_ID` / `applicationKey` = `B2_APP_KEY` |

> [!CAUTION]
> App Key **sirf ek baar** dikhta hai Backblaze par. Note kar lein warna dobara banana padega.

> [!IMPORTANT]
> Bucket **Private** rakhen. Public mat karein. Worker hi access karega.

### 2. Cloudflare Account

[cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) par Free account — koi credit card nahi.

---

## 🚀 Script Run Karein

```powershell
# Windows
pwsh scripts/setup-b2-worker.ps1
```

Script step-by-step guide karega:

```
🔹 Checking Wrangler CLI...
   ✅ Wrangler found: wrangler 4.135.0

🔹 Checking Cloudflare login...
   ✅ Logged in | Account ID: ff744537...

🔹 Checking KV Namespace (B2_TOKEN_KV)...
   ✅ KV Namespace created: edb6eeb2...

🔹 Updating wrangler-b2-proxy.toml...
   ✅ Updated (account_id + KV id)

🔹 Setting Backblaze B2 Secrets...
   Backblaze B2 Console → App Keys:
   https://secure.backblaze.com/app_keys.htm

   Enter B2_KEY_ID: ████████████████  ← Type karo, screen par nahi dikhega
   ✅ B2_KEY_ID stored securely in Cloudflare

   Enter B2_APP_KEY: ████████████████
   ✅ B2_APP_KEY stored securely in Cloudflare

🔹 Deploying Cloudflare Worker...
   ✅ Worker deployed: https://aalm-b2-proxy.alamwastraly.workers.dev

🔹 Updating .env.local...
   ✅ .env.local updated
```

---

## 📌 Script ke Baad — Vercel mein URL set karein

Yeh ek manual step hai (Vercel Dashboard login ke liye):

1. [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → **Settings → Environment Variables**
2. Add karein:
   - **Name:** `NEXT_PUBLIC_B2_WORKER_URL`
   - **Value:** `https://aalm-b2-proxy.alamwastraly.workers.dev` *(script ne bata diya hoga)*
   - **Environments:** ✅ Production ✅ Preview ✅ Development
3. **Save** → Vercel project redeploy (`git push` ya dashboard se)

---

## 🔄 Script Options

```powershell
# Normal full setup (pehli baar)
pwsh scripts/setup-b2-worker.ps1

# Sirf redeploy (B2 keys already set hain)
pwsh scripts/setup-b2-worker.ps1 -SkipSecrets

# Sirf B2 keys update karna hai
pwsh scripts/setup-b2-worker.ps1 -OnlySecrets
```

```bash
# Mac/Linux equivalents
bash scripts/setup-b2-worker.sh
bash scripts/setup-b2-worker.sh --skip-secrets
bash scripts/setup-b2-worker.sh --only-secrets
```

---

## ✅ Test Karein

Script complete hone ke baad:

```powershell
# 1. Invalid file → 404 aana chahiye
Invoke-WebRequest "https://aalm-b2-proxy.alamwastraly.workers.dev/no-such-file.jpg" -ErrorAction SilentlyContinue | Select-Object StatusCode

# 2. Path traversal → 404 aana chahiye
Invoke-WebRequest "https://aalm-b2-proxy.alamwastraly.workers.dev/../secret" -ErrorAction SilentlyContinue | Select-Object StatusCode

# 3. POST method → 405 aana chahiye
Invoke-WebRequest -Method POST "https://aalm-b2-proxy.alamwastraly.workers.dev/test.jpg" -ErrorAction SilentlyContinue | Select-Object StatusCode
```

Real file test ke liye: Backblaze Dashboard → Bucket → Upload koi bhi image → phir:
```powershell
Invoke-WebRequest "https://aalm-b2-proxy.alamwastraly.workers.dev/your-image.jpg" | Select-Object StatusCode, Headers
# Expected: 200, X-Served-From: backblaze-b2-cloudflare-proxy
```

---

## 📁 B2 Bucket mein Files Upload Karna

### Option A — Backblaze Web Dashboard (Recommended for first upload)
Dashboard → Buckets → `aalm-vastralay-media` → **Upload**

### Option B — Admin Panel se Mirror (Existing URLs ke liye)
Admin → Products → Image ke neeche **"Mirror to B2"** button

### Option C — B2 CLI (Bulk upload ke liye)
```bash
pip install b2
b2 authorize-account YOUR_KEY_ID YOUR_APP_KEY
b2 sync ./local-images/ b2://aalm-vastralay-media/products/
```

### Recommended Folder Structure
```
aalm-vastralay-media/
├── products/     ← Product images
├── banners/      ← Hero carousel banners
├── categories/   ← Category thumbnails
└── brands/       ← Store logos
```

---

## 🔒 Security Architecture

| Kya | Kahan store hota hai | Secret hai? |
|---|---|---|
| `B2_KEY_ID` | Cloudflare Encrypted Secrets | ✅ Haan — script ke alawa kahi nahi |
| `B2_APP_KEY` | Cloudflare Encrypted Secrets | ✅ Haan — script ke alawa kahi nahi |
| `account_id` | `wrangler-b2-proxy.toml` | ❌ Nahi — public identifier |
| `KV namespace id` | `wrangler-b2-proxy.toml` | ❌ Nahi — public identifier |
| `NEXT_PUBLIC_B2_WORKER_URL` | `.env.local` + Vercel | ❌ Nahi — public URL |

> [!NOTE]
> `account_id` aur `KV namespace id` Cloudflare ke public non-secret identifiers hain — inhe commit karna safe hai.

---

## 🐛 Troubleshooting

| Samasya | Karan | Samadhan |
|---|---|---|
| `Worker not found` error | Pehle deploy nahi hua | `pwsh scripts/setup-b2-worker.ps1 -SkipSecrets` |
| Worker `502` deta hai | B2 keys missing/wrong | `pwsh scripts/setup-b2-worker.ps1 -OnlySecrets` |
| Images nahi dikh rahi | Worker URL wrong | `.env.local` mein URL check karein |
| `404` sab files par | Bucket name mismatch | `B2_BUCKET_NAME` in `wrangler-b2-proxy.toml` check |
| Wrangler login nahi hua | Browser block | `CLOUDFLARE_API_TOKEN=xxx npx wrangler deploy --config cloudflare-worker/wrangler-b2-proxy.toml` |

---

## 📊 Free Tier Limits & Zero Class C Optimization

| Service / Resource | Free Limit | Hamara Optimization |
|---|---|---|
| Backblaze B2 Storage | **10 GB** | High-efficiency WebP/AVIF compression |
| B2 Download via Cloudflare | **₹0** (Bandwidth Alliance) | Cloudflare CDN Edge Cache (1-year immutable) |
| Cloudflare Workers requests | **100,000/day** | 0 cost global media streaming |
| Cloudflare KV reads | **100,000/day** | 23-hour B2 download token caching |
| B2 Class C Transactions | **2,500/day** | **0 calls on listing!** Cached in Neon DB (`media_assets`) |

### 🛡️ How We Eliminated Class C Quota Exhaustion
1. **Database Caching:** All uploaded files and their unique B2 `fileId` are saved in Neon PostgreSQL. Browsing media or rendering galleries calls PostgreSQL directly with **zero calls to B2**.
2. **Hard Permanent Delete:** We call `b2_delete_file_version` using the stored `fileId`, immediately purging files without creating hidden tombstone markers.
3. **B2 Lifecycle Rule (Crucial One-Time Step):**
   - Backblaze Dashboard me jaayein: **Buckets → aalm-vastralay-media → Lifecycle Rules**.
   - Rule select karein: **Custom Lifecycle Rule**.
   - **Days from hiding to deleting:** `1` set karein.
   - Yeh rule kisi bhi accidental hidden version ko 24 ghante me delete kar deta hai.

## 🔗 Links

| | |
|---|---|
| Backblaze Dashboard | https://secure.backblaze.com/b2_buckets.htm |
| Cloudflare Workers Dashboard | https://dash.cloudflare.com/workers |
| Wrangler Docs | https://developers.cloudflare.com/workers/wrangler/ |

---

*Last updated: 2026-09-27 | Script version: 2.0*
