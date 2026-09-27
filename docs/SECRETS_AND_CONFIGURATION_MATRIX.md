# 🛡️ AALM VASTRALAY — SECRETS & CONFIGURATION MATRIX
# Classification: Confidentiality, Exposure Risk & Plaintext vs. Secret Architecture
# Location: docs/SECRETS_AND_CONFIGURATION_MATRIX.md

---

## 📌 1. परिचय व सुरक्षा सिद्धांत (Executive Summary)

आलम वस्त्रालय (Aalm Vastralay) एक आधुनिक, मल्टी-वेंडर एंटरप्राइज़ ई-कॉमर्स प्लेटफ़ॉर्म है। इस आर्किटेक्चर में सुरक्षा का सबसे पहला नियम है:

> **"कोई भी निजी सीक्रेट कभी भी गिट (Git), क्लाइंट-साइड ब्राउज़र कोड, या अनएन्क्रिप्टेड लॉग में नहीं जाना चाहिए।"**

Next.js में दो तरह के वेरिएबल्स होते हैं:
1. **Server-Only (गुप्त / Secret):** यह कोड केवल Vercel या Node.js बैकएंड सर्वर पर चलता है। यह कभी भी यूज़र के ब्राउज़र में डाउनलोड नहीं होता।
2. **Client-Exposed (`NEXT_PUBLIC_*` / Plain Text):** Next.js कंपाइलेशन के दौरान इन वेरिएबल्स को जावास्क्रिप्ट बंडल में एम्बेड कर देता है। ये ब्राउज़र के "View Source" या DevTools में सबके लिए दिखाई देते हैं। इसलिए इसमें **केवल पब्लिक जानकारी** ही रखी जानी चाहिए।

---

## 📊 2. सम्पूर्ण वर्गीकरण तालिका (Full Classification Matrix)

नीचे प्रोजेक्ट में इस्तेमाल होने वाले प्रत्येक वेरिएबल का स्पष्ट वर्गीकरण दिया गया है:

| वेरिएबल का नाम | प्रकार (Type) | कहाँ रन होता है? | रिस्क स्तर | क्या प्लेन-टेक्स्ट में सुरक्षित है? | स्टोर करने का स्थान |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `DATABASE_URL` | **SECRET** | Server-Only | 🔴 **CRITICAL** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `AUTH_SECRET` | **SECRET** | Server-Only | 🔴 **CRITICAL** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `ENCRYPTION_SECRET` | **SECRET** | Server-Only | 🔴 **CRITICAL** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `POW_SECRET` | **SECRET** | Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `ADMIN_PASSWORD` | **SECRET** | Server-Only | 🔴 **CRITICAL** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `BOOTSTRAP_TOKEN` | **SECRET** | Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `B2_KEY_ID` | **SECRET** | Cloudflare Edge | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Cloudflare Encrypted Secrets |
| `B2_APP_KEY` | **SECRET** | Cloudflare Edge | 🔴 **CRITICAL** | ❌ **नहीं (Strictly Private)** | Cloudflare Encrypted Secrets |
| `B2_BUCKET_ID` | **SECRET** | Cloudflare Edge | 🟡 **MEDIUM** | ❌ **नहीं (Strictly Private)** | Cloudflare Encrypted Secrets |
| `GAS_SECRET_TOKEN` | **SECRET** | Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `SHIPROCKET_PASSWORD`| **SECRET** | Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `DELHIVERY_API_KEY` | **SECRET** | Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `IMAGEKIT_PRIVATE_KEY`| **SECRET**| Server-Only | 🟠 **HIGH** | ❌ **नहीं (Strictly Private)** | Vercel Environment Variables |
| `NEXT_PUBLIC_SITE_URL`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Public Domain)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_APP_NAME`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Brand Name)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_BRAND_TAGLINE`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Slogan)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_SUPPORT_PHONE`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Customer Care)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Support No)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_SUPPORT_EMAIL`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Public Email)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_STORE_ADDRESS`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Physical Store)**| Vercel & `.env.example` |
| `NEXT_PUBLIC_STORE_CITY`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (City)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_STORE_PINCODE`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Pincode)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_STORE_GSTIN`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Tax Invoice)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_UPI_VPA` | **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Public UPI VPA)** | Vercel & `.env.example` |
| `NEXT_PUBLIC_UPI_PAYEE_NAME`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Merchant Name)**| Vercel & `.env.example` |
| `NEXT_PUBLIC_B2_WORKER_URL`| **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Public CDN URL)**| Vercel & `.env.example` |
| `NEXT_PUBLIC_USE_WSRV` | **PLAIN TEXT** | Client & Server | 🟢 **PUBLIC** | ✅ **हाँ (Flag "true")** | Vercel & `.env.example` |
| `COOKIE_SECURE` | **PLAIN TEXT** | Server Config | 🟢 **CONFIG** | ✅ **हाँ (Flag "true")** | Vercel & `.env.example` |
| `TRUST_PROXY` | **PLAIN TEXT** | Server Config | 🟢 **CONFIG** | ✅ **हाँ (Flag "true")** | Vercel & `.env.example` |
| `SKIP_SEED` | **PLAIN TEXT** | Server Config | 🟢 **CONFIG** | ✅ **हाँ (Flag "true")** | Vercel & `.env.example` |
| `ALLOW_DIRECT_DB` | **PLAIN TEXT** | Server Config | 🟢 **CONFIG** | ✅ **हाँ (Flag "false")** | Vercel & `.env.example` |

---

## 🔒 3. टियर 1: क्रिटिकल सीक्रेट्स (Tier 1: High-Security Secrets)

ये वे वेरिएबल्स हैं जो सिस्टम के दिल (Core Security) हैं। इन्हें **कभी भी गिट (Git), स्क्रीनशॉट या पब्लिक चैट** में शेयर नहीं किया जाना चाहिए:

### 1. `DATABASE_URL`
- **यह क्या है:** Neon PostgreSQL का Pooled कनेक्शन स्ट्रिंग।
- **लीक होने पर खतरा:** कोई भी व्यक्ति आपके डेटाबेस में सीधे घुसकर प्रोडक्ट्स, ऑर्डर्स और ग्राहकों का डेटा चुरा या डिलीट कर सकता है।
- **सुरक्षा नियम:** 
  - हमेशा `?sslmode=require` अनिवार्य रखें।
  - हमेशा `-pooler` वाला यूआरएल इस्तेमाल करें।
  - इसे केवल Vercel Dashboard के Environment Variables और अपने लोकल `.env.local` में रखें।

### 2. `AUTH_SECRET`
- **यह क्या है:** 64-अक्षरों का क्रिप्टोग्राफिक हेक्स-की, जिसका उपयोग यूज़र लॉगिन टोकन्स (HMAC SHA-256) को साइन करने के लिए किया जाता है।
- **लीक होने पर खतरा:** अटैकर नकली सुपर-एडमिन कुकी बनाकर पूरे स्टोर का कंट्रोल ले सकता है।
- **जनरेट करने का तरीका:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 3. `ENCRYPTION_SECRET`
- **यह क्या है:** डेटाबेस में संवेदनशील फ़ील्ड्स (जैसे थर्ड-पार्टी क्रेडेंशियल्स) को AES-256-GCM से सुरक्षित करने की मास्टर की।
- **लीक होने पर खतरा:** डेटाबेस की एन्क्रिप्टेड फ़ील्ड्स डिक्रिप्ट हो सकती हैं।
- **जनरेट करने का तरीका:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 4. `POW_SECRET`
- **यह क्या है:** हमारे इन-हाउस Click-to-Solve बॉट शील्ड (Proof-of-Work) का सीक्रेट सॉल्ट।
- **लीक होने पर खतरा:** बॉट्स बिना पहेली हल किए नकली वेरिफिकेशन टोकन जनरेट कर सकते हैं।

### 5. `B2_KEY_ID` & `B2_APP_KEY`
- **यह क्या है:** Backblaze B2 प्राइवेट स्टोरेज की मास्टर कीज़।
- **सुरक्षा नियम:**
  - ये कीज़ Vercel पर भी नहीं डाली जातीं!
  - ये सीधे Cloudflare Worker के एन्क्रिप्टेड सीक्रेट्स वॉल्ट (`wrangler secret put`) में स्टोर होती हैं।
  - हमारा ऑटोमेशन स्क्रिप्ट `scripts/setup-b2-worker.ps1` इसे सीधे पाइप करता है ताकि यह किसी फ़ाइल में भी न रहे।

---

## 📢 4. टियर 2: प्लेन-टेक्स्ट व पब्लिक कॉन्फ़िगरेशन (Tier 2: Plain Text Config)

ये वेरिएबल्स `NEXT_PUBLIC_*` से शुरू होते हैं। ये **प्लेन-टेक्स्ट में होना पूरी तरह सुरक्षित और स्वाभाविक** है:

### 1. स्टोर ब्रांडिंग व संपर्क (`NEXT_PUBLIC_APP_NAME`, `PHONE`, `EMAIL`, `ADDRESS`)
- **यह क्यों प्लेन-टेक्स्ट है:** क्योंकि यह जानकारी आपकी वेबसाइट के हेडर, फुटर, कॉन्टैक्ट पेज और जीएसटी इनवॉइस पर ग्राहकों को दिखाने के लिए ही होती है।
- **उदाहरण:**
  ```env
  NEXT_PUBLIC_APP_NAME="Aalm Vastralay"
  NEXT_PUBLIC_SUPPORT_PHONE="+91 98765 43210"
  NEXT_PUBLIC_STORE_CITY="Patna"
  ```

### 2. यूपीआई आईडी (`NEXT_PUBLIC_UPI_VPA` & `NEXT_PUBLIC_UPI_PAYEE_NAME`)
- **यह क्यों प्लेन-टेक्स्ट है:** जब ग्राहक चेकआउट पर Dynamic QR कोड स्कैन करता है, तो उसके Google Pay / PhonePe ऐप में UPI VPA (उदा. `merchant@upi`) और नाम दिखना आवश्यक होता है। यह मर्चेंट आईडी पब्लिक होती है।

### 3. क्लाउडफ्लेयर वर्कर CDN URL (`NEXT_PUBLIC_B2_WORKER_URL`)
- **यह क्यों प्लेन-टेक्स्ट है:** यह केवल इमेज डिलीवरी का पब्लिक CDN डोमेन है (उदा. `https://b2-proxy.marketplace.workers.dev`)। असली B2 कीज़ और बकेट अंदर वर्कर में सुरक्षित हैं।

---

## ⚙️ 5. टियर 3: सिस्टम रनटाइम स्विचेस (Tier 3: Runtime Switches)

ये टेक्निकल फ्लैग्स हैं जो सिस्टम के बिहेवियर को कंट्रोल करते हैं:

- **`COOKIE_SECURE="true"`**: ब्राउज़र को निर्देश देता है कि कुकीज़ केवल एन्क्रिप्टेड HTTPS कनेक्शन पर ही भेजें।
- **`TRUST_PROXY="true"`**: Vercel और Cloudflare के पीछे असली यूज़र IP पहचानने के लिए।
- **`SKIP_SEED="true"`**: प्रोडक्शन डेटाबेस में गलती से भी डमी टेस्ट डेटा जाने से रोकता है।
- **`ALLOW_DIRECT_DB="false"`**: बिना पूलर वाले डायरेक्ट कनेक्शन को रोकता है ताकि कनेक्शन एग्जॉस्ट न हो।
- **`NEXT_PUBLIC_USE_WSRV="true"`**: इमेज को स्वतः WebP/AVIF में कंप्रेस करने के लिए।

---

## 🛡️ 6. सुरक्षा लीकेज रोकथाम प्रोटोकॉल (Leak Prevention Checklist)

1. **कभी भी `.env` या `.env.local` को गिट में कमिट न करें:**
   - हमारा [`.gitignore`](../.gitignore) इसे 10 अलग-अलग लेयर्स पर ब्लॉक करता है।
2. **केवल `.env.example` को गिट में रखें:**
   - `.env.example` में कभी असली पासवर्ड या की न डालें। केवल सुरक्षित डमी वैल्यूज (`your_64_character_hex_string_here`) रखें।
3. **गिट हिस्ट्री में सीक्रेट्स स्कैनिंग:**
   - GitHub Secret Scanning और CodeQL हमेशा रिपॉजिटरी पर निगरानी रखते हैं।
4. **कीज़ रोटेशन (Key Rotation):**
   - यदि गलती से कोई की लीक हो जाए, तो Vercel Dashboard में जाकर उस की को तुरंत नई रैंडम स्ट्रिंग से रिप्लेस करें और **Redeploy** कर दें। 30 सेकंड में नई की लागू हो जाएगी।
