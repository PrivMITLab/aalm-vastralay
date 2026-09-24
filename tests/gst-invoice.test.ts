/**
 * 👑 AALM VASTRALAY — STATUTORY GST TAX INVOICE & LIFECYCLE TEST SUITE
 * Validates Rule 46 CGST compliance:
 * 1. Statutory HSN Resolution across ethnic categories
 * 2. Place of supply & 2-digit Indian GST state codes
 * 3. Intra-State Bihar split (CGST 2.5% + SGST 2.5%) vs Inter-State (IGST 5.0%)
 * 4. Indian number-to-words currency formatting
 * 5. Full invoice data model and HSN group reconciliation
 * 6. Order lifecycle status push notification payload dispatching
 */

import {
  buildGstInvoice,
  getStateCode,
  HSN_MAPPINGS,
  isBiharIntraState,
  numberToWordsINR,
  resolveHsnCode,
  SUPPLIER_ORIGIN,
} from "../src/lib/gst-invoice";
import { buildStatusNotificationPayload } from "../src/lib/push";

export async function testGstInvoice() {
  console.log("  ▶ Running Statutory GST Tax Invoice & Lifecycle Tests...");

  // -------------------------------------------------------------
  // 1. Statutory HSN Resolution
  // -------------------------------------------------------------
  // Sarees -> HSN 5007
  const sareeHsn1 = resolveHsnCode("Sarees", "Banarasi Katan Silk Saree");
  const sareeHsn2 = resolveHsnCode(null, "Pure Kanjivaram Bridal Sari", ["chanderi", "handloom"]);
  if (sareeHsn1 !== HSN_MAPPINGS.SAREES || sareeHsn2 !== HSN_MAPPINGS.SAREES) {
    throw new Error(`Failed: Saree HSN mapping expected 5007, got ${sareeHsn1}, ${sareeHsn2}`);
  }

  // Lehengas -> HSN 6204
  const lehengaHsn = resolveHsnCode("bridal-lehengas", "Royal Crimson Zardozi Lehenga Choli");
  if (lehengaHsn !== HSN_MAPPINGS.LEHENGAS) {
    throw new Error(`Failed: Lehenga HSN mapping expected 6204, got ${lehengaHsn}`);
  }

  // Sherwanis / Kurtas -> HSN 6203
  const sherwaniHsn = resolveHsnCode("groom-wear", "Imperial Royal Silk Sherwani");
  const kurtaHsn = resolveHsnCode("Men", "Festive Embroidered Silk Kurta Set");
  if (sherwaniHsn !== HSN_MAPPINGS.SHERWANIS_KURTAS || kurtaHsn !== HSN_MAPPINGS.SHERWANIS_KURTAS) {
    throw new Error(`Failed: Sherwani/Kurta HSN mapping expected 6203, got ${sherwaniHsn}, ${kurtaHsn}`);
  }

  // Dupattas -> HSN 6214
  const dupattaHsn = resolveHsnCode("accessories", "Handwoven Banarasi Silk Dupatta");
  const shawlHsn = resolveHsnCode(null, "Kashmiri Pashmina Shawl");
  if (dupattaHsn !== HSN_MAPPINGS.DUPATTAS || shawlHsn !== HSN_MAPPINGS.DUPATTAS) {
    throw new Error(`Failed: Dupatta/Shawl HSN mapping expected 6214, got ${dupattaHsn}, ${shawlHsn}`);
  }

  // Accessories & Jewellery -> HSN 7117
  const jewelHsn = resolveHsnCode("jewellery", "Kundan Bridal Choker Necklace Set");
  const earringHsn = resolveHsnCode(null, "Gold Plated Jhumka Earrings");
  const potliHsn = resolveHsnCode(null, "Embroidered Velvet Bridal Potli Bag");
  if (
    jewelHsn !== HSN_MAPPINGS.ACCESSORIES_JEWELLERY ||
    earringHsn !== HSN_MAPPINGS.ACCESSORIES_JEWELLERY ||
    potliHsn !== HSN_MAPPINGS.ACCESSORIES_JEWELLERY
  ) {
    throw new Error(`Failed: Accessory/Jewellery HSN mapping expected 7117, got ${jewelHsn}`);
  }

  // Fallback -> HSN 6204
  const defaultHsn = resolveHsnCode("general", "Handcrafted Silk Anarkali");
  if (defaultHsn !== HSN_MAPPINGS.DEFAULT_APPAREL) {
    throw new Error(`Failed: Fallback HSN mapping expected 6204, got ${defaultHsn}`);
  }

  // -------------------------------------------------------------
  // 2. Place of Supply & State Codes
  // -------------------------------------------------------------
  if (getStateCode("Bihar") !== "10" || getStateCode("bihar") !== "10" || getStateCode("BR") !== "10") {
    throw new Error(`Failed: Bihar state code resolution failed: ${getStateCode("Bihar")}`);
  }
  if (!isBiharIntraState("Bihar") || !isBiharIntraState("10") || !isBiharIntraState("br")) {
    throw new Error("Failed: Bihar intra-state check failed for Bihar address");
  }

  if (getStateCode("Delhi") !== "07" || isBiharIntraState("Delhi")) {
    throw new Error("Failed: Delhi state code or inter-state check failed");
  }
  if (getStateCode("Uttar Pradesh") !== "09" || isBiharIntraState("Uttar Pradesh")) {
    throw new Error("Failed: Uttar Pradesh state code or inter-state check failed");
  }
  if (getStateCode("West Bengal") !== "19" || isBiharIntraState("West Bengal")) {
    throw new Error("Failed: West Bengal state code or inter-state check failed");
  }
  if (getStateCode("Maharashtra") !== "27" || isBiharIntraState("Maharashtra")) {
    throw new Error("Failed: Maharashtra state code or inter-state check failed");
  }

  // -------------------------------------------------------------
  // 3. Intra-State Tax Split (Bihar destination: CGST 2.5% + SGST 2.5%)
  // -------------------------------------------------------------
  const intraOrder = {
    id: "e7c5b6b1-4f13-4c91-b3b4-5c91b3b45c91",
    orderNumber: "AV-1082",
    createdAt: new Date("2026-09-20T10:00:00Z"),
    subtotal: 10500,
    shippingFee: 0,
    total: 10500,
    paymentMethod: "online",
    paymentStatus: "paid",
    shippingAddress: {
      fullName: "Ananya Sharma",
      phone: "+91 98765 43210",
      addressLine: "Station Road, Motihari",
      city: "Motihari",
      state: "Bihar",
      pincode: "845401",
    },
  };

  const intraInvoice = buildGstInvoice({
    order: intraOrder,
    items: [
      {
        title: "Royal Red Bridal Lehenga",
        quantity: 1,
        price: 10500,
        total: 10500,
        categorySlug: "lehengas",
      },
    ],
  });

  if (!intraInvoice.invoice.isIntraState) {
    throw new Error("Failed: Intra-state delivery incorrectly marked as inter-state");
  }
  if (intraInvoice.summary.taxableAmount !== 10000) {
    throw new Error(`Failed: Expected taxable amount 10000, got ${intraInvoice.summary.taxableAmount}`);
  }
  if (intraInvoice.summary.totalCgst !== 250 || intraInvoice.summary.totalSgst !== 250) {
    throw new Error(
      `Failed: Intra-state tax split mismatch: CGST=${intraInvoice.summary.totalCgst}, SGST=${intraInvoice.summary.totalSgst}`,
    );
  }
  if (intraInvoice.summary.totalIgst !== 0) {
    throw new Error(`Failed: Intra-state should have 0 IGST, got ${intraInvoice.summary.totalIgst}`);
  }
  if (intraInvoice.summary.totalTax !== 500) {
    throw new Error(`Failed: Total tax expected 500, got ${intraInvoice.summary.totalTax}`);
  }

  // -------------------------------------------------------------
  // 4. Inter-State Tax Split (Non-Bihar destination: IGST 5.0%)
  // -------------------------------------------------------------
  const interOrder = {
    ...intraOrder,
    shippingAddress: {
      fullName: "Priya Nair",
      phone: "+91 98111 22233",
      addressLine: "Indiranagar, 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
    },
  };

  const interInvoice = buildGstInvoice({
    order: interOrder,
    items: [
      {
        title: "Banarasi Katan Silk Saree",
        quantity: 1,
        price: 10500,
        total: 10500,
        categorySlug: "sarees",
      },
    ],
  });

  if (interInvoice.invoice.isIntraState) {
    throw new Error("Failed: Inter-state delivery incorrectly marked as intra-state");
  }
  if (interInvoice.summary.totalCgst !== 0 || interInvoice.summary.totalSgst !== 0) {
    throw new Error(
      `Failed: Inter-state should have 0 CGST and SGST, got CGST=${interInvoice.summary.totalCgst}, SGST=${interInvoice.summary.totalSgst}`,
    );
  }
  if (interInvoice.summary.totalIgst !== 500) {
    throw new Error(`Failed: Inter-state IGST expected 500, got ${interInvoice.summary.totalIgst}`);
  }
  if (interInvoice.invoice.placeOfSupplyStateCode !== "29") {
    throw new Error(`Failed: Expected Karnataka state code 29, got ${interInvoice.invoice.placeOfSupplyStateCode}`);
  }

  // -------------------------------------------------------------
  // 5. Shipping Fee GST Inclusion & HSN Summary Reconciliation
  // -------------------------------------------------------------
  const multiItemOrder = {
    ...intraOrder,
    subtotal: 5250,
    shippingFee: 105,
    total: 5355,
  };

  const multiInvoice = buildGstInvoice({
    order: multiItemOrder,
    items: [
      {
        title: "Banarasi Silk Saree",
        quantity: 1,
        price: 3150,
        total: 3150,
        categorySlug: "sarees",
      },
      {
        title: "Embroidered Silk Kurta",
        quantity: 1,
        price: 2100,
        total: 2100,
        categorySlug: "mens-wear",
      },
    ],
  });

  if (multiInvoice.items.length !== 3) {
    throw new Error(`Failed: Expected 3 items (2 goods + 1 shipping), got ${multiInvoice.items.length}`);
  }
  const shippingLine = multiInvoice.items.find((i) => i.hsnCode === HSN_MAPPINGS.SHIPPING);
  if (!shippingLine || shippingLine.grossAmount !== 105) {
    throw new Error("Failed: Shipping charge line item with HSN 9968 not properly created");
  }

  // Verify HSN Summary reconciliation
  const hsnTotalTaxable = multiInvoice.hsnSummary.reduce((acc, h) => acc + h.taxableValue, 0);
  const hsnTotalTax = multiInvoice.hsnSummary.reduce((acc, h) => acc + h.totalTax, 0);
  if (Math.abs(hsnTotalTaxable - multiInvoice.summary.taxableAmount) > 0.05) {
    throw new Error(`Failed: HSN summary taxable total does not match summary taxable amount`);
  }
  if (Math.abs(hsnTotalTax - multiInvoice.summary.totalTax) > 0.05) {
    throw new Error(`Failed: HSN summary tax total does not match summary tax amount`);
  }

  // -------------------------------------------------------------
  // 6. Number to Words (Indian Numbering System)
  // -------------------------------------------------------------
  const wordsZero = numberToWordsINR(0);
  if (wordsZero !== "Zero Rupees Only") {
    throw new Error(`Failed: 0 in words expected 'Zero Rupees Only', got '${wordsZero}'`);
  }

  const words1499 = numberToWordsINR(1499);
  if (!words1499.includes("One Thousand Four Hundred Ninety-Nine")) {
    throw new Error(`Failed: 1499 in words unexpected: '${words1499}'`);
  }

  const words10500 = numberToWordsINR(10500);
  if (!words10500.includes("Ten Thousand Five Hundred")) {
    throw new Error(`Failed: 10500 in words unexpected: '${words10500}'`);
  }

  const wordsLakh = numberToWordsINR(125000);
  if (!wordsLakh.includes("One Lakh Twenty-Five Thousand")) {
    throw new Error(`Failed: 125000 in words unexpected: '${wordsLakh}'`);
  }

  const wordsPaise = numberToWordsINR(2500.5);
  if (!wordsPaise.includes("Fifty Paise")) {
    throw new Error(`Failed: 2500.50 in words missing Fifty Paise: '${wordsPaise}'`);
  }

  // -------------------------------------------------------------
  // 7. Order Lifecycle Push Payload Dispatching
  // -------------------------------------------------------------
  // Delivery status prompt for photo review
  const deliveredPayload = buildStatusNotificationPayload({
    orderId: "ord-12345",
    orderNumber: "AV-9999",
    status: "delivered",
    productName: "Bridal Lehenga",
  });
  if (!deliveredPayload.title.includes("Delivered")) {
    throw new Error("Failed: Delivered payload title missing Delivered indicator");
  }
  if (!deliveredPayload.body.toLowerCase().includes("photo review")) {
    throw new Error("Failed: Delivered payload body does not prompt customer for photo review");
  }
  if (deliveredPayload.tag !== "order-delivered-ord-12345") {
    throw new Error(`Failed: Delivered payload tag mismatch: ${deliveredPayload.tag}`);
  }

  // Shipped status payload
  const shippedPayload = buildStatusNotificationPayload({
    orderId: "ord-12345",
    orderNumber: "AV-9999",
    status: "shipped",
    courier: "Delhivery",
    trackingNumber: "DEL12345",
  });
  if (!shippedPayload.title.includes("Dispatched")) {
    throw new Error("Failed: Shipped payload title missing Dispatched indicator");
  }
  if (!shippedPayload.body.includes("Delhivery") || !shippedPayload.body.includes("DEL12345")) {
    throw new Error("Failed: Shipped payload body missing courier details");
  }

  console.log("  ✔ Statutory GST tax engine (intra/inter tax splits, HSN resolution, Rule 46 words) & lifecycle dispatcher passed!");
}
