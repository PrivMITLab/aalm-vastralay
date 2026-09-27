# 👑 Backblaze B2 + Cloudflare Worker — Complete Setup Guide
**Location:** `docs/b2-cloudflare-setup.md`  
**Architecture:** Private B2 Bucket → Cloudflare Worker Proxy → Your App  
**Cost:** ₹0/month (Cloudflare Free + Backblaze Bandwidth Alliance = Zero egress fee)

---

## 📐 Architecture Overview (कैसे काम करता है)

```
Your App (Vercel)
      │
      ▼
NEXT_PUBLIC_B2_WORKER_URL
      │
      ▼
Cloudflare Worker (b2-proxy / aalm-b2-proxy)
 • Path traversal block
 • KV token cache (23h)
 • 401 auto-retry
 • 1-year immutable cache headers
      │
      ▼ (zero egress cost via Bandwidth Alliance)
Backblaze B2 Private Bucket
 • aalm-vastralay-media
 • Private (no public access)
 • Application Key (bucket-scoped)
```

**फायदे:**
- B2 bucket **private** रहता है — direct URL से कोई access नहीं कर सकता
- Cloudflare 300+ global PoPs से ultra-fast delivery
- Bandwidth Alliance के कारण B2↔Cloudflare egress = **$0**
- Browser को कभी B2 credentials या raw B2 URL नहीं दिखता

---

## 🅰️ PART 1 — Backblaze B2 Setup (B2 कॉन्फ़िगर करें)

### Step 1.1 — B2 Account बनाएं (Free)

1. जाएं: **[https://www.backblaze.com/b2/sign-up.html](https://www.backblaze.com/b2/sign-up.html)**
2. Email + Password से sign up करें — **कोई credit card नहीं चाहिए** (10GB free tier)
3. Email verify करें

---

### Step 1.2 — Private Bucket बनाएं

1. Login करने के बाद: **B2 Cloud Storage → Buckets → Create a Bucket**
2. Settings:
   - **Bucket Name:** `aalm-vastralay-media`
   - **Files in Bucket are:** `Private` ← ⚠️ यह जरूरी है
   - **Default Encryption:** `Disabled` (free tier)
   - **Object Lock:** `Disabled`
3. **Create Bucket** पर click करें

> [!IMPORTANT]
> Bucket को **Private** रखें। Public मत करें। Cloudflare Worker ही access करेगा।

---

### Step 1.3 — Application Key बनाएं (Bucket-Scoped)

1. **Account → App Keys → Add a New Application Key**
2. Settings:
   - **Name of Key:** `aalm-vastralay-worker-key`
   - **Allow access to Bucket(s):** `aalm-vastralay-media` ← सिर्फ इस bucket तक
   - **Type of Access:** `Read and Write`
   - **Allow List Files:** ✅ checked
   - **File name prefix:** *(खाली छोड़ें)*
   - **Duration:** *(खाली = permanent key)*
3. **Create New Key** पर click करें

> [!CAUTION]
> **अगला page एक बार ही key दिखाता है!** इन दोनों को तुरंत note कर लें:
> - `keyID` → यह है `B2_KEY_ID`
> - `applicationKey` → यह है `B2_APP_KEY`

**Note कहाँ करें:** Notepad में temporarily save करें (Notepad बंद मत करें जब तक Wrangler setup पूरा न हो)

---

### Step 1.4 — अपना B2 Endpoint Note करें

Bucket page पर जाएं → **Bucket Settings** → आपको दिखेगा:
```
Endpoint: s3.us-west-004.backblazeb2.com
```
यह URL आपको Step 3 में चाहिए होगा।

---

## 🅱️ PART 2 — Cloudflare Account Setup

### Step 2.1 — Cloudflare Account बनाएं (Free)

1. जाएं: **[https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)**
2. Email + Password → Sign up
3. Email verify करें
4. Plan: **Free** select करें (Workers free tier = 100,000 requests/day)

---

### Step 2.2 — Cloudflare Account ID Note करें

1. Cloudflare Dashboard → Right sidebar में **Account ID** दिखेगा
2. Copy करके note कर लें (बाद में काम आएगा)

---

## 🅲 PART 3 — Wrangler CLI Setup (अपने Computer पर)

### Step 3.1 — Wrangler Login करें

Project folder में terminal खोलें:

```bash
# Cloudflare CLI से login करें (browser खुलेगा)
npx wrangler login
```

> Browser में Cloudflare login page खुलेगा → **Allow** पर click करें → Terminal में `Successfully logged in` दिखेगा

---

### Step 3.2 — KV Namespace बनाएं (Token Cache के लिए)

```bash
npx wrangler kv namespace create B2_TOKEN_KV --config cloudflare-worker/wrangler-b2-proxy.toml
```

Output कुछ ऐसा दिखेगा:
```
✅ Successfully created namespace B2_TOKEN_KV
{ binding: 'B2_TOKEN_KV', id: 'abc123def456abc123def456abc123de' }
```

**`id` को copy करें** — अगले step में चाहिए।

---

### Step 3.3 — KV ID को `wrangler-b2-proxy.toml` में paste करें

[`cloudflare-worker/wrangler-b2-proxy.toml`](file:///e:/daily/aalm-vastralay-marketplace-development%20(1)/cloudflare-worker/wrangler-b2-proxy.toml) खोलें:

```toml
[[kv_namespaces]]
binding = "B2_TOKEN_KV"
id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"   # ← यहाँ paste करें
```

को बदलकर करें:
```toml
[[kv_namespaces]]
binding = "B2_TOKEN_KV"
id = "abc123def456abc123def456abc123de"   # ← आपका असली ID
```

---

### Step 3.4 — Bucket Name Confirm करें (पहले से set है)

[`cloudflare-worker/wrangler-b2-proxy.toml`](file:///e:/daily/aalm-vastralay-marketplace-development%20(1)/cloudflare-worker/wrangler-b2-proxy.toml) में पहले से है:

```toml
[vars]
B2_BUCKET_NAME = "aalm-vastralay-media"
```

अगर आपने अलग नाम रखा है तो यहाँ बदलें।

---

### Step 3.5 — B2 Secrets Securely Store करें

> [!CAUTION]
> ये commands interactive हैं — prompt आने पर key paste करें और Enter दबाएं। Key screen पर नहीं दिखती (secure input)।

```bash
# Secret 1: B2 Key ID (Step 1.3 में note किया था)
npx wrangler secret put B2_KEY_ID --config cloudflare-worker/wrangler-b2-proxy.toml
```
Prompt: `Enter a secret value:` → अपना `keyID` paste करें → Enter

```bash
# Secret 2: B2 Application Key (Step 1.3 में note किया था)
npx wrangler secret put B2_APP_KEY --config cloudflare-worker/wrangler-b2-proxy.toml
```
Prompt: `Enter a secret value:` → अपना `applicationKey` paste करें → Enter

---

### Step 3.6 — Worker Deploy करें

```bash
npx wrangler deploy --config cloudflare-worker/wrangler-b2-proxy.toml
```

Output:
```
✅ Deployed aalm-b2-proxy (X.XX sec)
   https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev
```

**Worker URL को copy करें** — अगला step इसी से होगा।

---

## 🅳 PART 4 — App Configuration (Project में URL जोड़ें)

### Step 4.1 — `.env.local` में Worker URL set करें

अपनी `.env.local` file खोलें (project root में):

```bash
# B2 Worker URL (Cloudflare से मिला URL)
NEXT_PUBLIC_B2_WORKER_URL="https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev"
```

> `.env.local` already `.gitignore` में है — यह git में commit नहीं होगा।

---

### Step 4.2 — Vercel में Environment Variable set करें (Production के लिए)

1. जाएं: **[https://vercel.com/dashboard](https://vercel.com/dashboard)**
2. अपना project → **Settings → Environment Variables**
3. Add करें:
   - **Name:** `NEXT_PUBLIC_B2_WORKER_URL`
   - **Value:** `https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev`
   - **Environments:** Production + Preview + Development (सभी check)
4. **Save** → Project को Redeploy करें (`git push origin main` या Vercel dashboard से)

---

## ✅ PART 5 — Testing (जांच करें)

### Step 5.1 — Worker Health Check

```bash
# 1. Invalid key → 404 आना चाहिए
curl -I "https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev/non-existent.jpg"
# Expected: HTTP/2 404

# 2. Path traversal block → 404 आना चाहिए
curl -I "https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev/../secret.env"
# Expected: HTTP/2 404

# 3. Method check → 405 आना चाहिए
curl -X POST "https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev/test.jpg"
# Expected: HTTP/2 405

# 4. Real file test (पहले B2 में एक test file upload करें)
curl -I "https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev/test/logo.png"
# Expected: HTTP/2 200, X-Served-From: backblaze-b2-cloudflare-proxy
```

### Step 5.2 — B2 में Test File Upload करें

1. Backblaze Dashboard → **Buckets → aalm-vastralay-media → Upload File**
2. कोई भी image upload करें (e.g. `test/logo.png`)
3. फिर ऊपर Step 5.1 का command #4 run करें

### Step 5.3 — App में Image Test करें

Admin Panel → Banner Editor में B2 Worker URL से image URL बनाएं:
```
https://aalm-b2-proxy.YOUR-ACCOUNT.workers.dev/products/saree-001.jpg
```

---

## 📁 PART 6 — File Upload करना (B2 में)

### Option A — Backblaze Web Dashboard (आसान)
1. Dashboard → Buckets → aalm-vastralay-media → **Upload**
2. Files select करें → Upload

### Option B — B2 CLI (Bulk Upload के लिए)

```bash
# B2 CLI install करें (एक बार)
pip install b2

# Login करें
b2 authorize-account YOUR_KEY_ID YOUR_APP_KEY

# Single file upload
b2 upload-file aalm-vastralay-media ./local-image.jpg products/saree-001.jpg

# Folder sync करें (bulk)
b2 sync ./local-images-folder b2://aalm-vastralay-media/products/
```

### Option C — App के Admin Panel से (Mirror)
Admin Panel → Products → किसी product की image पर **"Mirror to B2"** button

---

## 🗂️ Recommended B2 Folder Structure (फोल्डर संरचना)

```
aalm-vastralay-media/
├── products/          # Product images
│   ├── saree-001.jpg
│   ├── lehenga-002.jpg
│   └── ...
├── banners/           # Hero carousel banners
│   ├── slide-1.jpg
│   └── ...
├── brands/            # Store/brand logos
│   └── ...
├── categories/        # Category thumbnails
│   └── ...
└── uploads/           # User uploaded content (if any)
    └── ...
```

---

## 🔒 Security Summary (सुरक्षा का सारांश)

| Feature | Status |
|---|---|
| B2 Bucket Private | ✅ Private (no public access) |
| Application Key Scoped | ✅ Bucket-specific key only |
| Credentials in Cloudflare Secrets | ✅ Never in code or git |
| Path Traversal Protection | ✅ `..` and hidden files blocked |
| Token Caching (KV) | ✅ 23-hour cache, auto-refresh on 401 |
| Immutable Edge Caching | ✅ 1 year, 300+ global PoPs |
| Zero Egress Cost | ✅ Bandwidth Alliance = ₹0 |
| Video Seeking (206) | ✅ Range headers forwarded |
| 50MB Video Cap | ✅ Oversized videos rejected cleanly |
| CORS | ✅ `Access-Control-Allow-Origin: *` |

---

## 🐛 Troubleshooting (समस्या निवारण)

### समस्या: Worker `502` दे रहा है
```bash
# Secrets check करें
npx wrangler secret list --config cloudflare-worker/wrangler-b2-proxy.toml
# B2_KEY_ID और B2_APP_KEY दोनों list में होने चाहिए
```
अगर missing हैं → Step 3.5 दोबारा करें।

### समस्या: `404` हर file पर आ रहा है
- `B2_BUCKET_NAME` check करें — exact match होना चाहिए
- B2 bucket में file actually exists करती है कि नहीं check करें

### समस्या: Images app में नहीं दिख रही
- `NEXT_PUBLIC_B2_WORKER_URL` में trailing slash नहीं होनी चाहिए
- `.env.local` update के बाद `npm run dev` restart करें
- Vercel पर update किया है?

### समस्या: `wrangler login` browser नहीं खुल रहा
```bash
# Alternative: API Token से login करें
# Cloudflare Dashboard → Profile → API Tokens → Create Token
# Template: "Edit Cloudflare Workers"
CLOUDFLARE_API_TOKEN="your-token" npx wrangler deploy --config cloudflare-worker/wrangler-b2-proxy.toml
```

---

## 📊 Free Tier Limits (मुफ्त में कितना मिलता है)

| Service | Free Limit | आपका Use Case |
|---|---|---|
| Backblaze B2 Storage | **10 GB** | ~5,000-10,000 product images |
| Backblaze B2 Download | **₹0** via Bandwidth Alliance | Unlimited via Cloudflare |
| Cloudflare Workers | **100,000 requests/day** | हजारों page views |
| Cloudflare KV | **100,000 reads/day** | Token cache = 1 read/23 hours |
| Cloudflare Workers CPU | **10ms per request** | Image proxy = ~1-2ms ✅ |

> [!TIP]
> 10GB से ज्यादा storage चाहिए? B2 में extra storage सिर्फ **\$0.006/GB/month** (₹0.50/GB) — बहुत सस्ता।

---

## 🔗 Quick Reference Links

| Resource | URL |
|---|---|
| Backblaze Dashboard | https://secure.backblaze.com/b2_buckets.htm |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Cloudflare Workers | https://dash.cloudflare.com/workers |
| Wrangler Docs | https://developers.cloudflare.com/workers/wrangler/ |
| B2 Native API Docs | https://www.backblaze.com/apidocs/introduction-to-the-b2-native-api |

---

*Last updated: 2026-09-27 | Guide version: 2.0*
