/**
 * 👑 AALM VASTRALAY — 1-CLICK WHATSAPP INTEGRATION ENGINE
 *
 * Implements direct WhatsApp automation for Indian ethnic commerce:
 *  - 1-Click Order Confirmation (Customer -> Store)
 *  - Wedding / Bridal Consultation & Custom Measurement (Customer -> Bridal Stylist)
 *  - 1-Click Dispatch & Live Tracking Notification (Admin/Seller -> Customer)
 */

export const DEFAULT_STORE_WHATSAPP = "918434061342";

/**
 * Standardizes any phone input into an international WhatsApp-compatible number string (91XXXXXXXXXX).
 */
export function cleanWhatsAppPhone(phone?: string | null): string {
  if (!phone) return DEFAULT_STORE_WHATSAPP;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return digits || DEFAULT_STORE_WHATSAPP;
}

/**
 * Generates customer 1-click WhatsApp order confirmation link.
 */
export function createWhatsAppOrderConfirmLink(params: {
  phone?: string | null;
  orderNumber: string;
  itemsSummary?: string;
  total: number;
}): string {
  const targetNumber = cleanWhatsAppPhone(params.phone);
  const itemsText = params.itemsSummary ? ` (${params.itemsSummary})` : "";
  const message = `Namaste Aalam Vastralay, maine Order #${params.orderNumber}${itemsText} book kiya hai. Total: ₹${params.total}. Please confirm kijiye.`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates customer wedding / bridal consultation & custom stitching inquiry link.
 */
export function createWhatsAppWeddingConsultLink(params: {
  phone?: string | null;
  productTitle: string;
  productSlug?: string;
}): string {
  const targetNumber = cleanWhatsAppPhone(params.phone);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://aalmvastralay.in";
  const productLink = params.productSlug ? `\nLink: ${siteUrl}/products/${params.productSlug}` : "";

  const message = `Namaste Aalam Vastralay, mujhe "${params.productTitle}" ke baare mein wedding consultation / stitching measurements discuss karni hai.${productLink}`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates admin/seller 1-click dispatch tracking WhatsApp link for customers.
 */
export function createWhatsAppDispatchLink(params: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  courier?: string | null;
  trackingNumber?: string | null;
}): string {
  const customerNumber = cleanWhatsAppPhone(params.customerPhone);
  const courierText = params.courier || "Delivery Partner";
  const trackingText = params.trackingNumber ? `\nTracking No: ${params.trackingNumber}` : "";

  const message = `Namaste ${params.customerName}, aapka Aalam Vastralay order #${params.orderNumber} dispatch ho gaya hai! 📦\nCourier: ${courierText}${trackingText}\n\nKisi bhi sahayata ke liye yahan reply karein. Dhanyawaad!`;

  return `https://wa.me/${customerNumber}?text=${encodeURIComponent(message)}`;
}
