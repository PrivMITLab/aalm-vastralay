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
 *    - AUTH_TOKEN: a strong secret string (e.g., matching GAS_SECRET_TOKEN in .env)
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
 *      -d '{"token":"YOUR_TOKEN","type":"FORGOT_PASSWORD","to":"test@example.com","otp":"481920","name":"Ram Sharma"}'
 * 
 * 3. Order Confirmation Test (POST):
 *    curl -L -X POST "https://script.google.com/macros/s/.../exec" \
 *      -H "Content-Type: text/plain;charset=utf-8" \
 *      -d '{"token":"YOUR_TOKEN","type":"ORDER_CONFIRMATION","to":"test@example.com","orderId":"AV-2026-9901","amount":2499,"name":"Pooja Devi"}'
 * ============================================================================
 */

// Daily quota ceiling for free @gmail accounts (Google allows 500, we cap at 450 for safety margin)
var DAILY_QUOTA_LIMIT = 450;
var BRAND_NAME = "Aalm Vastralay (आलम वस्त्रालय)";
var BRAND_PHONE = "+91 8434061342";
var BRAND_EMAIL = "aalmvastralay@gmail.com";

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

    // 5. Send email via GmailApp
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
  // Store for 24 hours (86400 seconds)
  cache.put(todayKey, String(current + 1), 86400);
}

/**
 * Renders one of 7 whitelisted bilingual email templates
 */
function renderEmailTemplate(type, data) {
  var name = escapeHtml(data.name || "Customer");
  var orderId = escapeHtml(data.orderId || data.orderNumber || "");
  var otp = escapeHtml(data.otp || "");
  var amount = escapeHtml(data.amount ? ("₹" + Number(data.amount).toLocaleString("en-IN")) : "");
  var courier = escapeHtml(data.courier || "Express Courier");
  var awb = escapeHtml(data.awb || data.trackingNumber || "");
  var trackingUrl = escapeHtml(data.trackingUrl || "https://aalm-vastralay.vercel.app/orders");

  var header = 
    '<div style="background-color:#4A148C;background:linear-gradient(135deg,#4A148C 0%,#2E0854 100%);padding:24px 20px;text-align:center;border-radius:12px 12px 0 0;">' +
      '<h1 style="color:#D4AF37;margin:0;font-size:22px;letter-spacing:1px;font-family:Georgia,serif;">AALM VASTRALAY</h1>' +
      '<p style="color:#f3e5f5;margin:4px 0 0;font-size:12px;">आलम वस्त्रालय • Pure Indian Ethnic Elegance</p>' +
    '</div>';

  var footer = 
    '<div style="background:#fdfaf6;border-top:1px solid #f0e6d6;padding:16px 20px;text-align:center;font-size:12px;color:#857467;border-radius:0 0 12px 12px;">' +
      '<p style="margin:0 0 6px;">Need help? Call or WhatsApp us at <strong>' + BRAND_PHONE + '</strong></p>' +
      '<p style="margin:0;color:#a2968a;">Aalm Vastralay, Tajpur Road, Samastipur, Bihar, India.</p>' +
    '</div>';

  var wrap = function(content) {
    return '<div style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;max-width:580px;margin:20px auto;border:1px solid #e2d2ba;border-radius:12px;box-shadow:0 8px 30px rgba(74,20,140,0.06);background:#ffffff;">' +
      header +
      '<div style="padding:28px 24px;color:#1a1614;line-height:1.6;">' + content + '</div>' +
      footer +
    '</div>';
  };

  switch (type) {
    case "FORGOT_PASSWORD":
      return {
        subject: "Your Aalm Vastralay Security OTP: " + otp,
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;">Password Reset Request (पासवर्ड रीसेट)</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>We received a request to reset your password. Use the single-use OTP below to proceed:</p>' +
          '<div style="text-align:center;margin:24px 0;">' +
            '<span style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:bold;color:#4A148C;background:#f3e5f5;border:2px dashed #4A148C;padding:10px 24px;border-radius:8px;">' + otp + '</span>' +
          '</div>' +
          '<p style="font-size:13px;color:#857467;">This OTP is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>'
        ),
        text: "Namaste " + name + ",\nYour Aalm Vastralay password reset OTP is: " + otp + "\nValid for 10 minutes.\nIf you did not request this, please ignore."
      };

    case "ORDER_CONFIRMATION":
      return {
        subject: "Order Confirmed: #" + orderId + " — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;">Order Confirmed! (ऑर्डर स्वीकार हुआ)</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>Thank you for shopping with Aalm Vastralay! Your order has been placed successfully.</p>' +
          '<div style="background:#fdfaf6;border:1px solid #f0e6d6;border-radius:8px;padding:16px;margin:20px 0;">' +
            '<p style="margin:0 0 8px;"><strong>Order ID:</strong> #' + orderId + '</p>' +
            '<p style="margin:0;"><strong>Total Payable:</strong> <span style="color:#7a1f2b;font-weight:bold;font-size:16px;">' + amount + '</span></p>' +
          '</div>' +
          '<p>Our master artisans and weavers are preparing your package with utmost care. You will receive live tracking details as soon as it is dispatched.</p>'
        ),
        text: "Namaste " + name + ",\nThank you for shopping with Aalm Vastralay! Your order #" + orderId + " of " + amount + " has been confirmed.\nTrack your order anytime on our website."
      };

    case "ORDER_DISPATCHED":
      return {
        subject: "Shipped! Your order #" + orderId + " is on the way",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;">Order Dispatched! (पार्सल भेज दिया गया है)</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>Great news! Your order <strong>#' + orderId + '</strong> has been dispatched via <strong>' + courier + '</strong>.</p>' +
          '<div style="background:#fdfaf6;border:1px solid #f0e6d6;border-radius:8px;padding:16px;margin:20px 0;">' +
            '<p style="margin:0 0 8px;"><strong>Courier Partner:</strong> ' + courier + '</p>' +
            '<p style="margin:0;"><strong>Tracking AWB:</strong> <span style="font-family:monospace;font-weight:bold;">' + awb + '</span></p>' +
          '</div>' +
          '<p style="text-align:center;margin:24px 0;">' +
            '<a href="' + trackingUrl + '" style="background:#4A148C;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:99px;font-weight:bold;display:inline-block;">Track Your Package</a>' +
          '</div>'
        ),
        text: "Namaste " + name + ",\nYour order #" + orderId + " has been dispatched via " + courier + " with AWB " + awb + ".\nTrack package: " + trackingUrl
      };

    case "UPI_VERIFIED":
      return {
        subject: "Payment Verified for Order #" + orderId + " — Aalm Vastralay",
        html: wrap(
          '<h2 style="color:#2e7d32;margin-top:0;">Payment Verified! (भुगतान सत्यापित)</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>We have successfully verified your UPI payment for Order <strong>#' + orderId + '</strong>.</p>' +
          '<p>Your order is now being processed for priority dispatch.</p>'
        ),
        text: "Namaste " + name + ",\nYour UPI payment for Order #" + orderId + " has been verified successfully. Your order is now under processing."
      };

    case "SELLER_WELCOME":
      return {
        subject: "Welcome to Aalm Vastralay Seller Hub! — विक्रेता पोर्टल",
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;">Welcome to Aalm Vastralay!</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>Congratulations! Your seller store application has been approved. You can now start listing your ethnic wear collections to thousands of customers across India with <strong>0% commission</strong> for your first 6 months.</p>' +
          '<p style="text-align:center;margin:24px 0;">' +
            '<a href="https://aalm-vastralay.vercel.app/seller" style="background:#4A148C;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:99px;font-weight:bold;display:inline-block;">Open Seller Dashboard</a>' +
          '</div>'
        ),
        text: "Namaste " + name + ",\nWelcome to Aalm Vastralay Seller Hub! Your store is approved. Access your dashboard at https://aalm-vastralay.vercel.app/seller"
      };

    case "RETURN_REQUESTED":
      return {
        subject: "Return Request Received for Order #" + orderId,
        html: wrap(
          '<h2 style="color:#7a1f2b;margin-top:0;">Return Request Logged</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>We have received your return request for order <strong>#' + orderId + '</strong> under our 7-day hassle-free return policy.</p>' +
          '<p>Our team will contact you or arrange reverse courier pickup within 24-48 business hours.</p>'
        ),
        text: "Namaste " + name + ",\nYour return request for Order #" + orderId + " has been received. Our team will arrange pickup within 24-48 hours."
      };

    case "GENERAL":
      var subject = escapeHtml(data.subject || "Notification from Aalm Vastralay");
      var body = escapeHtml(data.body || "");
      return {
        subject: subject,
        html: wrap(
          '<h2 style="color:#4A148C;margin-top:0;">' + subject + '</h2>' +
          '<p>Namaste <strong>' + name + '</strong>,</p>' +
          '<p>' + body.replace(/\n/g, "<br/>") + '</p>'
        ),
        text: "Namaste " + name + ",\n\n" + (data.body || "")
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
