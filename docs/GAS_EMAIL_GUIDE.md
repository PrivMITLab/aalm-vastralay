# 📧 Aalm Vastralay — Google Apps Script (GAS) Transactional Mailer Guide

यह गाइड आपको बिना किसी कस्टम डोमेन (बिना SPF/DKIM/MX रिकॉर्ड्स) और बिना किसी पेड सर्विस (जैसे Resend/SendGrid/Clerk) के, 100% मुफ़्त में **पासवर्ड रीसेट OTP** और **ऑर्डर कन्फर्मेशन ईमेल्स** सीधे आपके Gmail खाते से भेजने की पूरी विधि समझाती है।

---

## ⚡ 1. Google Apps Script में कोड लगाना (Script Setup)

1. अपने ब्राउज़र में [**script.google.com**](https://script.google.com) खोलें।
2. ऊपर बाईं तरफ **"New project"** पर क्लिक करें।
3. प्रोजेक्ट का नाम रखें: `Aalm-Vastralay-Mailer`
4. डिफ़ॉल्ट कोड हटाकर नीचे दिया गया कोड पेस्ट करें:

```javascript
// =============================================================================
// 👑 AALM VASTRALAY — SECURE TRANSACTIONAL GMAIL MAILER
// =============================================================================

// यह गुप्त टोकन Next.js सर्वर और आपके GAS के बीच सुरक्षा बनाए रखता है
const SECRET_TOKEN = "aalm_gas_mail_secret_9988224411";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "No data payload received" });
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. सीक्रेट टोकन सुरक्षा सत्यापन
    if (payload.token !== SECRET_TOKEN) {
      return responseJSON({ status: "error", message: "Unauthorized: Invalid Secret Token" });
    }

    const { type, to, subject, otp, name, orderId, amount } = payload;

    if (!to) {
      return responseJSON({ status: "error", message: "Missing recipient email" });
    }

    let emailSubject = subject || "Aalm Vastralay Notification";
    let htmlContent = "";

    // 2. पासवर्ड रीसेट OTP टेम्पलेट (Royal & Elegant Design)
    if (type === "FORGOT_PASSWORD") {
      emailSubject = "🔐 पासवर्ड रीसेट OTP — आलम वस्त्रालय (Aalm Vastralay)";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4A148C; margin: 0; font-size: 24px;">आलम वस्त्रालय (Aalm Vastralay)</h1>
            <p style="color: #D4AF37; margin: 4px 0 0 0; font-weight: bold; font-size: 13px;">WEDDING & ETHNIC WEAR · KALYANIPUR</p>
          </div>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 15px; color: #1e293b;">नमस्ते <strong>${name || "ग्राहक"}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            आपके आलम वस्त्रालय खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। अपना नया पासवर्ड बनाने के लिए नीचे दिए गए 6-अंकों के गुप्त OTP का उपयोग करें:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4A148C; background: #faf5ff; padding: 12px 30px; border-radius: 12px; border: 2px dashed #D4AF37;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 12px; color: #dc2626; text-align: center;">
            ⏰ यह OTP केवल <strong>15 मिनट</strong> के लिए मान्य है। किसी के साथ शेयर न करें।
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            यदि आपने यह अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं। आपका खाता सुरक्षित है।<br>
            सहायता के लिए संपर्क करें: <strong>8434061342</strong>
          </p>
        </div>
      `;
    }

    // 3. ऑर्डर कन्फर्मेशन टेम्पलेट
    else if (type === "ORDER_CONFIRMATION") {
      emailSubject = `🎉 ऑर्डर कन्फर्मेशन #${orderId} — आलम वस्त्रालय`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #4A148C;">धन्यवाद! आपका ऑर्डर स्वीकार कर लिया गया है।</h2>
          <p>ऑर्डर नंबर: <strong>#${orderId}</strong></p>
          <p>कुल राशि: <strong>₹${amount}</strong></p>
          <p>हम जल्द ही आपका ऑर्डर पैक करके कूरियर ट्रैकिंग डिटेल्स WhatsApp पर भेज देंगे।</p>
        </div>
      `;
    }

    // 4. सामान्य ईमेल टेम्पलेट
    else {
      htmlContent = `<p>${payload.body || ""}</p>`;
    }

    // 5. Gmail से सीधे भेजें (100% Inbox Delivery)
    GmailApp.sendEmail(to, emailSubject, "", {
      name: "Aalm Vastralay",
      htmlBody: htmlContent,
    });

    return responseJSON({ status: "success", message: "Email sent successfully" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🚀 2. Web App के रूप में डिप्लॉय करना (Deployment)

1. ऊपर **Save (फ्लॉपी आइकन)** दबाएं।
2. ऊपर नीले रंग के बटन **Deploy** पर क्लिक करें और **New deployment** चुनें।
3. गियर आइकन से **Web app** चुनें:
   - **Execute as:** `Me (आपका_ईमेल@gmail.com)`
   - **Who has access:** `Anyone` (ताकि Next.js सर्वर इसे टोकन के साथ सुरक्षित कॉल कर सके)
4. **Deploy** पर क्लिक करें।
5. गूगल परमिशन मांगेगा -> **Authorize Access** -> Gmail चुनें -> **Advanced** -> **Go to Aalm-Vastralay-Mailer (unsafe)** -> **Allow**।
6. अब आपको **Web App URL** मिलेगा, जैसे:
   `https://script.google.com/macros/s/AKfycb.../exec`
   👉 इसे कॉपी कर लें!

---

## 🔒 3. Next.js व Vercel Environment Variables

Vercel Dashboard (`Settings -> Environment Variables`) या लोकल `.env.local` में ये 2 वैरिएबल जोड़ें:

```env
GAS_EMAIL_URL="https://script.google.com/macros/s/AKfycb.../exec"
GAS_SECRET_TOKEN="aalm_gas_mail_secret_9988224411"
```
