# 🌐 Backblaze B2 CORS Configuration Runbook (हिंदी गाइड)
Location: `docs/B2_CORS.md`

### ❓ समस्या क्या है? (Why does Direct Upload fail?)
Aalm Vastralay में जब कोई सेलर या एडमिन प्रोडक्ट इमेज, लोगो या बैनर अपलोड करता है, तो फाइल **Vercel Serverless payload limit (4.5MB)** को बायपास करने के लिए सीधे ब्राउज़र से **Backblaze B2 Private Bucket** में स्ट्रीम होती है (`uploadToB2` in `src/lib/upload-client.ts`).

ब्राउज़र सिक्योरिटी के नियम (Cross-Origin Resource Sharing — CORS) के अनुसार, अगर Backblaze B2 बकेट में आपकी वेबसाइट का डोमेन allowlisted नहीं है, तो ब्राउज़र अपलोड रिक्वेस्ट को ब्लॉक कर देता है और कंसोल में लाल एरर दिखता है:
```text
Access to fetch at 'https://pod-xxx.backblazeb2.com/b2api/v2/b2_upload_file/...' 
from origin 'https://aalm-vastralay.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check.
```

कोड अपने आप Backblaze B2 के अंदर CORS रूल्स नहीं लिख सकता। इसे Backblaze Console या CLI से एक बार सेट करना अनिवार्य है।

---

### 🛠️ विधि 1: Backblaze Web Console से CORS सेट करें (सबसे आसान / Recommended)

1. [Backblaze B2 Console](https://secure.backblaze.com/b2_buckets.htm) में लॉगिन करें।
2. **Buckets** सेक्शन में जाएं और अपनी बकेट (उदा. `aalm-vastralay-media`) खोजें।
3. बकेट के दाईं ओर **Bucket Settings** (या **Lifecycle Rules / CORS Rules**) लिंक पर क्लिक करें।
4. **CORS Rules** सेक्शन में **Custom CORS Rules** चुनें और नीचे दिया गया JSON पेस्ट कर दें:

```json
[
  {
    "corsRuleName": "aalm-vastralay-direct-uploads",
    "allowedOrigins": [
      "https://aalm-vastralay.vercel.app",
      "https://aalmvastralay.in",
      "https://www.aalmvastralay.in",
      "http://localhost:3000"
    ],
    "allowedOperations": [
      "b2_upload_file",
      "b2_upload_part"
    ],
    "allowedHeaders": [
      "authorization",
      "content-type",
      "content-length",
      "x-bz-file-name",
      "x-bz-content-sha1"
    ],
    "exposeHeaders": [
      "x-bz-content-sha1",
      "x-bz-file-name",
      "x-bz-file-id"
    ],
    "maxAgeSeconds": 3600
  },
  {
    "corsRuleName": "aalm-vastralay-public-reads",
    "allowedOrigins": [
      "*"
    ],
    "allowedOperations": [
      "b2_download_file_by_id",
      "b2_download_file_by_name"
    ],
    "allowedHeaders": [
      "range"
    ],
    "exposeHeaders": [
      "content-range",
      "accept-ranges"
    ],
    "maxAgeSeconds": 86400
  }
]
```
5. **Update Bucket** बटन पर क्लिक करें। बदलाव तुरंत लागू हो जाते हैं।

---

### 💻 विधि 2: Backblaze CLI से CORS सेट करें (For Developers / DevOps)

अगर आपके पास `b2-cli` इंस्टॉल है, तो आप एक कमांड से इसे सेट कर सकते हैं:

#### 1. CORS फाइल बनाएं (`b2_cors.json`):
```json
[
  {
    "corsRuleName": "aalm-vastralay-direct-uploads",
    "allowedOrigins": [
      "https://aalm-vastralay.vercel.app",
      "https://aalmvastralay.in",
      "https://www.aalmvastralay.in",
      "http://localhost:3000"
    ],
    "allowedOperations": [
      "b2_upload_file",
      "b2_upload_part"
    ],
    "allowedHeaders": [
      "authorization",
      "content-type",
      "content-length",
      "x-bz-file-name",
      "x-bz-content-sha1"
    ],
    "exposeHeaders": [
      "x-bz-content-sha1"
    ],
    "maxAgeSeconds": 3600
  }
]
```

#### 2. बकेट अपडेट करें:
```bash
# लॉगिन करें:
b2 authorize-account <your_key_id> <your_app_key>

# बकेट में CORS रूल्स अप्लाई करें:
b2 update-bucket --corsRules "$(cat b2_cors.json)" aalm-vastralay-media allPrivate
```

---

### 🚨 Browser Console Symptom ↔ Solution Diagnostic Table

| Browser Console Error (सम्पर्क / लक्षण) | Root Cause (असली कारण) | Solution (निवारण) |
|---|---|---|
| `Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header` | B2 बकेट में `allowedOrigins` खाली है या आपका Vercel डोमेन उसमें शामिल नहीं है। | B2 Console -> Bucket Settings में जाकर `https://aalm-vastralay.vercel.app` को `allowedOrigins` में जोड़ें। |
| `Request header field x-bz-file-name is not allowed by Access-Control-Allow-Headers` | Backblaze के कस्टम हेडर्स (`x-bz-file-name`, `x-bz-content-sha1`) CORS में allowlisted नहीं हैं। | CORS JSON के `allowedHeaders` में `"x-bz-file-name"` और `"x-bz-content-sha1"` जोड़ें। |
| `Failed to obtain upload authorization` (Status 401) | यूजर लॉग-इन नहीं है या उसका रोल `seller` या `admin` नहीं है। | सेलर या एडमिन अकाउंट से लॉग इन करके अपलोड करें। |
| `Upload failed with status: 401 / 403` on Backblaze upload URL | B2 Application Key के पास `writeFiles` की परमिशन नहीं है, या बकेट ID गलत है। | Backblaze Console -> App Keys में जाएं और ऐसी की (key) बनाएं जिसके पास `Read and Write` परमिशन हो। |
| `404 Not Found` on `/api/upload/direct-fallback` | लोकल या प्रिव्यू वातावरण में B2 क्रेडेंशियल्स न होने पर फॉलबैक एंडपॉइंट मिसिंग था। | `src/app/api/upload/direct-fallback/route.ts` अब एक्टिव है और लोकल डिस्क पर फाइल सेव करता है। |
| Broken image icon on product cards | Cloudflare Worker URL गलत सबडोमेन (`aalm-b2-proxy.workers.dev`) पर पॉइंट कर रहा था। | अब सही सबडोमेन `https://aalm-b2-proxy.alamwastraly.workers.dev` सेट हो चुका है और साथ में `wsrv.nl` का ऑटोमैटिक रेजिलिएंट फॉलबैक भी एक्टिव है। |
