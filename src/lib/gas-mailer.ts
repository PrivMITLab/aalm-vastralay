/**
 * 👑 AALM VASTRALAY — Google Apps Script (GAS) Mailer Client
 * Enables 100% free transactional emails (OTP, password reset, order notifications)
 * directly from Gmail without requiring custom domain DNS verification (SPF/DKIM/MX).
 */

export type GasEmailPayload =
  | {
      type: "FORGOT_PASSWORD";
      to: string;
      otp: string;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "ORDER_CONFIRMATION";
      to: string;
      orderId: string;
      amount: number;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "ORDER_DISPATCHED";
      to: string;
      orderId: string;
      courier: string;
      awb: string;
      trackingUrl?: string;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "UPI_VERIFIED";
      to: string;
      orderId: string;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "SELLER_WELCOME";
      to: string;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "RETURN_REQUESTED";
      to: string;
      orderId: string;
      name?: string | null;
      subject?: string;
    }
  | {
      type: "GENERAL";
      to: string;
      subject: string;
      body: string;
      name?: string | null;
    };

export type GasEmailResult = {
  ok: boolean;
  message?: string;
  simulated?: boolean;
};

/**
 * Sends a transactional email through Google Apps Script Web App.
 * Fallbacks gracefully if GAS_EMAIL_URL is not yet configured in local development.
 */
export async function sendGasEmail(payload: GasEmailPayload): Promise<GasEmailResult> {
  const gasUrl = process.env.GAS_EMAIL_URL?.trim();
  const token = process.env.GAS_SECRET_TOKEN?.trim() || "aalm_gas_mail_secret_9988224411";

  // Graceful offline/local development fallback
  if (!gasUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[GAS-MAILER SIMULATED] Would send email type "${payload.type}" to <${payload.to}>:`, payload);
    }
    return {
      ok: true,
      simulated: true,
      message: "GAS_EMAIL_URL is not set. Simulated successfully in development mode.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ ...payload, token }),
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ok: false, message: `GAS returned HTTP status ${res.status}` };
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text) as { status: string; message?: string };
      if (data.status === "success" || data.status === "ok") {
        return { ok: true };
      }
      return { ok: false, message: data.message || "Unknown GAS error" };
    } catch {
      // In some Google Apps Script deployments, redirect HTML is returned on success
      return { ok: true };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GAS-MAILER Error]", msg);
    return { ok: false, message: msg };
  }
}
