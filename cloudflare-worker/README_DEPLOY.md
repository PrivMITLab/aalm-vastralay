# 🚀 Cloudflare Worker B2 Proxy — 8-Step Deployment Guide (डिप्लॉयमेंट गाइड)
Location: `cloudflare-worker/README_DEPLOY.md`

यह वर्कर **Backblaze B2 Private Bucket** की फाइल्स को **$0 Egress Bandwidth Alliance** के जरिए सर्व करता है, जिससे इमेज और वीडियो सीधे दुनिया भर के 300+ Cloudflare Edge PoPs से अल्ट्रा-फास्ट स्पीड में लोड होती हैं।

---

### 📋 8-Step Deployment Checklist (चरण-दर-चरण प्रक्रिया)

#### चरण 1: Cloudflare CLI में लॉगिन करें (Login to Cloudflare)
टर्मिनल में `cloudflare-worker` डायरेक्टरी में जाएं और लॉगिन करें:
```bash
cd cloudflare-worker
npx wrangler login
```

#### चरण 2: B2 Auth टोकन के लिए KV Namespace बनाएं (Create KV Namespace)
B2 के 23-घंटे वाले ऑथेंटिकेशन टोकन को एज पर कैश करने के लिए KV बनाएं:
```bash
npx wrangler kv namespace create B2_TOKEN_KV
```
टर्मिनल पर जो `id` प्रिंट होगी (e.g. `id = "a1b2c3d4e5f6..."`), उसे कॉपी कर लें।

#### चरण 3: `wrangler-b2-proxy.toml` में Bucket और KV ID सेट करें (Configure Config)
`cloudflare-worker/wrangler-b2-proxy.toml` फाइल खोलें:
1. `B2_BUCKET_NAME` में अपना असली B2 बकेट नाम डालें (e.g. `"aalm-vastralay-media"`).
2. `[[kv_namespaces]]` के अंदर `id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"` को असली KV ID से बदलें।

#### चरण 4: Secret 1 सेट करें — B2 Key ID (Set B2_KEY_ID Secret)
Backblaze B2 Console -> App Keys से अपनी Key ID लें और सुरक्षित रूप से स्टोर करें:
```bash
npx wrangler secret put B2_KEY_ID --config wrangler-b2-proxy.toml
```
*प्रॉम्प्ट आने पर अपनी Backblaze `keyID` पेस्ट करें और Enter दबाएं।*

#### चरण 5: Secret 2 सेट करें — B2 Application Key (Set B2_APP_KEY Secret)
Backblaze B2 की सीक्रेट एप्लीकेशन की डालें:
```bash
npx wrangler secret put B2_APP_KEY --config wrangler-b2-proxy.toml
```
*प्रॉम्प्ट आने पर अपनी `applicationKey` पेस्ट करें और Enter दबाएं।*

#### चरण 6: वर्कर को Cloudflare पर डिप्लॉय करें (Deploy Worker)
अब वर्कर को प्रोडक्शन में लाइव पब्लिश करें:
```bash
npx wrangler deploy --config wrangler-b2-proxy.toml
```
डिप्लॉय होने के बाद Cloudflare आपको लाइव URL देगा:
`https://aalm-b2-proxy.alamwastraly.workers.dev`

#### चरण 7: curl से लाइव वर्कर की जांच करें (Verify with curl)
टर्मिनल में टेस्ट करें कि वर्कर ठीक से रिस्पॉन्ड कर रहा है:
```bash
# 1. Root / Invalid key test (Must return 404 Not Found)
curl -I https://aalm-b2-proxy.alamwastraly.workers.dev/non-existent.jpg

# 2. Key traversal block test (Must return 404 Not Found)
curl -I https://aalm-b2-proxy.alamwastraly.workers.dev/../secret.env

# 3. Live asset test (Must return 200 OK with X-Served-From header)
curl -I https://aalm-b2-proxy.alamwastraly.workers.dev/brand/logo.png
```

#### चरण 8: Vercel में Environment Variable सेट करें (Configure Vercel)
Vercel Dashboard -> Project Settings -> Environment Variables में जाएं और जोड़ें:
- **Key:** `NEXT_PUBLIC_B2_WORKER_URL`
- **Value:** `https://aalm-b2-proxy.alamwastraly.workers.dev`

अब Vercel पर प्रोजेक्ट को रिडिप्लॉय करें (`git push origin main` or Vercel Redeploy).

---

### 🔍 HTTP Status Code & Diagnostics Matrix (स्टेटस कोड का अर्थ)

| Status Code | Meaning | Cause (कारण) | Action (समाधान) |
|---|---|---|---|
| **`200 OK`** | Media served successfully | फाइल B2 से सफलतापूर्वक स्ट्रीम और कैश हुई | सब सही है (Normal) |
| **`206 Partial Content`** | Video range seeked | HTML5 Video प्लेयर ने बाइट-रेंज मांगी थी | सीकिंग सही काम कर रही है |
| **`404 Not Found`** | Asset does not exist | B2 बकेट में यह फाइल नहीं है या पाथ में `..` था | बकेट में फाइल का नाम जांचें |
| **`405 Method Not Allowed`** | Invalid HTTP method | GET/HEAD के अलावा POST/PUT भेजा गया | केवल GET या HEAD रिक्वेस्ट भेजें |
| **`502 Bad Gateway`** | Missing env or B2 error | B2 credentials गलत हैं, बकेट का नाम गलत है, या वीडियो >50MB है | `wrangler-b2-proxy.toml` और सीक्रेट्स चेक करें |

---

### 🛡️ Production Hardening Features Implemented:
- **Fail-Fast Startup Validation:** अगर `B2_BUCKET_NAME`, `B2_KEY_ID`, या `B2_APP_KEY` गायब हैं, तो वर्कर तुरंत 502 के साथ सटीक मिसिंग वेरिएबल का नाम बताता है।
- **Automatic 401 Re-Auth & Retry:** टोकन एक्सपायर होने पर वर्कर मेमोरी और KV कैश को क्लियर करके बैकब्लेज से तुरंत नया टोकन लेता है और रिक्वेस्ट को एक बार दोबारा ट्राई करता है (`X-Retry: 1` हेडर के साथ)।
- **Video Seeking Support (206):** MP4 और WebM वीडियो के लिए `Range`, `Accept-Ranges: bytes`, और `Content-Range` हेडर को सही तरीके से फॉरवर्ड करता है।
- **50MB Worker Memory Ceiling:** 50MB से बड़े वीडियो के लिए स्पष्ट JSON एरर देता है ताकि बड़े वीडियो को सीधे B2 स्टोरेज से स्ट्रीम किया जा सके।
