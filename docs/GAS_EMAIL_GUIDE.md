# 📧 Aalm Vastralay — Google Apps Script (GAS) Transactional Mailer Guide
# फ़ाइल: docs/GAS_EMAIL_GUIDE.md

यह गाइड आपको बिना किसी कस्टम डोमेन (बिना DNS, SPF, DKIM, MX रिकॉर्ड्स) और बिना किसी पेड थर्ड-पार्टी सर्विस (जैसे Resend, SendGrid, Clerk, Mailgun) के, **100% मुफ़्त में** सीधे अपने Gmail खाते से **पासवर्ड रीसेट OTP, ऑर्डर कन्फर्मेशन, डिलीवरी ट्रैकिंग और फेस्टिव ऑफर्स** भेजने की संपूर्ण, सचित्र व चरणबद्ध विधि समझाती है।

---

## 🌟 यह क्या है और क्यों उपयोग कर रहे हैं? (Why GAS Mailer?)

1. **₹0 लागत (Zero Budget):** Google Apps Script पूरी तरह निःशुल्क है।
2. **बिना कस्टम डोमेन (Zero Domain Required):** आपको किसी डोमेन सत्यापन या DNS रिकॉर्ड्स की ज़रूरत नहीं है।
3. **100% प्राइमरी इनबॉक्स डिलीवरी (No Spam Folder):** चूँकि ईमेल सीधे आपके प्रामाणिक Gmail सर्वर से जाते हैं, ईमेल स्पैम फोल्डर में नहीं जाते।
4. **प्रतिदिन 500 मुफ़्त ईमेल्स:** आम Gmail खाते पर प्रतिदिन 500 ईमेल्स मुफ़्त मिलते हैं (स्क्रिप्ट में 450 का सुरक्षा बफर लगा है)। Google Workspace पर यह 2,000 प्रतिदिन तक बढ़ जाता है।
5. **शाही व सुरुचिपूर्ण टेम्पलेट्स (Royal Luxury Templates):** पासवर्ड रीसेट, दिवाली/त्योहार ऑफर, कूपन कोड, ऑर्डर रसीद और पार्सल ट्रैकिंग के 10 सुंदर डिज़ाइन पहले से इनबिल्ट हैं।

---

## ⚡ चरण 1: Google Apps Script प्रोजेक्ट बनाना (Create Project)

1. अपने ब्राउज़र में [**script.google.com/home**](https://script.google.com/home) खोलें।
2. अपने उस Gmail खाते से लॉगिन करें जिससे आप ग्राहकों को ईमेल्स भेजना चाहते हैं (उदा. `aalmvastralay@gmail.com` या आपका व्यक्तिगत Gmail)।
3. ऊपर बाईं ओर **"+ New project" (नया प्रोजेक्ट)** बटन पर क्लिक करें।
4. ऊपर जहाँ **"Untitled project"** लिखा है, उस पर क्लिक करके नाम बदलें:
   👉 **`Aalm-Vastralay-Mailer`** और **Rename** पर क्लिक करें।

---

## 📜 चरण 2: कोड पेस्ट करना (Paste Production Script)

1. एडिटर में पहले से मौजूद कोड (`function myFunction() { ... }`) को पूरी तरह डिलीट कर दें।
2. नीचे दिया गया पूरा कोड कॉपी करें और `Code.gs` में पेस्ट कर दें:

```javascript
/**
 * ============================================================================
 * 👑 AALM VASTRALAY — HARDENED GOOGLE APPS SCRIPT (GAS) TRANSACTIONAL MAILER
 * ============================================================================
 * 
 * ZERO COST • ZERO DOMAIN REQUIREMENT • DIRECT GMAIL INBOX DELIVERABILITY
 * Brand: Aalm Vastralay (आलम वस्त्रालय), Kalyanipur, Samastipur, Bihar
 */

// Daily quota ceiling for free @gmail accounts (Google allows 500, capped at 450 for safety)
var DAILY_QUOTA_LIMIT = 450;
var BRAND_NAME = "Aalm Vastralay (आलम वस्त्रालय)";
var BRAND_PHONE = "+91 8434061342";
var BRAND_EMAIL = "aalmvastralay@gmail.com";
var STORE_ADDRESS = "Aalm Vastralay, Tajpur Road, Kalyanipur, Samastipur, Bihar - 848101";

/**
 * Handle GET requests for health check & quota inspection
 */
function doGet(e) {
  var token = e && e.parameter && e.parameter.token;
  if (!isValidToken(token)) {
    return jsonResponse({ status: "error", message: "Unauthorized: Invalid or missing token" }, 401);
  }

  var remaining = MailApp.getRemainingDailyQuota();
  var sentToday = getTodaySentCount();

  return jsonResponse({
    status: "ok",
    service: "Aalm Vastralay GAS Mailer",
    googleRemainingQuota: remaining,
    scriptSentToday: sentToday,
    scriptQuotaLimit: DAILY_QUOTA_LIMIT,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST requests from Next.js backend
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Empty payload received" }, 400);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ status: "error", message: "Invalid JSON in request body" }, 400);
    }

    // 1. Constant-time token verification
    if (!isValidToken(data.token)) {
      return jsonResponse({ status: "error", message: "Unauthorized token" }, 401);
    }

    // 2. Recipient validation
    var to = (data.to || "").trim().toLowerCase();
    if (!to || !to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return jsonResponse({ status: "error", message: "Invalid recipient email address" }, 400);
    }

    // 3. Daily quota circuit breaker
    var sentToday = getTodaySentCount();
    var googleRemaining = MailApp.getRemainingDailyQuota();
    if (sentToday >= DAILY_QUOTA_LIMIT || googleRemaining <= 5) {
      return jsonResponse({
        status: "error",
        message: "Daily email quota reached (" + sentToday + "/" + DAILY_QUOTA_LIMIT + "). Dispatches throttled to protect Gmail account."
      }, 429);
    }

    // 4. Anti-relay template whitelist
    var type = (data.type || "").toUpperCase();
    var rendered = renderEmailTemplate(type, data);
    if (!rendered) {
      return jsonResponse({
        status: "error",
        message: "Rejected: Email type '" + type + "' is not whitelisted."
      }, 400);
    }

    // 5. Send email via MailApp (with sanitized clean UTF-8 subject)
    MailApp.sendEmail({
      to: to,
      subject: rendered.subject,
      htmlBody: rendered.html,
      body: rendered.text,
      name: BRAND_NAME
    });

    // 6. Increment quota counter
    incrementTodaySentCount();

    return jsonResponse({
      status: "success",
      message: "Email dispatched successfully",
      type: type,
      recipient: to,
      remainingQuota: DAILY_QUOTA_LIMIT - (sentToday + 1)
    });

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: "Internal mailer execution error: " + (err.message || String(err))
    }, 500);
  }
}

/**
 * Constant-time string comparator preventing timing attacks
 */
function isValidToken(clientToken) {
  if (!clientToken || typeof clientToken !== "string") return false;
  var scriptProps = PropertiesService.getScriptProperties();
  var expectedToken = scriptProps.getProperty("AUTH_TOKEN") || "aalm_gas_mail_secret_9988224411";

  if (clientToken.length !== expectedToken.length) return false;
  var mismatch = 0;
  for (var i = 0; i < clientToken.length; i++) {
    mismatch |= (clientToken.charCodeAt(i) ^ expectedToken.charCodeAt(i));
  }
  return mismatch === 0;
}

/**
 * Sanitizes dynamic values to prevent HTML injection
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Returns today's sent count from cache
 */
function getTodaySentCount() {
  var cache = CacheService.getScriptCache();
  var todayKey = "mail_count_" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMdd");
  var val = cache.get(todayKey);
  return val ? parseInt(val, 10) : 0;
}

/**
 * Increments today's sent count
 */
function incrementTodaySentCount() {
  var cache = CacheService.getScriptCache();
  var todayKey = "mail_count_" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMdd");
  var current = getTodaySentCount();
  cache.put(todayKey, String(current + 1), 86400);
}

/**
 * Renders colorful, luxury, high-conversion email templates
 */
function renderEmailTemplate(type, data) {
  var name = escapeHtml(data.name || "Customer");
  var orderId = escapeHtml(data.orderId || data.orderNumber || "");
  var otp = escapeHtml(data.otp || "");
  var amount = escapeHtml(data.amount ? ("₹" + Number(data.amount).toLocaleString("en-IN")) : "");
  var courier = escapeHtml(data.courier || "Express Courier");
  var awb = escapeHtml(data.awb || data.trackingNumber || "");
  var trackingUrl = escapeHtml(data.trackingUrl || "https://aalm-vastralay.vercel.app/orders");
  var couponCode = escapeHtml(data.couponCode || data.code || "AALMVASTRALAY");
  var discountText = escapeHtml(data.discountText || data.discount || "SPECIAL OFFER");
  var festivalName = escapeHtml(data.festivalName || "त्योहार स्पेशल (Festive Season)");
  var headline = escapeHtml(data.headline || data.title || "Exclusive Collection");
  var message = escapeHtml(data.message || data.body || "");
  var ctaUrl = escapeHtml(data.ctaUrl || "https://aalm-vastralay.vercel.app/products");

  // Grand Regal Header with Gold Embroidery Accent
  var header = 
    '<div style="background:#4A148C;background:linear-gradient(135deg, #4A148C 0%, #7a1f2b 100%);padding:32px 20px;text-align:center;border-radius:16px 16px 0 0;border-bottom:4px solid #D4AF37;">' +
      '<div style="display:inline-block;padding:4px 14px;background:rgba(212,175,55,0.22);border:1px solid #D4AF37;border-radius:99px;color:#fef08a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">' +
        '👑 PURE BIHAR &amp; INDIAN ETHNIC WEAR' +
      '</div>' +
      '<h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:1px;font-family:Georgia,\'Playfair Display\',serif;">' +
        'आलम वस्त्रालय <span style="font-size:20px;font-weight:400;color:#f4e2a3;">(Aalm Vastralay)</span>' +
      '</h1>' +
      '<p style="color:#f3e5f5;margin:6px 0 0;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;font-weight:500;">' +
        'WEDDING &amp; BRIDAL COUTURE · KALYANIPUR' +
      '</p>' +
    '</div>';

  // Royal Footer with WhatsApp Direct Connect & Physical Store Address
  var footer = 
    '<div style="background:#fdfaf6;border-top:1px solid #f0e6d6;padding:24px 20px;text-align:center;border-radius:0 0 16px 16px;">' +
      '<p style="margin:0 0 10px;font-size:13px;color:#5c4e43;">' +
        'किसी भी सहायता के लिए हमें कॉल या WhatsApp करें:' +
      '</p>' +
      '<div style="margin:0 0 14px;">' +
        '<a href="https://wa.me/918434061342?text=Namaste!%20I%20need%20assistance%20with%20Aalm%20Vastralay" style="background:#25D366;color:#ffffff;text-decoration:none;padding:8px 18px;border-radius:99px;font-size:13px;font-weight:bold;display:inline-block;box-shadow:0 2px 8px rgba(37,211,102,0.3);">' +
          '💬 WhatsApp: ' + BRAND_PHONE +
        '</a>' +
      '</div>' +
      '<p style="margin:0;font-size:11px;color:#857467;line-height:1.5;">' +
        '<strong>' + BRAND_NAME + '</strong><br/>' +
        STORE_ADDRESS +
      '</p>' +
    '</div>';

  var wrap = function(content) {
    return '<div style="background-color:#f6f3ee;padding:24px 12px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">' +
      '<div style="max-width:580px;margin:0 auto;border:2px solid #e2d2ba;border-radius:16px;box-shadow:0 12px 40px rgba(74,20,140,0.08);background:#ffffff;overflow:hidden;">' +
        header +
        '<div style="padding:32px 24px;color:#1a1614;line-height:1.65;font-size:15px;">' + content + '</div>' +
        footer +
      '</div>' +
    '</div>';
  };

  switch (type) {
    case "FORGOT_PASSWORD":
      return {
        subject: "[OTP: " + otp + "] पासवर्ड रीसेट कोड (Password Reset) — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;border-bottom:2px solid #f0e6d6;padding-bottom:12px;">' +
            'पासवर्ड रीसेट अनुरोध (Password Reset)' +
          '</h2>' +
          '<p style="font-size:16px;">नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>आपके आलम वस्त्रालय खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। अपना नया सुरक्षित पासवर्ड सेट करने के लिए नीचे दिए गए 6-अंकों के गोपनीय कोड (OTP) का उपयोग करें:</p>' +
          
          '<div style="border:2px dashed #D4AF37;background:linear-gradient(135deg, #fffdf5 0%, #fdf2f4 50%, #f3e5f5 100%);border-radius:12px;padding:24px 16px;text-align:center;margin:28px 0;box-shadow:0 4px 20px rgba(212,175,55,0.15);">' +
            '<p style="margin:0 0 10px;font-size:11px;font-weight:800;color:#7a1f2b;letter-spacing:2px;text-transform:uppercase;">' +
              '🔒 CONFIDENTIAL ONE-TIME PASSWORD' +
            '</p>' +
            '<div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#4A148C;font-family:\'Courier New\',monospace;padding:6px 0;text-shadow:0 2px 4px rgba(74,20,140,0.12);">' +
              otp +
            '</div>' +
            '<div style="display:inline-block;background:#fff8e1;border:1px solid #ffe082;padding:6px 14px;border-radius:99px;font-size:12px;font-weight:700;color:#b78103;margin-top:12px;">' +
              '⏰ यह OTP केवल 15 मिनट के लिए मान्य है' +
            '</div>' +
          '</div>' +

          '<p style="font-size:13px;color:#857467;margin:16px 0 0;line-height:1.6;">' +
            'यदि आपने यह अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं। आपका खाता पूरी तरह सुरक्षित है। Aalm Vastralay का कोई भी प्रतिनिधि कभी आपसे OTP या पासवर्ड नहीं मांगता।' +
          '</p>'
        ),
        text: "नमस्ते " + name + ",\n\nआपके आलम वस्त्रालय खाते का पासवर्ड रीसेट OTP कोड है: " + otp + "\nयह कोड अगले 15 मिनट तक मान्य है।\nयदि आपने यह अनुरोध नहीं किया था, तो कृपया इसे अनदेखा करें।"
      };

    case "FESTIVAL_OFFER":
      return {
        subject: "[त्योहार स्पेशल] " + festivalName + " — " + discountText + " — Aalm Vastralay",
        html: wrap(
          '<div style="text-align:center;margin-bottom:20px;">' +
            '<span style="background:linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);color:#1a0f00;font-weight:bold;font-size:12px;padding:4px 16px;border-radius:99px;text-transform:uppercase;letter-spacing:1.5px;display:inline-block;">' +
              '✨ FESTIVE CELEBRATION' +
            '</span>' +
          '</div>' +
          '<h2 style="color:#7a1f2b;text-align:center;font-size:24px;margin:0 0 10px;font-family:Georgia,serif;">' +
            festivalName +
          '</h2>' +
          '<h3 style="color:#4A148C;text-align:center;font-size:20px;margin:0 0 16px;">' +
            headline +
          '</h3>' +
          
          '<div style="background:linear-gradient(135deg, #fdf6ea 0%, #fbe4e8 100%);border:2px solid #D4AF37;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">' +
            '<p style="color:#7a1f2b;font-size:28px;font-weight:900;margin:0 0 8px;letter-spacing:1px;">' +
              discountText +
            '</p>' +
            '<p style="margin:0;font-size:14px;color:#5c4e43;">' +
              (message ? message.replace(/\n/g, "<br/>") : "ब्राइडल लहंगा, बनारसी साड़ी, शेरवानी और सिल्क कुर्तों पर विशेष छूट।") +
            '</p>' +
          '</div>' +

          '<p style="text-align:center;margin:28px 0 16px;">' +
            '<a href="' + ctaUrl + '" style="background:linear-gradient(135deg, #4A148C 0%, #7a1f2b 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:99px;font-weight:bold;font-size:15px;display:inline-block;box-shadow:0 4px 16px rgba(74,20,140,0.3);">' +
              '🛍️ अभी कलेक्शन देखें (Shop Collection)' +
            '</a>' +
          '</div>' +
          '<p style="text-align:center;font-size:12px;color:#857467;margin:0;">' +
            '🚚 पूरे भारत में कैश ऑन डिलीवरी (COD) व 7-दिन आसान रिटर्न उपलब्ध।' +
          '</p>'
        ),
        text: "नमस्ते " + name + ",\n\n" + festivalName + " — " + discountText + "\n" + headline + "\n\n" + (data.message || "") + "\n\nअभी खरीदारी करें: " + ctaUrl
      };

    case "COUPON_OFFER":
      return {
        subject: "[विशेष कूपन: " + couponCode + "] " + discountText + " छूट — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;text-align:center;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'आपके लिए विशेष उपहार कूपन (Exclusive Coupon)' +
          '</h2>' +
          '<p style="text-align:center;color:#5c4e43;font-size:15px;">नमस्ते <strong>' + name + '</strong>, अपनी अगली खरीदारी पर विशेष बचत का लाभ उठाएं:</p>' +
          
          '<div style="border:2px dashed #D4AF37;background:linear-gradient(135deg, #fffdf5 0%, #fdf6ea 100%);border-radius:12px;padding:24px;text-align:center;margin:24px 0;box-shadow:0 4px 18px rgba(212,175,55,0.16);">' +
            '<span style="background:#7a1f2b;color:#ffffff;font-size:11px;font-weight:bold;padding:3px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:1px;">' +
              discountText +
            '</span>' +
            '<div style="font-size:32px;font-weight:900;letter-spacing:4px;color:#4A148C;font-family:\'Courier New\',monospace;margin:12px 0 6px;">' +
              couponCode +
            '</div>' +
            '<p style="margin:0;font-size:12px;color:#857467;">चेकआउट के समय इस कूपन कोड का उपयोग करें</p>' +
          '</div>' +

          '<p style="text-align:center;margin:28px 0 16px;">' +
            '<a href="' + ctaUrl + '" style="background:#4A148C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:bold;font-size:14px;display:inline-block;">' +
              '🎁 कूपन का लाभ उठाएं (Apply Coupon)' +
            '</a>' +
          '</div>'
        ),
        text: "नमस्ते " + name + ",\n\nआपके लिए विशेष कूपन: " + couponCode + " (" + discountText + ")\nअभी खरीदारी करें: " + ctaUrl
      };

    case "STOCK_DELIVERY_ALERT":
      return {
        subject: "[न्यू स्टॉक / न्यू अराइवल] " + headline + " — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'नया स्टॉक उपलब्ध (New Ethnic Arrivals)' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>' + (message ? message.replace(/\n/g, "<br/>") : "आलम वस्त्रालय में नए वेडिंग लहंगे, सिल्क साड़ियां और शेरवानी का नया एक्सक्लूसिव स्टॉक आ चुका है।") + '</p>' +
          
          '<div style="background:#fdfaf6;border:1px solid #f0e6d6;border-radius:10px;padding:18px;margin:20px 0;">' +
            '<p style="margin:0 0 6px;color:#7a1f2b;font-weight:bold;font-size:16px;">' + headline + '</p>' +
            '<p style="margin:0;font-size:13px;color:#857467;">सीमित स्टॉक उपलब्ध है। अपना पसंदीदा परिधान जल्द बुक करें।</p>' +
          '</div>' +

          '<p style="text-align:center;margin:28px 0 16px;">' +
            '<a href="' + ctaUrl + '" style="background:linear-gradient(135deg,#4A148C 0%,#7a1f2b 100%);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:bold;font-size:14px;display:inline-block;">' +
              '✨ नया कलेक्शन देखें (View Arrivals)' +
            '</a>' +
          '</div>'
        ),
        text: "नमस्ते " + name + ",\n\n" + headline + "\n" + (data.message || "") + "\n\nअभी देखें: " + ctaUrl
      };

    case "ORDER_CONFIRMATION":
      return {
        subject: "[ऑर्डर कंफर्म #" + orderId + "] आपका ऑर्डर स्वीकार हुआ — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'ऑर्डर स्वीकार हुआ (Order Confirmed)' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>आलम वस्त्रालय से खरीदारी करने के लिए धन्यवाद! आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है।</p>' +
          '<div style="background:#fdfaf6;border:1px solid #f0e6d6;border-radius:10px;padding:20px;margin:20px 0;">' +
            '<p style="margin:0 0 10px;"><strong>ऑर्डर नंबर:</strong> #' + orderId + '</p>' +
            '<p style="margin:0;"><strong>कुल राशि:</strong> <span style="color:#7a1f2b;font-weight:bold;font-size:18px;">' + amount + '</span></p>' +
          '</div>' +
          '<p style="font-size:14px;color:#5c4e43;">हमारे कुशल बुनकर व कारीगर आपके परिधान को अत्यंत सावधानी से तैयार कर रहे हैं। पार्सल रवाना होते ही ट्रैकिंग नंबर आपके साथ साझा किया जाएगा।</p>'
        ),
        text: "नमस्ते " + name + ",\n\nधन्यवाद! आपका ऑर्डर #" + orderId + " (" + amount + ") सफलतापूर्वक दर्ज हो गया है।"
      };

    case "ORDER_DISPATCHED":
      return {
        subject: "[पार्सल रवाना #" + orderId + "] कुरियर AWB: " + awb + " — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'पार्सल भेज दिया गया है (Order Dispatched)' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>शुभ समाचार! आपका ऑर्डर <strong>#' + orderId + '</strong> कुरियर पार्टनर <strong>' + courier + '</strong> के माध्यम से रवाना कर दिया गया है।</p>' +
          '<div style="background:#fdfaf6;border:1px solid #f0e6d6;border-radius:10px;padding:20px;margin:20px 0;">' +
            '<p style="margin:0 0 8px;"><strong>कुरियर:</strong> ' + courier + '</p>' +
            '<p style="margin:0;"><strong>ट्रैकिंग AWB:</strong> <span style="font-family:monospace;font-weight:bold;font-size:16px;">' + awb + '</span></p>' +
          '</div>' +
          '<p style="text-align:center;margin:28px 0 16px;">' +
            '<a href="' + trackingUrl + '" style="background:#4A148C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:bold;font-size:14px;display:inline-block;">' +
              '📦 लाइव पार्सल ट्रैक करें (Track Package)' +
            '</a>' +
          '</div>'
        ),
        text: "नमस्ते " + name + ",\n\nआपका ऑर्डर #" + orderId + " कूरियर " + courier + " (AWB: " + awb + ") द्वारा रवाना हो चुका है।\nट्रैक करें: " + trackingUrl
      };

    case "UPI_VERIFIED":
      return {
        subject: "[पेमेंट सत्यापित #" + orderId + "] आपका भुगतान सफल — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#2e7d32;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'भुगतान सत्यापित (Payment Verified)' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>ऑर्डर <strong>#' + orderId + '</strong> के लिए आपका UPI भुगतान सफलतापूर्वक सत्यापित हो गया है। आपका ऑर्डर प्राथमिकता से तैयार किया जा रहा है।</p>'
        ),
        text: "नमस्ते " + name + ",\n\nऑर्डर #" + orderId + " के लिए आपका UPI भुगतान सत्यापित हो गया है।"
      };

    case "SELLER_WELCOME":
      return {
        subject: "[विक्रेता स्वागत] आपका स्टोर स्वीकृत हुआ — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'विक्रेता पोर्टल में आपका स्वागत है!' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>बधाई हो! आपके स्टोर का आवेदन स्वीकृत हो गया है। अब आप पहले 6 महीने तक <strong>0% कमीशन</strong> पर अपने पारंपरिक परिधान पूरे भारत में बेच सकते हैं।</p>' +
          '<p style="text-align:center;margin:28px 0 16px;">' +
            '<a href="https://aalm-vastralay.vercel.app/seller" style="background:#4A148C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:bold;font-size:14px;display:inline-block;">' +
              '🏪 सेलर डैशबोर्ड खोलें (Open Dashboard)' +
            '</a>' +
          '</div>'
        ),
        text: "नमस्ते " + name + ",\n\nआलम वस्त्रालय सेलर हब में आपका स्वागत है! आपका स्टोर स्वीकृत हो गया है।"
      };

    case "RETURN_REQUESTED":
      return {
        subject: "[रिटर्न अनुरोध #" + orderId + "] टिकट दर्ज हुआ — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#7a1f2b;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            'रिटर्न अनुरोध प्राप्त हुआ' +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>ऑर्डर <strong>#' + orderId + '</strong> के लिए आपका रिटर्न अनुरोध दर्ज कर लिया गया है। हमारी टीम 24-48 घंटों के भीतर पिकअप व्यवस्थित करेगी।</p>'
        ),
        text: "नमस्ते " + name + ",\n\nऑर्डर #" + orderId + " के लिए आपका रिटर्न अनुरोध दर्ज हो गया है।"
      };

    case "GENERAL":
      var subject = escapeHtml(data.subject || "Notification from Aalm Vastralay");
      var body = escapeHtml(data.body || "");
      return {
        subject: subject,
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;">' +
            subject +
          '</h2>' +
          '<p>नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>' + body.replace(/\n/g, "<br/>") + '</p>'
        ),
        text: "नमस्ते " + name + ",\n\n" + (data.body || "")
      };

    default:
      return null;
  }
}

/**
 * Generates JSON HTTP response
 */
function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

3. ऊपर **Save (फ्लॉपी 💾 आइकन)** दबाकर कोड सेव करें।

---

## 🔐 चरण 3: गुप्त टोकन सेट करना (Set Script Property)

अनधिकृत व्यक्तियों से अपने मेलर को सुरक्षित रखने के लिए हम एक सीक्रेट टोकन लगाते हैं:

1. बाईं ओर साइडबार में **Project Settings (गियर ⚙️ आइकन)** पर क्लिक करें।
2. नीचे स्क्रॉल करें और **"Script Properties" (स्क्रिप्ट गुण)** सेक्शन देखें।
3. **"Add script property" (प्रॉपर्टी जोड़ें)** बटन दबाएं:
   - **Property (प्रॉपर्टी):** `AUTH_TOKEN`
   - **Value (मान):** `aalm_gas_mail_secret_9988224411`
     *(या आप अपनी पसंद का कोई भी 32-अक्षर लंबा गुप्त कोड रख सकते हैं)*
4. **"Save script properties"** पर क्लिक करें।

---

## 🚀 चरण 4: Web App के रूप में डिप्लॉय करना (Deploy Web App)

यह सबसे महत्वपूर्ण कदम है ताकि Next.js सर्वर इस स्क्रिप्ट को इंटरनेट पर कॉल कर सके:

1. ऊपर दाईं ओर नीले बटन **"Deploy" (तैनात करें)** पर क्लिक करें और **"New deployment" (नई तैनाती)** चुनें।
2. बाईं ओर गियर ⚙️ आइकन ("Select type") पर क्लिक करके **"Web app"** चुनें।
3. फ़ॉर्म में ये विकल्प ध्यानपूर्वक भरें:
   - **Description:** `Aalm Vastralay Mailer v1`
   - **Execute as (इस रूप में निष्पादित करें):** `Me (आपका_ईमेल@gmail.com)` *(यह डिफ़ॉल्ट रहेगा, इसे न बदलें)*
   - **Who has access (किसकी पहुँच है):** 👉 **`Anyone` (कोई भी)**
     *(चेतावनी: इसे 'Anyone' रखना अनिवार्य है, ताकि Next.js का Vercel सर्वर बैकएंड से कॉल कर सके। घबराएं नहीं, सुरक्षा के लिए हमारा सीक्रेट टोकन हर अनुरोध की जाँच करता है!)*
4. नीचे **"Deploy"** बटन पर क्लिक करें।

---

## 🛡️ चरण 5: Google अनुमति देना (Authorize Permissions)

गूगल पहली बार आपसे Gmail एक्सेस करने की अनुमति मांगेगा:

1. स्क्रीन पर **"Authorization required"** का पॉपअप आएगा -> **"Authorize access"** पर क्लिक करें।
2. अपना Gmail खाता चुनें।
3. आपको Google की चेतावनी स्क्रीन दिखेगी:
   > *"Google hasn't verified this app" (Google ने इस ऐप को सत्यापित नहीं किया है)*
   
   ⚠️ **घबराएं नहीं!** यह चेतावनी इसलिए आती है क्योंकि यह आपकी निजी बनाई हुई कस्टम स्क्रिप्ट है।
4. नीचे बाईं ओर छोटे अक्षरों में लिखे **"Advanced" (उन्नत)** पर क्लिक करें।
5. नीचे दिख रहे लिंक पर क्लिक करें:
   👉 **`Go to Aalm-Vastralay-Mailer (unsafe)`**
6. स्क्रीन पर **"Allow" (अनुमति दें)** बटन दबाएं।
7. अब आपको **Web app URL** दिखाई देगा, जैसे:
   `https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXX/exec`
8. इस URL को **Copy (कॉपी)** कर लें!

---

## 🌐 चरण 6: Next.js और Vercel में जोड़ना (Environment Variables)

कॉपी किए गए Web App URL को अपनी वेबसाइट से जोड़ने के लिए:

### 1. लोकल डेवलपमेंट (`.env` या `.env.local`):
अपनी प्रोजेक्ट डायरेक्टरी में `.env` फ़ाइल खोलें और ये 2 लाइनें जोड़ें:
```env
GAS_EMAIL_URL="https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXX/exec"
GAS_SECRET_TOKEN="aalm_gas_mail_secret_9988224411"
```

### 2. लाइव Vercel प्रोडक्शन डिप्लॉयमेंट:
1. अपने **[Vercel Dashboard](https://vercel.com)** पर जाएं।
2. `aalm-vastralay` प्रोजेक्ट खोलें।
3. **Settings** -> **Environment Variables** पर जाएं।
4. 2 वैरिएबल्स जोड़ें:
   - `GAS_EMAIL_URL` = `https://script.google.com/macros/s/AKfycbx.../exec`
   - `GAS_SECRET_TOKEN` = `aalm_gas_mail_secret_9988224411`
5. प्रोजेक्ट को **Redeploy** कर दें।

---

## 🧪 चरण 7: टेस्टिंग और सत्यापन (Verification & Testing)

### 1. हेल्थ चेक और कोटा जाँच (GET Request)
अपने वेब ब्राउज़र में यह URL खोलें (अपना URL व टोकन डालकर):
```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?token=aalm_gas_mail_secret_9988224411
```
या टर्मिनल में cURL चलाएं:
```bash
curl -L "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?token=aalm_gas_mail_secret_9988224411"
```
**सफल उत्तर (Expected Response):**
```json
{
  "status": "ok",
  "service": "Aalm Vastralay GAS Mailer",
  "googleRemainingQuota": 500,
  "scriptSentToday": 0,
  "scriptQuotaLimit": 450,
  "timestamp": "2026-09-25T10:00:00.000Z"
}
```

---

### 2. पासवर्ड रीसेट OTP टेस्ट (cURL POST)
टर्मिनल में नीचे दिया गया कमांड चलाएं (अपना ईमेल डालकर):
```bash
curl -L -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"token":"aalm_gas_mail_secret_9988224411","type":"FORGOT_PASSWORD","to":"your_email@gmail.com","otp":"849201","name":"श्रीमान ग्राहक"}'
```
तुरंत आपके इनबॉक्स में सोने के बॉर्डर (Gold embroidery) वाला सुंदर OTP ईमेल प्राप्त होगा!

---

### 3. फेस्टिव ऑफर व मार्केटिंग टेस्ट (cURL POST)
```bash
curl -L -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"token":"aalm_gas_mail_secret_9988224411","type":"FESTIVAL_OFFER","to":"your_email@gmail.com","festivalName":"दिवाली व लग्न महासेल","discountText":"FLAT 40% OFF","headline":"शाही बनारसी साड़ी व ब्राइडल कलेक्शन","message":"कल्याणपुर समस्तीपुर की ओर से हस्तनिर्मित पारंपरिक परिधानों पर विशेष छूट।"}'
```

---

### 4. वेबसाइट UI से लाइव टेस्ट करना
1. **पासवर्ड भूल गए (Forgot Password):**
   वेबसाइट पर `/forgot-password` खोलें, अपना पंजीकृत ईमेल डालें और "Send OTP" बटन दबाएं।
2. **एडमिन मार्केटिंग ब्रॉडकास्ट (Admin Marketing Broadcast):**
   एडमिन पोर्टल में `/admin/marketing` खोलें। त्योहार ऑफर या कूपन चुनें और 1-क्लिक में टेस्ट ईमेल भेजें।

---

## 🔄 चरण 8: जब भी कोड बदलें (Important: New Version Rule)

Google Apps Script का एक नियम है: **यदि आप कोड में कोई भी बदलाव करते हैं**, तो नया कोड लाइव करने के लिए आपको नया वर्जन डिप्लॉय करना होता है:

1. कोड बदलने के बाद **Save (फ्लॉपी 💾)** दबाएं।
2. ऊपर दाईं ओर **Deploy** -> **Manage deployments (तैनातियों का प्रबंधन)** पर जाएं।
3. अपनी एक्टिव तैनाती के आगे पेंसिल ✏️ (Edit) आइकन पर क्लिक करें।
4. **Version** ड्रॉपडाउन में **"New version" (नया संस्करण)** चुनें।
5. **Deploy** पर क्लिक करें।
*(ऐसा करने से URL वही पुराना रहेगा और नया कोड तुरंत सक्रिय हो जाएगा!)*

---

## ❓ सामान्य प्रश्न व समाधान (Troubleshooting & FAQs)

| समस्या | कारण | समाधान |
| :--- | :--- | :--- |
| `{"status":"error","message":"Unauthorized token"}` | टोकन गलत है या मेल नहीं खा रहा। | Script Properties में `AUTH_TOKEN` और `.env` में `GAS_SECRET_TOKEN` दोनों में एक ही स्ट्रिंग (`aalm_gas_mail_secret_9988224411`) रखें। |
| `Script function not found: doPost` | फ़ंक्शन का नाम गलत है या कोड सेव नहीं हुआ। | सुनिश्चित करें कि कोड `Code.gs` में है और Save आइकन दबा दिया गया है। |
| ईमेल्स नहीं आ रहे | URL में `/exec` के बजाय `/dev` लगा है। | Web App URL के अंत में हमेशा `/exec` होना चाहिए (उदा. `.../exec`)। |
| Google "Unsafe app" स्क्रीन | Google की डिफ़ॉल्ट चेतावनी स्क्रीन | "Advanced" पर क्लिक करें और "Go to Aalm-Vastralay-Mailer (unsafe)" पर क्लिक करके "Allow" करें। यह 100% सुरक्षित है। |
| दैनिक सीमा (Quota Limit) समाप्त | Gmail की 500 ईमेल्स/दिन की सीमा समाप्त हुई। | कोटा हर 24 घंटे में आधी रात को रीसेट हो जाता है। यदि आवश्यकता बढ़े तो Google Workspace खाता उपयोग कर सकते हैं। |
| लोकल डेवलपमेंट में URL न होने पर क्या होगा? | `GAS_EMAIL_URL` सेट नहीं है | `src/lib/gas-mailer.ts` स्वचालित रूप से कंसोल में सिमुलेशन लॉग कर देता है, आपका लोकल सर्वर क्रैश नहीं होगा। |
