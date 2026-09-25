import { NextRequest, NextResponse } from "next/server";
import { clientIp, memoryRateLimit } from "@/lib/rate-limit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = memoryRateLimit(`label:${ip}`, 30, 60);
  if (!rate.ok) {
    return new NextResponse("Rate limit exceeded. Try again in a minute.", {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfterSeconds) },
    });
  }

  const { searchParams } = new URL(req.url);
  const rawAwb = (searchParams.get("awb") || "AWB-SAMPLE").trim();
  const rawCourier = (searchParams.get("courier") || "Delhivery").trim();
  const rawOrder = (searchParams.get("order") || "AV-SAMPLE").trim();
  const rawPin = (searchParams.get("pin") || "848302").trim();

  const awb = escapeHtml(rawAwb);
  const courier = escapeHtml(rawCourier);
  const order = escapeHtml(rawOrder);
  const pin = escapeHtml(rawPin.replace(/[^0-9]/g, "").slice(0, 6) || "848302");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shipping Label — ${awb}</title>

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 20px; background: #f8fafc; color: #0f172a; }
    .label-box { width: 380px; margin: auto; background: white; border: 2px solid #000; border-radius: 6px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
    .courier-badge { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .barcode { text-align: center; margin: 16px 0 8px; font-family: monospace; font-size: 24px; letter-spacing: 4px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; background: #f1f5f9; }
    .barcode-svg { width: 100%; height: 42px; }
    .section { border-bottom: 1px solid #cbd5e1; padding: 8px 0; font-size: 12px; }
    .section-title { font-weight: 700; text-transform: uppercase; font-size: 10px; color: #64748b; margin-bottom: 2px; }
    .routing { display: flex; justify-content: space-between; font-weight: bold; background: #000; color: #fff; padding: 4px 8px; border-radius: 4px; margin-top: 8px; }
    .footer { text-align: center; font-size: 10px; color: #64748b; margin-top: 12px; }
    @media print {
      body { background: white; margin: 0; }
      .label-box { border: 2px solid #000; box-shadow: none; width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="header">
      <div>
        <div style="font-weight: 900; font-size: 14px;">आलम वस्त्रालय</div>
        <div style="font-size: 10px; color: #64748b;">Aalm Vastralay Marketplace</div>
      </div>
      <div class="courier-badge">${courier === "Shiprocket" ? "🚀 Shiprocket" : "🚚 Delhivery Express"}</div>
    </div>

    <div class="barcode">
      <!-- Simulated Code128 Barcode lines -->
      <svg class="barcode-svg" viewBox="0 0 100 20" preserveAspectRatio="none">
        <rect x="0" width="2" height="20" fill="#000"/>
        <rect x="4" width="1" height="20" fill="#000"/>
        <rect x="7" width="3" height="20" fill="#000"/>
        <rect x="12" width="2" height="20" fill="#000"/>
        <rect x="16" width="1" height="20" fill="#000"/>
        <rect x="19" width="4" height="20" fill="#000"/>
        <rect x="25" width="2" height="20" fill="#000"/>
        <rect x="29" width="3" height="20" fill="#000"/>
        <rect x="34" width="1" height="20" fill="#000"/>
        <rect x="37" width="2" height="20" fill="#000"/>
        <rect x="41" width="3" height="20" fill="#000"/>
        <rect x="46" width="1" height="20" fill="#000"/>
        <rect x="49" width="4" height="20" fill="#000"/>
        <rect x="55" width="2" height="20" fill="#000"/>
        <rect x="59" width="1" height="20" fill="#000"/>
        <rect x="62" width="3" height="20" fill="#000"/>
        <rect x="67" width="2" height="20" fill="#000"/>
        <rect x="71" width="4" height="20" fill="#000"/>
        <rect x="77" width="2" height="20" fill="#000"/>
        <rect x="81" width="1" height="20" fill="#000"/>
        <rect x="84" width="3" height="20" fill="#000"/>
        <rect x="89" width="2" height="20" fill="#000"/>
        <rect x="93" width="1" height="20" fill="#000"/>
        <rect x="96" width="4" height="20" fill="#000"/>
      </svg>
      <div>${awb}</div>
    </div>

    <div class="routing">
      <span>DESTINATION PIN: ${pin}</span>
      <span>HUB: ${pin.slice(0, 3)}</span>
    </div>

    <div class="section">
      <div class="section-title">Order Details</div>
      <div><strong>Order ID:</strong> #${order}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</div>
      <div><strong>Weight:</strong> 0.85 kg</div>
    </div>

    <div class="section">
      <div class="section-title">Shipped From (Return Origin)</div>
      <div><strong>Aalm Vastralay</strong></div>
      <div>Main Chowk, Kalyanipur, Samastipur, Bihar - 848302</div>
      <div>Helpline: +91 8434061342</div>
    </div>

    <div class="footer">
      Generated automatically via Aalm Vastralay Direct Courier API.
      <br><button class="no-print" onclick="window.print()" style="margin-top:8px; padding:6px 12px; font-weight:bold; cursor:pointer;">🖨️ Print Label</button>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
