import nodemailer, { type Transporter } from "nodemailer";

/**
 * 👑 AALM VASTRALAY — DUAL HYBRID TRANSACTIONAL EMAIL ENGINE
 * Location: src/lib/email.ts
 *
 * HYBRID DUAL-ENGINE ARCHITECTURE:
 * 1. Primary: Direct Gmail SMTP (smtp.gmail.com) via Nodemailer
 *    - Quota: 500 emails / day (Free @gmail.com) | 2,000 emails / day (Workspace)
 *    - Latency: ~300-600ms direct TLS socket
 *    - Activated when: `SMTP_USER` and `SMTP_PASSWORD` / `EMAIL_SERVER_PASSWORD` are set.
 *
 * 2. Fallback / Alternative: Google Apps Script (GAS) Webhook
 *    - Quota: 100 emails / day (Free @gmail.com) | 1,500 emails / day (Workspace)
 *    - Zero-credential mode: No email password stored on Vercel; authenticated via GAS_SECRET_TOKEN.
 *    - Activated when: SMTP is not configured OR if SMTP encounters an operational error/quota limit.
 *
 * 3. Offline / Dev Simulation:
 *    - Safely logs simulated dispatch in non-production environments when no credentials exist.
 */

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  delivered?: boolean;
  provider?: "smtp" | "gas" | "simulated";
  error?: string;
};

// Cached SMTP connection pool for serverless reuse
let cachedTransporter: Transporter | null = null;

/**
 * Creates or retrieves the cached Nodemailer SMTP transporter.
 */
function getSmtpTransporter(): Transporter | null {
  const user = process.env.SMTP_USER?.trim() || process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim() || process.env.EMAIL_SERVER_PASSWORD?.trim();

  if (!user || !pass) {
    return null;
  }

  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }

  return cachedTransporter;
}

/**
 * Escapes special HTML characters to prevent email template HTML injection (XSS).
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
 * Sends email via Direct Gmail SMTP (500 limit).
 */
async function sendViaSmtp(
  transporter: Transporter,
  { to, subject, html, text }: SendEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    `"Aalm Vastralay (आलम वस्त्रालय)" <${process.env.SMTP_USER?.trim() || process.env.EMAIL_SERVER_USER?.trim()}>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: to.trim().toLowerCase(),
      subject,
      html,
      text: text || subject,
    });
    return { ok: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[email:smtp] Failed to send email via SMTP:", errorMsg);
    return { ok: false, error: errorMsg };
  }
}

/**
 * Sends email via Google Apps Script (GAS) Webhook (100 limit).
 */
async function sendViaGas(
  webhookUrl: string,
  { to, subject, html, text }: SendEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GAS_SECRET_TOKEN?.trim() || "aalm_gas_mail_secret_9988224411";

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
      return { ok: false, error: `GAS returned HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[email:gas] Failed to send email via GAS Webhook:", errorMsg);
    return { ok: false, error: errorMsg };
  }
}

/**
 * Master Hybrid Dispatcher.
 * Automatically tries Gmail SMTP first (500 emails/day), then gracefully falls back
 * to Google Apps Script (100 emails/day) if SMTP is unavailable or exhausts quota.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<SendEmailResult> {
  const cleanTo = to.trim().toLowerCase();

  // 1. Primary Engine: Try Direct Gmail SMTP (500 emails/day)
  const smtp = getSmtpTransporter();
  if (smtp) {
    const smtpRes = await sendViaSmtp(smtp, { to: cleanTo, subject, html, text });
    if (smtpRes.ok) {
      return { ok: true, delivered: true, provider: "smtp" };
    }
    console.warn(`[email] SMTP primary failed (${smtpRes.error}). Initiating automatic fallback to GAS...`);
  }

  // 2. Secondary Engine: Try Google Apps Script Webhook (100 emails/day)
  const gasWebhookUrl =
    process.env.GAS_WEBHOOK_URL?.trim() ||
    process.env.GAS_EMAIL_URL?.trim() ||
    process.env.QUIETMAIL_API_URL?.trim();

  if (gasWebhookUrl) {
    const gasRes = await sendViaGas(gasWebhookUrl, { to: cleanTo, subject, html, text });
    if (gasRes.ok) {
      return { ok: true, delivered: true, provider: "gas" };
    }
    console.error(`[email] GAS secondary fallback failed: ${gasRes.error}`);
    return { ok: false, delivered: false, provider: "gas", error: gasRes.error };
  }

  // 3. Fallback: Simulation mode for local dev / offline testing
  if (process.env.NODE_ENV !== "production") {
    console.log(`[EMAIL SIMULATED - No SMTP or GAS configured] To: ${cleanTo} | Subject: "${subject}"`);
  }
  return { ok: true, delivered: false, provider: "simulated" };
}

/**
 * Order confirmation email template (Preserved for full backward compatibility)
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
