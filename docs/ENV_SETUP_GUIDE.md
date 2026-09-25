# 🔐 Aalm Vastralay — सम्पूर्ण `.env` (Environment Variables) गाइड

यह गाइड केवल और केवल **`.env` (Environment Variables)** के लिए बनाई गई है। इसमें आप देखेंगे कि:
- कौन-सा वेरिएबल **क्या काम करता है**?
- वह **कहाँ से मिलेगा (Website/Console)**?
- Neon, ImageKit आदि का **स्क्रीन कैसा दिखेगा और कहाँ क्लिक करके कॉपी करना है**?
- कौन-सा वेरिएबल **अनिवार्य (Must-Have)** है और कौन-सा **वैकल्पिक (Optional)** है?

---

## 📑 विषय-सूची (Quick Links)
1. [⚡ केवल 3 लाइनें चाहिए तुरंत चलाने के लिए (Quick Start)](#1-quick-start)
2. [🖥️ Neon PostgreSQL से `DATABASE_URL` कैसे लाएं? (स्क्रीन कैसी दिखेगी)](#2-neon-guide)
3. [🔑 `AUTH_SECRET` और `ENCRYPTION_SECRET` कैसे बनाएं?](#3-secrets-guide)
4. [🖼️ ImageKit (मुफ़्त फ़ोटो अपलोड) कैसे सेट करें? (स्क्रीन कैसी दिखेगी)](#4-imagekit-guide)
5. [🌐 डोमेन व कुकीज़ वेरिएबल्स](#5-domain-cookie-guide)
6. [📋 संपूर्ण रेडी-टू-कॉपी `.env.local` फ़ाइल](#6-ready-env-template)

---

<a id="1-quick-start"></a>
## ⚡ 1. केवल 3 लाइनें चाहिए तुरंत चलाने के लिए (Quick Start)

यदि आप अभी तुरंत पूरी वेबसाइट (होमपेज, प्रोडक्ट, साइज गाइड, पिनकोड, कार्ट, चेकआउट, सुपर एडमिन और सेलर पोर्टल) लाइव चलाना चाहते हैं, तो आपको केवल ये **3 अनिवार्य वेरिएबल्स** चाहिए:

```env
# 1. डेटाबेस (Neon से)
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxx@ep-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# 2. लॉगिन सेशन सुरक्षा (32-अक्षर रैंडम की)
AUTH_SECRET="e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15"

# 3. डेटाबेस AES-256 एन्क्रिप्शन
ENCRYPTION_SECRET="7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6"
```
*(बाकी सभी वेरिएबल्स के लिए सिस्टम में पहले से स्मार्ट डिफ़ॉल्ट्स लगे हैं!)*

---

<a id="2-neon-guide"></a>
## 🖥️ 2. Neon PostgreSQL से `DATABASE_URL` कैसे लाएं?

[Neon.tech](https://neon.tech/) दुनिया का सबसे तेज़ सर्वरलेस PostgreSQL डेटाबेस है और यह **0.5 GB (500 MB) हमेशा के लिए मुफ़्त** देता है।

### 📌 स्टेप-बाय-स्टेप गाइड (कहाँ जाएं और कैसा दिखेगा):

1. **वेबसाइट खोलें:** अपने ब्राउज़र में [https://neon.tech](https://neon.tech) खोलें और **Sign Up** पर क्लिक करें (आप Google या GitHub से 1 क्लिक में लॉगिन कर सकते हैं)।
2. **नया प्रोजेक्ट बनाएं (Create Project):**
   * स्क्रीन पर हरा/नीला बटन दिखेगा: **"Create Project"**। उस पर क्लिक करें।
   * **Project Name:** लिखें `aalm-vastralay`
   * **Postgres version:** `16` (डिफ़ॉल्ट रहने दें)
   * **Region (सबसे महत्वपूर्ण):** भारत के लिए **`Asia-Pacific (Mumbai) - ap-south-1`** चुनें। इससे वेबसाइट बिहार व पूरे भारत में पलक झपकते खुलेगी।
3. **स्क्रीन कैसी दिखेगी (Dashboard View):**
   * प्रोजेक्ट बनते ही स्क्रीन पर एक काला/ग्रे बॉक्स दिखेगा जिस पर लिखा होगा:
     ```text
     Connection Details
     [ PostgreSQL ]  [ psql ]  [ Pooled connection ✓ ]
     ```
   * वहाँ ड्रॉपडाउन में **Connection string** चुनी होगी जो इस तरह दिखेगी:
     ```text
     postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-flower-a1b2c3d4-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require
     ```
   * इसके ठीक दाईं तरफ एक **"Copy" (कॉपी आइकन)** का बटन होगा। उस पर क्लिक करें।
4. **`.env.local` में पेस्ट करें:**
   फ़ाइल में लिखें:
   ```env
   DATABASE_URL="यहाँ_कॉपी_किया_हुआ_URL_पेस्ट_करें"
   ```

---

<a id="3-secrets-guide"></a>
## 🔑 3. `AUTH_SECRET` और `ENCRYPTION_SECRET` कैसे बनाएं?

यह आपकी वेबसाइट के लॉगिन कुकीज़ और ग्राहकों के डेटा को हैकर्स से बचाने वाली एन्क्रिप्शन चाबी (Key) है। इसे कहीं से खरीदना या किसी वेबसाइट पर जाना नहीं पड़ता, आप अपने कंप्यूटर पर 1 सेकंड में बना सकते हैं:

### 📌 कैसे बनाएं:
अपने कंप्यूटर में टर्मिनल (PowerShell या Command Prompt) खोलें और यह कमांड चलाएं:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
👉 यह तुरंत 64 अक्षरों का एक सीक्रेट कोड प्रिंट कर देगा, जैसे:
`e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15`

* पहली बार चलाएं और उसे `AUTH_SECRET="..."` में डालें।
* दूसरी बार चलाएं और उसे `ENCRYPTION_SECRET="..."` में डालें।

---

<a id="4-imagekit-guide"></a>
## 🖼️ 4. ImageKit (फ़ोटो व वीडियो अपलोड) कैसे लाएं?

> **नोट:** शुरुआत में अगर आप ImageKit नहीं भी डालते, तो भी सिस्टम में बिल्ट-इन फ़ाइल अपलोडर और `wsrv.nl` ऑटो-इमेज रिसाइज़र चालू रहता है। लेकिन हाई-क्वालिटी ब्राइडल लहंगे व साड़ियों के लिए ImageKit सबसे बेहतरीन है (20 GB बैंडविड्थ + 3 GB स्टोरेज मुफ़्त)।

### 📌 कहाँ जाएं और स्क्रीन कैसी दिखेगी:
1. ब्राउज़र में [https://imagekit.io](https://imagekit.io) खोलें और **Sign up for free** करें।
2. लॉगिन करते ही स्क्रीन पर बाईं तरफ मेनू में **"Developer options"** या **"API Keys"** का विकल्प दिखेगा।
3. उस पर क्लिक करने पर स्क्रीन पर 3 चीजें साफ-साफ दिखेंगी:
   * **URL-Endpoint:** उदा. `https://ik.imagekit.io/aalmvastralay`
   * **Public Key:** उदा. `public_xxxxxx...`
   * **Private Key:** उदा. `private_xxxxxx...`
4. तीनों के सामने बने **Copy** बटन को दबाकर `.env.local` में भरें:
```env
NEXT_PUBLIC_IMAGEKIT_URL="https://ik.imagekit.io/aalmvastralay"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_xxxxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxxxx"
```

---

<a id="5-domain-cookie-guide"></a>
## 🌐 5. डोमेन, एडमिन और सुरक्षा वेरिएबल्स

| वेरिएबल का नाम | मान (Value) | क्या काम करता है? |
|---|---|---|
| `COOKIE_SECURE` | `"false"` (लोकल पर) <br> `"true"` (लाइव वेबसाइट पर) | सेशन्स को केवल सुरक्षित HTTPS कनेक्शन पर बांधता है। |
| `NEXT_PUBLIC_USE_WSRV` | `"true"` | किसी भी एक्सटर्नल इमेज को फ्री ग्लोबल CDN से वेबपी (WebP) में बदलकर तेज़ी से लोड करता है। |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (या आपका लाइव डोमेन) | गूगल सर्च (SEO) और साइटमैप के लिए मुख्य यूआरएल। |
| `ADMIN_EMAIL` | `admin@aalmvastralay.com` | सुपर एडमिन की लॉगिन आईडी। |
| `ADMIN_PASSWORD` | `Admin@123` | पहली बार डेटाबेस बनने पर सुपर-एडमिन का पासवर्ड। |
| `BOOTSTRAP_TOKEN` | `aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c` | पहली बार 16 टेबल्स स्वतः बनाने वाला सीक्रेट टोकन। |
| `SKIP_SEED` | `"true"` | पुराने डमी/फेक प्रोडक्ट्स को लोड होने से रोकता है। |

---

<a id="6-ready-env-template"></a>
## 📋 6. सम्पूर्ण रेडी-टू-कॉपी `.env.local` टेम्पलेट

आप अपने प्रोजेक्ट के रूट फोल्डर (जहाँ `package.json` है) में एक नई फ़ाइल बनाएं जिसका नाम रखें **`.env.local`**। 

नीचे दिए गए कोड को कॉपी करके उसमें पेस्ट कर दें (बस अपनी Neon डेटाबेस स्ट्रिंग बदल लें):

```env
# ==============================================================================
# 👑 AALM VASTRALAY (आलम वस्त्रालय) — ENVIRONMENT CONFIGURATION
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. डेटाबेस (Neon PostgreSQL — अनिवार्य)
# [Neon.tech Dashboard -> Project 'aalm-vastralay' -> Copy Connection String]
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxx@ep-cool-flower-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# ------------------------------------------------------------------------------
# 2. सुरक्षा व एन्क्रिप्शन (Authentication & Encryption — अनिवार्य)
# [टर्मिनल में जनरेट करें: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
# ------------------------------------------------------------------------------
AUTH_SECRET="e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15"
ENCRYPTION_SECRET="7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6"
POW_SECRET="aalm_pow_shield_secret_key_884920"

# ------------------------------------------------------------------------------
# 3. डोमेन व कुकी सुरक्षा
# (लोकल टेस्टिंग के लिए "false", जब लाइव HTTPS डोमेन जुड़े तो "true" कर दें)
# ------------------------------------------------------------------------------
COOKIE_SECURE="false"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_USE_WSRV="true"

# ------------------------------------------------------------------------------
# 4. सुपर एडमिन व डेटाबेस बूटस्ट्रैप क्रेडेंशियल्स
# ------------------------------------------------------------------------------
ADMIN_EMAIL="admin@aalmvastralay.com"
ADMIN_PASSWORD="Admin@123"
BOOTSTRAP_TOKEN="aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c"
SKIP_SEED="true"

# ------------------------------------------------------------------------------
# ------------------------------------------------------------------------------
# 5. इमेज होस्टिंग: ImageKit (वैकल्पिक)
# ------------------------------------------------------------------------------
# NEXT_PUBLIC_IMAGEKIT_URL="https://ik.imagekit.io/your_id"
# NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_xxxxxx"
# IMAGEKIT_PRIVATE_KEY="private_xxxxxx"

# ------------------------------------------------------------------------------
# 6. बैकब्लेज B2 + क्लाउडफ्लेयर वर्कर प्रॉक्सी (प्राइवेट क्लाउड स्टोरेज)
# ------------------------------------------------------------------------------
# B2_APPLICATION_KEY_ID="005xxxxxxxxxxxx0000000001"
# B2_APPLICATION_KEY="K005xxxxxxxxxxxxxxxxxxxx"
# B2_BUCKET_NAME="aalm-vastralay-media"
# B2_BUCKET_ID="xxxxxxxxxxxxxxxxxxxx"
# NEXT_PUBLIC_B2_WORKER_URL="https://aalm-b2-proxy.alamwastraly.workers.dev"

# ------------------------------------------------------------------------------
# 7. ईमेल सेवा: Google Apps Script / QuietMail / Resend (वैकल्पिक)
# ------------------------------------------------------------------------------
# GAS_EMAIL_URL="https://script.google.com/macros/s/AKfycbx.../exec"
# GAS_SECRET_TOKEN="aalm_gas_bridge_secret_998124"
# QUIETMAIL_API_URL="https://api.quiet-mail.example/v1/send"
# QUIETMAIL_API_KEY="qm_xxxxxx"
# EMAIL_FROM="Aalm Vastralay <orders@aalmvastralay.in>"
```

---

## 🚀 `.env.local` सेव करने के बाद क्या करें?

1. टर्मिनल में प्रोजेक्ट रन करें:
   ```bash
   npm run dev
   ```
2. ब्राउज़र में एक बार यह यूआरएल खोलें:
   ```text
   http://localhost:3000/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true
   ```
   **बस!** आपके डेटाबेस में सभी 16 टेबल्स बन जाएंगी और आपकी वेबसाइट 100% काम करने लगेगी।
