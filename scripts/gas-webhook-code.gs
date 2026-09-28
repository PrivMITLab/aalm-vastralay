/**
 * ============================================================================
 * 👑 AALM VASTRALAY (आलम वस्त्रालय) — GOOGLE APPS SCRIPT (GAS) EMAIL WEBHOOK
 * ============================================================================
 * 
 * 100% FREE TRANSACTIONAL EMAIL ENGINE (POWERED BY GMAIL)
 * NO DOMAIN REQUIRED • NO DNS/SPF/DKIM HEADACHES • DIRECT PRIMARY INBOX DELIVERY
 * 
 * ----------------------------------------------------------------------------
 * 📋 SETUP INSTRUCTIONS (कैसे सेट करें):
 * ----------------------------------------------------------------------------
 * 1. Open https://script.google.com/home and click "+ New project".
 * 2. Rename the project to: "Aalm-Vastralay-Auth-Mailer"
 * 3. Delete all code in Code.gs and PASTE THIS ENTIRE FILE.
 * 4. Update GAS_SECRET_TOKEN below (must match GAS_SECRET_TOKEN in your .env).
 * 5. Click "Deploy" (नीली बटन) -> "New deployment".
 * 6. Select Type: "Web app" (⚙️ icon).
 *    - Description: "Production Mailer Webhook v1"
 *    - Execute as: "Me (your-gmail@gmail.com)"
 *    - Who has access: "Anyone" (⚠️ Crucial: Anyone select karein taaki Next.js call kar sake)
 * 7. Click "Deploy" -> Click "Authorize access" -> Choose your Google Account ->
 *    Click "Advanced" -> Click "Go to Aalm-Vastralay-Auth-Mailer (unsafe)" -> Click "Allow".
 * 8. Copy the "Web app URL" (ends with /exec).
 * 9. Paste it into your .env / Vercel Environment Variables:
 *    GAS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
 *    GAS_SECRET_TOKEN="aalm_gas_mail_secret_9988224411"
 * ============================================================================
 */

// 🔒 Shared Secret Token (Must match GAS_SECRET_TOKEN in Next.js .env)
var GAS_SECRET_TOKEN = "aalm_gas_mail_secret_9988224411";

// 👑 Brand Identity
var BRAND_NAME = "आलम वस्त्रालय (Aalm Vastralay)";
var BRAND_REPLY_TO = "support@aalmvastralay.in";

// 🛡️ Daily quota safety ceiling (Google allows 500 emails/day on free @gmail.com)
var DAILY_QUOTA_LIMIT = 450;

/**
 * Handle HTTP GET Requests (Health Check & Quota Inspection)
 */
function doGet(e) {
  var token = e && e.parameter && e.parameter.token;
  if (token !== GAS_SECRET_TOKEN) {
    return jsonResponse({ status: "error", message: "Unauthorized token" }, 401);
  }

  var remainingQuota = MailApp.getRemainingDailyQuota();
  return jsonResponse({
    status: "ok",
    service: "Aalm Vastralay GAS Mailer Webhook",
    remainingDailyQuota: remainingQuota,
    timestamp: new Date().toISOString()
  }, 200);
}

/**
 * Handle HTTP POST Requests from Next.js (Better Auth / System)
 */
function doPost(e) {
  try {
    // 1. Verify payload exists
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Empty request body" }, 400);
    }

    // 2. Parse incoming JSON
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return jsonResponse({ status: "error", message: "Invalid JSON format" }, 400);
    }

    // 3. Security Token Verification (Prevent unauthorized spam)
    if (!data.token || data.token !== GAS_SECRET_TOKEN) {
      return jsonResponse({
        status: "error",
        message: "Unauthorized: Invalid or missing secret token"
      }, 401);
    }

    // 4. Validate Recipient Email
    var to = (data.to || "").trim().toLowerCase();
    if (!to || !to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return jsonResponse({ status: "error", message: "Invalid recipient email address" }, 400);
    }

    var subject = data.subject || "आलम वस्त्रालय (Aalm Vastralay) Notification";
    var htmlBody = data.html || data.htmlBody || ("<p>" + (data.text || "") + "</p>");
    var plainText = data.text || subject;

    // 5. Quota Circuit Breaker (Protect Gmail account from suspension)
    var remaining = MailApp.getRemainingDailyQuota();
    if (remaining <= 5) {
      return jsonResponse({
        status: "error",
        message: "Daily Gmail quota nearly exhausted. Emails temporarily paused."
      }, 429);
    }

    // 6. Send Email via GmailApp (Native Primary Inbox Delivery)
    GmailApp.sendEmail(to, subject, plainText, {
      htmlBody: htmlBody,
      name: BRAND_NAME,
      replyTo: BRAND_REPLY_TO
    });

    return jsonResponse({
      status: "success",
      message: "Email successfully delivered to " + to,
      remainingQuota: remaining - 1
    }, 200);

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    }, 500);
  }
}

/**
 * Helper to construct JSON response
 */
function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
