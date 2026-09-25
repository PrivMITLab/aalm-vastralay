/**
 * ============================================================================
 * 👑 AALM VASTRALAY — HARDENED GOOGLE APPS SCRIPT (GAS) TRANSACTIONAL MAILER
 * ============================================================================
 * 
 * ZERO COST • ZERO DOMAIN REQUIREMENT • GMAIL DELIVERABILITY (NO SPAM FOLDER)
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open Google Sheets / Google Drive -> Create a new Google Apps Script.
 * 2. Paste this entire file into Code.gs.
 * 3. In Script Properties (Project Settings), set:
 *    - AUTH_TOKEN: a strong secret string (matching GAS_SECRET_TOKEN in .env)
 * 4. Click "Deploy" -> "New deployment" -> Select type "Web app".
 *    - Execute as: "Me" (your Gmail account)
 *    - Who has access: "Anyone" (allows Next.js backend to POST)
 * 5. Copy the Web App URL and set in your .env:
 *    GAS_EMAIL_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
 *    GAS_SECRET_TOKEN="your_configured_auth_token"
 * 
 * CURL TEST MATRIX:
 * ----------------------------------------------------------------------------
 * 1. Health Ping (GET):
 *    curl -L "https://script.google.com/macros/s/.../exec?token=YOUR_TOKEN"
 * 
 * 2. OTP Test (POST):
 *    curl -L -X POST "https://script.google.com/macros/s/.../exec" \
 *      -H "Content-Type: text/plain;charset=utf-8" \
 *      -d '{"token":"YOUR_TOKEN","type":"FORGOT_PASSWORD","to":"test@example.com","otp":"284476","name":"Ram Sharma"}'
 * 
 * 3. Festival Offer Test (POST):
 *    curl -L -X POST "https://script.google.com/macros/s/.../exec" \
 *      -H "Content-Type: text/plain;charset=utf-8" \
 *      -d '{"token":"YOUR_TOKEN","type":"FESTIVAL_OFFER","to":"test@example.com","festivalName":"Diwali & Wedding Season","discountText":"FLAT 40% OFF","headline":"Grand Festive Ethnic Wear Collection","message":"Celebrate this festive season with pure Banarasi sarees and bridal lehengas handcrafted in Bihar."}'
 * ============================================================================
 */

// Daily quota ceiling for free @gmail accounts (Google allows 500, we cap at 450 for safety margin)
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

    // 5. Send email via GmailApp (with sanitized clean UTF-8 subject)
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
 * Sanitizes dynamic values to prevent HTML injection into email clients
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
        // Clean UTF-8 subject line without emoji that could cause ????? headers
        subject: "[OTP: " + otp + "] पासवर्ड रीसेट कोड (Password Reset) — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;font-size:22px;font-family:Georgia,serif;border-bottom:2px solid #f0e6d6;padding-bottom:12px;">' +
            'पासवर्ड रीसेट अनुरोध (Password Reset)' +
          '</h2>' +
          '<p style="font-size:16px;">नमस्ते <strong>' + name + '</strong>,</p>' +
          '<p>आपके आलम वस्त्रालय खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। अपना नया सुरक्षित पासवर्ड सेट करने के लिए नीचे दिए गए 6-अंकों के गोपनीय कोड (OTP) का उपयोग करें:</p>' +
          
          // Grand Gold-bordered OTP Ticket Box
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
