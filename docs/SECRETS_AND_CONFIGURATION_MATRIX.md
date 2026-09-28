# 🛡️ AALM VASTRALAY — SECRETS & CONFIGURATION MATRIX
# सम्पूर्ण गाइड: कौन अनिवार्य (Mandatory) है, कौन वैकल्पिक (Optional) है, और कौन Plain-Text vs Secret है
# Location: docs/SECRETS_AND_CONFIGURATION_MATRIX.md

---

## 📌 1. परिचय व सुरक्षा दर्शन (Executive Summary)

आलम वस्त्रालय (Aalm Vastralay) आर्किटेक्चर को **100% परमानेंट $0/माह (Free Tier)** पर बिना किसी हिडन कॉस्ट के सुरक्षित चलाने के लिए डिज़ाइन किया गया है। 

इस गाइड में प्रत्येक वेरिएबल को दो पैमानों पर परखा गया है:
1. **ज़रूरत का स्तर (Necessity Level):** 
   - 🔴 **अनिवार्य (Mandatory):** इसके बिना वेबसाइट स्टार्ट नहीं हो सकती (केवल 5 वेरिएबल्स)।
   - 🟡 **अनुशंसित (Recommended):** ₹0 फ्री टियर फीचर्स (OTP, UPI, B2 इमेज स्टोरेज) के लिए।
   - ⚪ **वैकल्पिक (Optional):** जैसे Shiprocket, ImageKit, या Razorpay (यदि आप थर्ड-पार्टी सेवाएं जोड़ना चाहें)।
   - 🟢 **ब्रांड कस्टमाइज़ेशन (Store Defaults):** स्टोर नाम, फोन, पता (कोड में पहले से डिफ़ॉल्ट्स सेट हैं)।
2. **गोपनीयता का स्तर (Confidentiality Level):**
   - 🔒 **SECRET (गुप्त / Private):** केवल सर्वर पर रहेगा, कभी गिट या ब्राउज़र में नहीं दिखेगा।
   - 📢 **PLAIN TEXT (पब्लिक / Public):** ब्राउज़र के लिए सुरक्षित, हेडर/फुटर/इनवॉइस में दिखने योग्य।

---

## 🚦 2. तुरंत निर्णय तालिका: किसकी ज़रूरत है और किसकी नहीं? (Quick Decision Matrix)

| वेरिएबल का नाम | ज़रूरत का स्तर (Necessity) | प्रकार (Type) | क्या डिफ़ॉल्ट वैल्यू मौजूद है? | क्या प्रोडक्शन चलाने के लिए अनिवार्य है? |
| :--- | :---: | :---: | :---: | :---: |
| **`DATABASE_URL`** | 🔴 **अनिवार्य (MANDATORY)** | 🔒 **SECRET** | ❌ कोई डिफ़ॉल्ट नहीं | **हाँ (100% Required)** |
| **`AUTH_SECRET`** | 🔴 **अनिवार्य (MANDATORY)** | 🔒 **SECRET** | ❌ कोई डिफ़ॉल्ट नहीं | **हाँ (100% Required)** |
| **`ENCRYPTION_SECRET`** | 🔴 **अनिवार्य (MANDATORY)** | 🔒 **SECRET** | ⚠️ असुरक्षित देव फॉलबैक | **हाँ (100% Required)** |
| **`POW_SECRET`** | 🔴 **अनिवार्य (MANDATORY)** | 🔒 **SECRET** | ⚠️ डेमो साल्ट | **हाँ (100% Required)** |
| **`NEXT_PUBLIC_SITE_URL`** | 🔴 **अनिवार्य (MANDATORY)** | 📢 **PLAIN TEXT** | ❌ कोई डिफ़ॉल्ट नहीं | **हाँ (100% Required)** |
| **`GAS_EMAIL_URL`** (Option A) | 🟡 **अनुशंसित (Recommended)** | 📢 **PLAIN TEXT** | ❌ खाली रहने पर OTP प्रिंट होगा | अनुशंसित (फ्री OTP ईमेल के लिए) |
| **`GAS_SECRET_TOKEN`** (Option A) | 🟡 **अनुशंसित (Recommended)** | 🔒 **SECRET** | ❌ खाली रहने पर OTP प्रिंट होगा | अनुशंसित (फ्री OTP ईमेल के लिए) |
| **`NEXT_PUBLIC_UPI_VPA`** | 🟡 **अनुशंसित (Recommended)** | 📢 **PLAIN TEXT** | ✅ `"merchant@upi"` | अनुशंसित (₹0 UPI चेकआउट के लिए) |
| **`NEXT_PUBLIC_UPI_PAYEE_NAME`** | 🟡 **अनुशंसित (Recommended)** | 📢 **PLAIN TEXT** | ✅ `"Marketplace Store"` | अनुशंसित (UPI ऐप में नाम के लिए) |
| **`B2_KEY_ID` & `APP_KEY`** (Option A) | 🟡 **अनुशंसित (Recommended)** | 🔒 **SECRET** | ⚠️ Vercel लोकल फॉलबैक | अनुशंसित (10GB फ्री B2 इमेज के लिए) |
| **`NEXT_PUBLIC_B2_WORKER_URL`** | 🟡 **अनुशंसित (Recommended)** | 📢 **PLAIN TEXT** | ✅ Cloudflare Worker URL | अनुशंसित (B2 CDN प्रॉक्सी के लिए) |
| **`ADMIN_EMAIL` & `PASSWORD`** | 🟡 **अनुशंसित (Recommended)** | 🔒 **SECRET** | ✅ `"admin@aalmvastralay.com"` | अनुशंसित (शुरुआती एडमिन के लिए) |
| **`SHIPROCKET_EMAIL` / `PASSWORD`** | ⚪ **वैकल्पिक (OPTIONAL)** | 🔒 **SECRET** | ✅ मैन्युअल ट्रैकिंग फॉलबैक | ❌ नहीं (वैकल्पिक ऑटो-लेबल) |
| **`DELHIVERY_API_KEY`** | ⚪ **वैकल्पिक (OPTIONAL)** | 🔒 **SECRET** | ✅ मैन्युअल ट्रैकिंग फॉलबैक | ❌ नहीं (वैकल्पिक ऑटो-लेबल) |
| **`IMAGEKIT_*`** (Option B) | ⚪ **वैकल्पिक (OPTIONAL)** | 🔒 / 📢 मिक्स | ✅ B2 स्टोरेज प्राथमिकता | ❌ नहीं (वैकल्पिक 20GB इमेजकिट) |
| **`QUIETMAIL_*`** (Option B) | ⚪ **वैकल्पिक (OPTIONAL)** | 🔒 / 📢 मिक्स | ✅ Google Apps Script प्राथमिकता | ❌ नहीं (वैकल्पिक पेड मेलर) |
| **`BETTER_AUTH_SECRET`** | 🟡 **अनुशंसित (Recommended)** | 🔒 **SECRET** | ✅ `AUTH_SECRET` फॉलबैक | ❌ नहीं (वैकल्पिक सिंक) |
| **`NEXT_PUBLIC_APP_NAME`** | 🟢 **कस्टमाइज़ेशन (BRAND)** | 📢 **PLAIN TEXT** | ✅ `"Aalm Vastralay"` | ❌ नहीं (स्वतः डिफ़ॉल्ट लागू होगा) |
| **`NEXT_PUBLIC_SUPPORT_PHONE`** | 🟢 **कस्टमाइज़ेशन (BRAND)** | 📢 **PLAIN TEXT** | ✅ `"+91 98765 43210"` | ❌ नहीं (स्वतः डिफ़ॉल्ट लागू होगा) |
| **`NEXT_PUBLIC_SUPPORT_WHATSAPP`**| 🟢 **कस्टमाइज़ेशन (BRAND)** | 📢 **PLAIN TEXT** | ✅ `"+91 98765 43210"` | ❌ नहीं (स्वतः डिफ़ॉल्ट लागू होगा) |
| **`NEXT_PUBLIC_STORE_ADDRESS`** | 🟢 **कस्टमाइज़ेशन (BRAND)** | 📢 **PLAIN TEXT** | ✅ `"Main Market, Bihar"` | ❌ नहीं (स्वतः डिफ़ॉल्ट लागू होगा) |
| **`NEXT_PUBLIC_STORE_GSTIN`** | 🟢 **कस्टमाइज़ेशन (BRAND)** | 📢 **PLAIN TEXT** | ✅ `"10ABCDE1234F1Z5"` | ❌ नहीं (स्वतः डिफ़ॉल्ट लागू होगा) |

---

## 🔴 3. ग्रुप 1: केवल ये 5 चीज़ें 100% अनिवार्य हैं (Must-Have Core)

यदि आप बिल्कुल साधारण शुरुआत करना चाहते हैं और कोई अतिरिक्त थर्ड-पार्टी खाता नहीं खोलना चाहते, तो प्रोडक्शन चलाने के लिए **केवल ये 5 चीज़ें** चाहिए:

```env
# 1. डेटाबेस (Neon Serverless PostgreSQL — मुफ़्त 500MB)
# कहाँ मिलेगा: neon.tech -> Project 'aalm-vastralay' -> Region Mumbai
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# 2. सेशन हस्ताक्षर (64-अक्षर हेक्स स्ट्रिंग)
# जनरेट करें: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="your_64_character_hex_string_for_auth_secret_here"

# 3. AES-256 डेटा एन्क्रिप्शन (64-अक्षर हेक्स स्ट्रिंग)
ENCRYPTION_SECRET="your_64_character_hex_string_for_encryption_secret_here"

# 4. इन-हाउस बॉट शील्ड साल्ट (कोई भी रैंडम सुरक्षित स्ट्रिंग)
POW_SECRET="aalm_pow_shield_super_secure_salt_2026"

# 5. आपकी लाइव वेबसाइट का URL
NEXT_PUBLIC_SITE_URL="https://aalm-vastralay.vercel.app"
```

> **💡 नोट:** इन 5 वेरिएबल्स के साथ पूरी वेबसाइट (होमपेज, कैटलॉग, फ़िल्टर्स, साइज गाइड, पिनकोड, कार्ट, चेकआउट, सुपर एडमिन और सेलर पोर्टल) 100% लाइव काम करेगी!

---

## 🟡 4. ग्रुप 2: अनुशंसित ₹0 फ्री टियर फीचर्स (Recommended Zero-Cost Stack)

प्लेटफ़ॉर्म की सभी आधुनिक क्षमताओं का पूरा लाभ उठाने के लिए ये अनुशंसित हैं:

### 1. ईमेल व ओटीपी (Email & OTP):
- **विकल्प A (अनुशंसित / RECOMMENDED — 100% मुफ़्त):** Google Apps Script
  - `GAS_EMAIL_URL`: आपके पर्सनल जीमेल से जुड़ा वेब ऐप यूआरएल (बिना डोमेन के मुफ़्त ईमेल)।
  - `GAS_SECRET_TOKEN`: पासवर्ड रीसेट और ओटीपी सुरक्षा के लिए सीक्रेट टोकन।
  - *गाइड:* [`docs/GAS_EMAIL_GUIDE.md`](GAS_EMAIL_GUIDE.md)

### 2. डायनेमिक यूपीआई चेकआउट (Dynamic UPI Checkout):
- `NEXT_PUBLIC_UPI_VPA`: आपका UPI ID (उदा. `merchant@upi` या `9876543210@paytm`) — ₹0 गेटवे फीस।
- `NEXT_PUBLIC_UPI_PAYEE_NAME`: ग्राहक के ऐप पर दिखने वाला आपका नाम।

### 3. प्राइवेट मीडिया स्टोरेज (Private B2 Media CDN):
- **विकल्प A (अनुशंसित — 10GB मुफ़्त + असीमित फ्री बैंडविड्थ):** Backblaze B2 + Cloudflare Worker
  - `B2_KEY_ID`, `B2_APP_KEY`, `B2_BUCKET_ID`, `B2_BUCKET_NAME` ➔ Cloudflare Secrets में डाले जाते हैं।
  - `NEXT_PUBLIC_B2_WORKER_URL`: Cloudflare Worker URL (Vercel में डाला जाता है)।
  - *गाइड:* [`docs/b2-cloudflare-setup.md`](b2-cloudflare-setup.md)

---

## ⚪ 5. ग्रुप 3: पूरी तरह वैकल्पिक सेवाएं (Purely Optional / Advanced)

इनकी शुरुआत में **कोई ज़रूरत नहीं** है। जब आपका बिजनेस बड़ा हो जाए और आप इन्हें जोड़ना चाहें, तब इस्तेमाल करें:

### 1. कूरियर व AWB लॉजिस्टिक्स (Shiprocket / Delhivery):
- `SHIPROCKET_EMAIL` & `SHIPROCKET_PASSWORD`: ऑटोमैटिक शिपिंग लेबल जनरेशन के लिए।
- `DELHIVERY_API_KEY`: दिल्लीवरी डायरेक्ट पिकअप व AWB के लिए।
- *डिफ़ॉल्ट व्यवहार:* यदि ये सेट नहीं हैं, तो एडमिन और सेलर मैन्युअल रूप से ट्रैकिंग नंबर और कूरियर का नाम दर्ज कर सकते हैं। सिस्टम कभी क्रैश नहीं होगा।

### 2. वैकल्पिक इमेज स्टोरेज (Option B: ImageKit CDN):
- `NEXT_PUBLIC_IMAGEKIT_URL`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`
- *डिफ़ॉल्ट व्यवहार:* यदि आप Backblaze B2 का उपयोग कर रहे हैं (Option A), तो ImageKit की **बिल्कुल आवश्यकता नहीं** है।

### 3. वैकल्पिक ईमेल सेंडर (Option B: QuietMail / Resend):
- `QUIETMAIL_API_URL` & `QUIETMAIL_API_KEY`
- *डिफ़ॉल्ट व्यवहार:* यदि आप Google Apps Script (Option A) का उपयोग कर रहे हैं, तो QuietMail की **बिल्कुल आवश्यकता नहीं** है।

### 4. Better Auth कॉन्फ़िगरेशन (Better Auth Secret & URL):
- `BETTER_AUTH_SECRET` & `BETTER_AUTH_URL`: Better Auth session token encryption और canonical callback URL के लिए। डिफ़ॉल्ट रूप से `AUTH_SECRET` से सिंक रहता है।

---

## 🟢 6. ग्रुप 4: स्टोर ब्रांडिंग व कस्टमाइज़ेशन (Store Branding Defaults)

ये सभी वेरिएबल्स `NEXT_PUBLIC_*` (Plain Text) हैं। यदि आप इन्हें `.env.local` या Vercel में **नहीं भी डालते हैं**, तो भी कोडबेस में सुरक्षित डिफ़ॉल्ट्स पहले से मौजूद हैं:

```env
# यदि आप इन्हें बदलेंगे, तो वेबसाइट पर आपका ब्रांड दिखेगा:
NEXT_PUBLIC_APP_NAME="Aalm Vastralay"                       # डिफ़ॉल्ट: Aalm Vastralay
NEXT_PUBLIC_BRAND_TAGLINE="Royal Indian Wedding & Luxury"   # डिफ़ॉल्ट: Royal Indian Wedding
NEXT_PUBLIC_SUPPORT_PHONE="+91 98765 43210"                 # डिफ़ॉल्ट: +91 98765 43210
NEXT_PUBLIC_SUPPORT_WHATSAPP="+91 98765 43210"              # डिफ़ॉल्ट: +91 98765 43210
NEXT_PUBLIC_SUPPORT_EMAIL="support@example.com"             # डिफ़ॉल्ट: support@example.com
NEXT_PUBLIC_STORE_ADDRESS="Main Market, Kalyanipur"         # डिफ़ॉल्ट: Main Market
NEXT_PUBLIC_STORE_CITY="Patna"                              # डिफ़ॉल्ट: Patna
NEXT_PUBLIC_STORE_STATE="Bihar"                             # डिफ़ॉल्ट: Bihar
NEXT_PUBLIC_STORE_PINCODE="800001"                          # डिफ़ॉल्ट: 800001
NEXT_PUBLIC_STORE_GSTIN="10ABCDE1234F1Z5"                   # डिफ़ॉल्ट: 10ABCDE1234F1Z5
```

---

## 🔒 7. सीक्रेट लीकेज रोकथाम व गिट सुरक्षा नियम (Security Rules)

1. **क्या कभी गिट (GitHub) पर जा सकता है?**
   - ❌ **SECRET वेरिएबल्स:** कभी नहीं! [`.gitignore`](../.gitignore) की 10-लेयर शील्ड इन्हें रोकती है।
   - ✅ **`.env.example`:** केवल यही फ़ाइल गिट में जाएगी, और इसमें केवल डमी/सैंपल वैल्यूज़ रहेंगी।
2. **क्लाइंट-साइड (Browser) लीकेज की सुरक्षा:**
   - केवल वही वेरिएबल्स ब्राउज़र में दिखते हैं जो `NEXT_PUBLIC_` से शुरू होते हैं।
   - `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_SECRET` कभी भी ब्राउज़र में नहीं जा सकते क्योंकि उनमें `NEXT_PUBLIC_` प्रीफिक्स नहीं है।
3. **की रोटेशन (यदि कोई की लीक हो जाए):**
   - Vercel Dashboard -> Settings -> Environment Variables में जाएं।
   - उस की की वैल्यू बदलें और **Redeploy** कर दें। 30 सेकंड में पुरानी की अमान्य हो जाएगी।
