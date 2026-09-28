
/**
 * 👑 AALM VASTRALAY — Transactional Email Utility (Google Apps Script Webhook)
 *
 * 100% Free Transactional Email Provider powered by Google Apps Script (Gmail).
 *
 * SECURITY DESIGN:
 * 1. GAS Secret Token: The GAS Webhook URL is public on the web. We must attach
 *    `token: process.env.GAS_SECRET_TOKEN` in every payload. The Google Apps Script
 *    validates this secret before sending emails to prevent unauthorized spam.
 * 2. Timing Attack Mitigation: Better Auth and authentication callbacks MUST call
 *    this function using `void sendEmail(...)` without `await`. Awaiting email dispatch
 *    allows attackers to measure server latency differences to enumerate valid accounts.
 * 3. HTML Escaping: Dynamic user inputs (e.g. name, email, OTP) MUST be sanitized
 *    using `escapeHtml(...)` to prevent HTML injection / email template XSS.
 */

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Escapes special HTML characters to prevent email HTML injection attacks.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sends transactional email via Google Apps Script (GAS) Webhook.
 * Handles errors gracefully without throwing to the caller so client auth flows
 * never crash due to transient email network blips.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ ok: boolean; delivered?: boolean; error?: string }> {
  // Support both GAS_WEBHOOK_URL and existing GAS_EMAIL_URL for seamless zero-config backward compatibility
  const webhookUrl = process.env.GAS_WEBHOOK_URL?.trim() || process.env.GAS_EMAIL_URL?.trim() || process.env.QUIETMAIL_API_URL?.trim();
  const token = process.env.GAS_SECRET_TOKEN?.trim() || "aalm_gas_mail_secret_9988224411";

  // Development/Offline Mock fallback
  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[EMAIL SIMULATED - GAS_WEBHOOK_URL not set] To: ${to} | Subject: "${subject}"`);
    }
    return { ok: true, delivered: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const payload = {
      to: to.trim().toLowerCase(),
      subject,
      html,
      text: text || subject,
      token,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[email] GAS Webhook returned HTTP ${res.status}`);
      return { ok: false, delivered: false, error: `HTTP ${res.status}` };
    }

    return { ok: true, delivered: true };
  } catch (error) {
    // Log gracefully, do not throw to the caller
    const message = error instanceof Error ? error.message : String(error);
    console.error("[email] Failed to send email via GAS Webhook:", message);
    return { ok: false, delivered: false, error: message };
  }
}

/**
 * Order confirmation email template (Preserved for backward compatibility)
 */
export function orderConfirmationHtml(params: {
  name: string;
  orderNumbers: string[];
  total: number;
  paymentMethod: string;
}) {
  const safeName = escapeHtml(params.name);
  const safeOrders = params.orderNumbers.map(escapeHtml).join(", ");
  const safeTotal = params.total.toFixed(2);
  const safeMethod = escapeHtml(params.paymentMethod.toUpperCase());

  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:auto;border:1px solid #eee;padding:24px;background:#faf8f5;">
    <h2 style="color:#7a1f2b;margin:0 0 12px">आलम वस्त्रालय (Aalm Vastralay)</h2>
    <p>Namaste ${safeName},</p>
    <p>Thank you for your order! Your order number${params.orderNumbers.length > 1 ? "s are" : " is"} <strong>${safeOrders}</strong>.</p>
    <p>Total payable: <strong>₹${safeTotal}</strong> (${safeMethod})</p>
    <p>You can track your order from the Orders section of your account. 7-day easy returns apply.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">This is an automated message from Aalm Vastralay.</p>
  </div>`;
}
