/**
 * 👑 AALM VASTRALAY — UNIT TEST: 1-CLICK WHATSAPP INTEGRATION
 * Validates Option B:
 *  - Phone number sanitization
 *  - Customer order confirmation link construction
 *  - Bridal / wedding consultation inquiry link
 *  - Admin / seller dispatch tracking link
 */

import {
  cleanWhatsAppPhone,
  createWhatsAppOrderConfirmLink,
  createWhatsAppWeddingConsultLink,
  createWhatsAppDispatchLink,
} from "../../src/lib/whatsapp";

export async function testWhatsAppIntegration() {
  console.log("  ▶ Running 1-Click WhatsApp Integration Tests...");

  // 1. Phone number sanitization
  const clean1 = cleanWhatsAppPhone("8434061342");
  if (clean1 !== "918434061342") {
    throw new Error(`Failed: 10-digit number must have 91 prefix! Got: ${clean1}`);
  }

  const clean2 = cleanWhatsAppPhone("+91 84340 61342");
  if (clean2 !== "918434061342") {
    throw new Error(`Failed: Formatted phone must normalize to 918434061342! Got: ${clean2}`);
  }

  // 2. Order confirmation link
  const confirmLink = createWhatsAppOrderConfirmLink({
    orderNumber: "AV-1082",
    itemsSummary: "Royal Velvet Lehenga, Size L",
    total: 3999,
  });

  if (!confirmLink.startsWith("https://wa.me/918434061342?text=")) {
    throw new Error(`Failed: WhatsApp order confirm link malformed: ${confirmLink}`);
  }
  const decodedConfirm = decodeURIComponent(confirmLink);
  if (!decodedConfirm.includes("AV-1082") || !decodedConfirm.includes("Royal Velvet Lehenga") || !decodedConfirm.includes("3999")) {
    throw new Error(`Failed: Order confirm message missing key details: ${decodedConfirm}`);
  }

  // 3. Wedding consultation link
  const consultLink = createWhatsAppWeddingConsultLink({
    productTitle: "Banarasi Silk Bridal Saree",
    productSlug: "banarasi-silk-bridal-saree",
  });
  const decodedConsult = decodeURIComponent(consultLink);
  if (!decodedConsult.includes("Banarasi Silk Bridal Saree") || !decodedConsult.includes("wedding consultation")) {
    throw new Error(`Failed: Wedding consult message missing details: ${decodedConsult}`);
  }

  // 4. Dispatch tracking link
  const dispatchLink = createWhatsAppDispatchLink({
    customerName: "Priya Sharma",
    customerPhone: "9876543210",
    orderNumber: "AV-1082",
    courier: "BlueDart Express",
    trackingNumber: "BD987654321",
  });
  if (!dispatchLink.startsWith("https://wa.me/919876543210?text=")) {
    throw new Error(`Failed: Dispatch link should target customer phone: ${dispatchLink}`);
  }
  const decodedDispatch = decodeURIComponent(dispatchLink);
  if (!decodedDispatch.includes("Priya Sharma") || !decodedDispatch.includes("BD987654321")) {
    throw new Error(`Failed: Dispatch message missing tracking info: ${decodedDispatch}`);
  }

  console.log("  ✔ 1-Click WhatsApp order confirmation, bridal consult & dispatch tracking verified!");
}
