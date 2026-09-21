import "server-only";

/**
 * Transactional email via quiet-mail (free, unlimited).
 * Configure QUIETMAIL_API_URL + QUIETMAIL_API_KEY; without them the message is logged so the
 * flow keeps working in development.
 */
type Mail = { to: string; subject: string; html: string; text?: string };

export async function sendEmail(mail: Mail) {
  const url = process.env.QUIETMAIL_API_URL;
  const key = process.env.QUIETMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Aalm Vastralay <orders@aalmvastralay.in>";

  if (!url || !key) {
    console.log(`[email:dev] to=${mail.to} subject="${mail.subject}"`);
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, ...mail }),
    });
    return { ok: res.ok, delivered: res.ok };
  } catch (error) {
    console.error("[email] failed", error);
    return { ok: false, delivered: false };
  }
}

export function orderConfirmationHtml(params: {
  name: string;
  orderNumbers: string[];
  total: number;
  paymentMethod: string;
}) {
  const { name, orderNumbers, total, paymentMethod } = params;
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:auto;border:1px solid #eee;padding:24px">
    <h2 style="color:#7a1f2b;margin:0 0 12px">Aalm Vastralay</h2>
    <p>Namaste ${name},</p>
    <p>Thank you for your order! Your order number${orderNumbers.length > 1 ? "s are" : " is"} <strong>${orderNumbers.join(", ")}</strong>.</p>
    <p>Total payable: <strong>₹${total.toFixed(2)}</strong> (${paymentMethod.toUpperCase()})</p>
    <p>You can track your order from the Orders section of your account. 7-day easy returns apply.</p>
    <p style="color:#888;font-size:12px">This is an automated message from Aalm Vastralay.</p>
  </div>`;
}
