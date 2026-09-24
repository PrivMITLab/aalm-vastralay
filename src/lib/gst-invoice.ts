/**
 * 👑 AALM VASTRALAY — STATUTORY GST TAX INVOICE ENGINE
 * Compliant with Rule 46 of the Central Goods and Services Tax (CGST) Rules, 2017.
 *
 * Supplier Origin:
 * - Aalm Vastralay (Proprietor: Suheb Alam)
 * - Kalyanipur, East Champaran, Bihar - 845413 (State Code: 10)
 *
 * Place of Supply Logic:
 * - Intra-State (Bihar delivery): Splits 5% apparel GST into CGST 2.5% + SGST 2.5%
 * - Inter-State (Non-Bihar delivery): Applies IGST 5.0%
 *
 * Statutory HSN Code Mapping:
 * - Sarees: HSN 5007 (Woven fabrics of silk or silk waste / sarees)
 * - Lehengas: HSN 6204 (Women's or girls' suits, ensembles, dresses, skirts)
 * - Sherwanis / Kurtas: HSN 6203 (Men's or boys' suits, ensembles, jackets, trousers)
 * - Dupattas / Shawls: HSN 6214 (Shawls, scarves, mufflers, mantillas, veils, dupattas)
 * - Accessories / Jewellery: HSN 7117 (Imitation jewellery and accessories)
 * - General Apparel Fallback: HSN 6204
 */

import { round2 } from "./utils";

export const SUPPLIER_ORIGIN = {
  legalName: "Aalm Vastralay",
  tradeName: "Aalm Vastralay (Proprietor: Suheb Alam)",
  proprietor: "Suheb Alam",
  addressLine: "Main Road, Kalyanipur",
  city: "Kalyanipur",
  district: "East Champaran",
  state: "Bihar",
  stateCode: "10",
  pincode: "845413",
  phone: "+91 84340 61342",
  email: "support@aalmvastralay.com",
  defaultGstin: "10AABFA8434Q1Z5",
  pan: "AABFA8434Q",
} as const;

/**
 * Official 2-digit GST state codes according to Indian GST Council & CBIC.
 */
export const GST_STATE_CODES: Record<string, string> = {
  "jammu and kashmir": "01",
  "jammu & kashmir": "01",
  jk: "01",
  "himachal pradesh": "02",
  hp: "02",
  punjab: "03",
  pb: "03",
  chandigarh: "04",
  ch: "04",
  uttarakhand: "05",
  uk: "05",
  haryana: "06",
  hr: "06",
  delhi: "07",
  dl: "07",
  rajasthan: "08",
  rj: "08",
  "uttar pradesh": "09",
  up: "09",
  bihar: "10",
  br: "10",
  sikkim: "11",
  sk: "11",
  "arunachal pradesh": "12",
  ar: "12",
  nagaland: "13",
  nl: "13",
  manipur: "14",
  mn: "14",
  mizoram: "15",
  mz: "15",
  tripura: "16",
  tr: "16",
  meghalaya: "17",
  ml: "17",
  assam: "18",
  as: "18",
  "west bengal": "19",
  wb: "19",
  jharkhand: "20",
  jh: "20",
  odisha: "21",
  orissa: "21",
  od: "21",
  chhattisgarh: "22",
  cg: "22",
  "madhya pradesh": "23",
  mp: "23",
  gujarat: "24",
  gj: "24",
  "dadra and nagar haveli and daman and diu": "26",
  "dadra & nagar haveli": "26",
  "daman & diu": "26",
  maharashtra: "27",
  mh: "27",
  "andhra pradesh": "37",
  ap: "37",
  karnataka: "29",
  ka: "29",
  goa: "30",
  ga: "30",
  lakshadweep: "31",
  ld: "31",
  kerala: "32",
  kl: "32",
  "tamil nadu": "33",
  tn: "33",
  puducherry: "34",
  pondicherry: "34",
  py: "34",
  "andaman and nicobar islands": "35",
  "andaman & nicobar": "35",
  an: "35",
  telangana: "36",
  ts: "36",
  tg: "36",
  ladakh: "38",
  la: "38",
  "other territory": "97",
};

/**
 * Resolves Indian 2-digit GST state code from state name or code.
 */
export function getStateCode(state: string | null | undefined): string {
  if (!state) return SUPPLIER_ORIGIN.stateCode;
  const cleaned = state.trim().toLowerCase();
  if (/^\d{2}$/.test(cleaned)) return cleaned;
  return GST_STATE_CODES[cleaned] ?? "10";
}

/**
 * Returns true if delivery destination is within Bihar (State Code 10).
 */
export function isBiharIntraState(state: string | null | undefined): boolean {
  return getStateCode(state) === SUPPLIER_ORIGIN.stateCode;
}

/**
 * Standard HSN code mappings for ethnic wear & accessories.
 */
export const HSN_MAPPINGS = {
  SAREES: "5007",
  LEHENGAS: "6204",
  SHERWANIS_KURTAS: "6203",
  DUPATTAS: "6214",
  ACCESSORIES_JEWELLERY: "7117",
  SHIPPING: "9968",
  DEFAULT_APPAREL: "6204",
} as const;

/**
 * Resolves statutory HSN code based on category name, category slug, product title, or tags.
 * Prioritizes primary garment classification (e.g. Lehenga ensembles that include dupattas stay HSN 6204).
 */
export function resolveHsnCode(
  categoryNameOrSlug?: string | null,
  productTitle?: string | null,
  tags?: string[] | null,
): string {
  const cat = (categoryNameOrSlug ?? "").toLowerCase();
  const text = `${cat} ${productTitle ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase();

  // 1. Primary Category Hints
  if (cat.includes("saree") || cat.includes("sari")) {
    return HSN_MAPPINGS.SAREES;
  }
  if (cat.includes("lehenga") || cat.includes("ghagra") || cat.includes("choli")) {
    return HSN_MAPPINGS.LEHENGAS;
  }
  if (cat.includes("sherwani") || cat.includes("kurta") || cat.includes("groom")) {
    return HSN_MAPPINGS.SHERWANIS_KURTAS;
  }
  if (
    cat.includes("dupatta") ||
    cat.includes("shawl") ||
    cat.includes("stole") ||
    cat.includes("scarf") ||
    (productTitle && /dupatta|shawl|stole|scarf|chunri|odhni/i.test(productTitle))
  ) {
    return HSN_MAPPINGS.DUPATTAS;
  }
  if (cat.includes("jewel") || cat.includes("accessory") || cat.includes("accessories")) {
    return HSN_MAPPINGS.ACCESSORIES_JEWELLERY;
  }

  // 2. Primary Garment Checks in Text (Lehengas and Sarees prioritized before standalone dupattas)
  // Ethnic bridal lehengas frequently include "dupatta" in description, but are legally HSN 6204 ensembles.
  if (
    text.includes("lehenga") ||
    text.includes("ghagra") ||
    text.includes("choli")
  ) {
    return HSN_MAPPINGS.LEHENGAS;
  }

  // Sarees & Woven Silk (HSN 5007)
  if (
    text.includes("saree") ||
    text.includes("sari") ||
    text.includes("banarasi") ||
    text.includes("kanjivaram") ||
    text.includes("chanderi") ||
    text.includes("paithani") ||
    text.includes("patola")
  ) {
    return HSN_MAPPINGS.SAREES;
  }

  // Sherwanis / Kurtas (HSN 6203 - Men's suits, ensembles, kurtas)
  if (
    text.includes("sherwani") ||
    text.includes("kurta") ||
    text.includes("bandhgala") ||
    text.includes("indo-western") ||
    text.includes("groom")
  ) {
    return HSN_MAPPINGS.SHERWANIS_KURTAS;
  }

  // Standalone Dupattas / Shawls / Stoles (HSN 6214)
  if (
    text.includes("dupatta") ||
    text.includes("shawl") ||
    text.includes("scarf") ||
    text.includes("stole") ||
    text.includes("chunri") ||
    text.includes("odhni")
  ) {
    return HSN_MAPPINGS.DUPATTAS;
  }

  // Accessories / Imitation Jewellery (HSN 7117)
  if (
    text.includes("jewel") ||
    text.includes("necklace") ||
    text.includes("earring") ||
    text.includes("jhumka") ||
    text.includes("bangle") ||
    text.includes("kundan") ||
    text.includes("accessory") ||
    text.includes("accessories") ||
    text.includes("potli") ||
    text.includes("clutch") ||
    text.includes("pagri") ||
    text.includes("safa") ||
    text.includes("brooch") ||
    text.includes("tikka")
  ) {
    return HSN_MAPPINGS.ACCESSORIES_JEWELLERY;
  }

  // Men's category apparel fallback
  if (text.includes("men")) {
    return HSN_MAPPINGS.SHERWANIS_KURTAS;
  }

  // Default Apparel Fallback (HSN 6204)
  return HSN_MAPPINGS.DEFAULT_APPAREL;
}

/**
 * Converts numeric INR amount into words under the Indian numbering system.
 * Compliant with Rule 46 requirement for Total Invoice Value in words.
 */
export function numberToWordsINR(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "Zero Rupees Only";
  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return `${tens[Math.floor(n / 10)]}${unit ? `-${ones[unit]}` : ""}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred && rest) return `${ones[hundred]} Hundred ${convertTwoDigits(rest)}`;
    if (hundred) return `${ones[hundred]} Hundred`;
    return convertTwoDigits(rest);
  }

  function convertIndianNumber(n: number): string {
    const crore = Math.floor(n / 10000000);
    const remainderCrore = n % 10000000;
    const lakh = Math.floor(remainderCrore / 100000);
    const remainderLakh = remainderCrore % 100000;
    const thousand = Math.floor(remainderLakh / 1000);
    const remainderThousand = remainderLakh % 1000;

    const parts: string[] = [];
    if (crore) parts.push(`${crore > 99 ? convertIndianNumber(crore) : convertTwoDigits(crore)} Crore`);
    if (lakh) parts.push(`${convertTwoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${convertTwoDigits(thousand)} Thousand`);
    if (remainderThousand) parts.push(convertThreeDigits(remainderThousand));
    return parts.join(" ");
  }

  const paiseString = decimalPart > 0 ? `${convertTwoDigits(decimalPart)} Paise` : "";

  if (integerPart === 0 && decimalPart > 0) {
    return `${paiseString} Only`;
  }

  const rupeesString = convertIndianNumber(integerPart) || "Zero";
  return `Rupees ${rupeesString}${paiseString ? ` and ${paiseString}` : ""} Only`;
}

export interface GstLineItemInput {
  title: string;
  quantity: number;
  price: number;
  total: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  tags?: string[] | null;
  variantSize?: string | null;
  variantColor?: string | null;
}

export interface GstTaxBreakdownLine {
  itemIndex: number;
  description: string;
  variantInfo?: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discount?: number;
  netAmount: number;
  taxableValue: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export interface HsnSummaryRow {
  hsnCode: string;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

export interface GstInvoiceData {
  supplier: {
    legalName: string;
    tradeName: string;
    proprietor: string;
    addressLine: string;
    city: string;
    district: string;
    state: string;
    stateCode: string;
    pincode: string;
    phone: string;
    email: string;
    gstin: string;
  };
  recipient: {
    fullName: string;
    addressLine: string;
    landmark?: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    phone: string;
  };
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    orderNumber: string;
    orderDate: string;
    placeOfSupply: string;
    placeOfSupplyStateCode: string;
    isIntraState: boolean;
    reverseCharge: "No";
    paymentMethod: string;
    paymentStatus: string;
  };
  items: GstTaxBreakdownLine[];
  hsnSummary: HsnSummaryRow[];
  summary: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    taxableAmount: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
    grandTotal: number;
    amountInWords: string;
  };
}

export interface BuildGstInvoiceParams {
  order: {
    id: string;
    orderNumber: string;
    createdAt: Date | string;
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod?: string | null;
    paymentStatus?: string | null;
    shippingAddress?: {
      fullName?: string | null;
      phone?: string | null;
      addressLine?: string | null;
      landmark?: string | null;
      city?: string | null;
      state?: string | null;
      pincode?: string | null;
    } | null;
  };
  items: GstLineItemInput[];
  storeGstin?: string | null;
  customGstin?: string | null;
  gstPercentRate?: number;
}

/**
 * Computes statutory Rule 46 GST invoice calculations for an order.
 * Follows Section 15(3) of the CGST Act, 2017: Taxable value is computed on transaction
 * value net of trade/promotional discounts recorded on the invoice.
 */
export function buildGstInvoice(params: BuildGstInvoiceParams): GstInvoiceData {
  const { order, items, storeGstin, customGstin, gstPercentRate = 5 } = params;
  const shippingState = order.shippingAddress?.state || SUPPLIER_ORIGIN.state;
  const isIntra = isBiharIntraState(shippingState);
  const stateCode = getStateCode(shippingState);

  const supplierGstin = (storeGstin || customGstin || SUPPLIER_ORIGIN.defaultGstin).toUpperCase().trim();

  const computedGross = round2(order.subtotal + order.shippingFee);
  const totalDiscount = computedGross > order.total ? round2(computedGross - order.total) : 0;
  const itemsGrossSum = round2(items.reduce((s, it) => s + it.total, 0)) || order.subtotal;

  // Proportionally allocate discount across items so every line item's net taxable value
  // and tax accurately reflect Rule 46(j) and Section 15(3) of CGST Act.
  let remainingDiscount = totalDiscount;
  const itemDiscounts = items.map((it, idx) => {
    if (idx === items.length - 1) {
      return round2(remainingDiscount);
    }
    const share = itemsGrossSum > 0 ? round2(totalDiscount * (it.total / itemsGrossSum)) : 0;
    remainingDiscount = round2(remainingDiscount - share);
    return share;
  });

  const lines: GstTaxBreakdownLine[] = [];
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  items.forEach((it, index) => {
    const hsn = resolveHsnCode(it.categoryName || it.categorySlug, it.title, it.tags);
    const itemDiscount = itemDiscounts[index] || 0;
    const gross = round2(it.total);
    const netGross = round2(Math.max(0, gross - itemDiscount));

    // Prices are GST inclusive: Taxable = NetGross / (1 + Rate / 100)
    const taxable = round2((netGross * 100) / (100 + gstPercentRate));
    const taxTotal = round2(netGross - taxable);

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isIntra) {
      cgstRate = gstPercentRate / 2;
      sgstRate = gstPercentRate / 2;
      cgstAmount = round2(taxTotal / 2);
      sgstAmount = round2(taxTotal - cgstAmount); // Exact reconciliation to avoid rounding leak
    } else {
      igstRate = gstPercentRate;
      igstAmount = taxTotal;
    }

    totalTaxable = round2(totalTaxable + taxable);
    totalCgst = round2(totalCgst + cgstAmount);
    totalSgst = round2(totalSgst + sgstAmount);
    totalIgst = round2(totalIgst + igstAmount);

    const variantParts = [it.variantSize ? `Size: ${it.variantSize}` : null, it.variantColor ? `Color: ${it.variantColor}` : null]
      .filter(Boolean)
      .join(" · ");

    lines.push({
      itemIndex: index + 1,
      description: it.title,
      variantInfo: variantParts || undefined,
      hsnCode: hsn,
      quantity: it.quantity,
      unitPrice: it.price,
      grossAmount: gross,
      discount: itemDiscount > 0 ? itemDiscount : undefined,
      netAmount: netGross,
      taxableValue: taxable,
      gstRate: gstPercentRate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalTax: taxTotal,
    });
  });

  // Include shipping fee if applicable (HSN 9968 - Courier and postal services)
  if (order.shippingFee > 0) {
    const shipGross = round2(order.shippingFee);
    const shipTaxable = round2((shipGross * 100) / (100 + gstPercentRate));
    const shipTax = round2(shipGross - shipTaxable);

    let shipCgst = 0;
    let shipSgst = 0;
    let shipIgst = 0;

    if (isIntra) {
      shipCgst = round2(shipTax / 2);
      shipSgst = round2(shipTax - shipCgst);
    } else {
      shipIgst = shipTax;
    }

    totalTaxable = round2(totalTaxable + shipTaxable);
    totalCgst = round2(totalCgst + shipCgst);
    totalSgst = round2(totalSgst + shipSgst);
    totalIgst = round2(totalIgst + shipIgst);

    lines.push({
      itemIndex: lines.length + 1,
      description: "Shipping & Handling Charges",
      hsnCode: HSN_MAPPINGS.SHIPPING,
      quantity: 1,
      unitPrice: shipGross,
      grossAmount: shipGross,
      netAmount: shipGross,
      taxableValue: shipTaxable,
      gstRate: gstPercentRate,
      cgstRate: isIntra ? gstPercentRate / 2 : 0,
      cgstAmount: shipCgst,
      sgstRate: isIntra ? gstPercentRate / 2 : 0,
      sgstAmount: shipSgst,
      igstRate: isIntra ? 0 : gstPercentRate,
      igstAmount: shipIgst,
      totalTax: shipTax,
    });
  }

  // Group by HSN for statutory HSN tax summary table
  const hsnMap = new Map<string, HsnSummaryRow>();
  for (const line of lines) {
    const existing = hsnMap.get(line.hsnCode) || {
      hsnCode: line.hsnCode,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    };
    existing.taxableValue = round2(existing.taxableValue + line.taxableValue);
    existing.cgstAmount = round2(existing.cgstAmount + line.cgstAmount);
    existing.sgstAmount = round2(existing.sgstAmount + line.sgstAmount);
    existing.igstAmount = round2(existing.igstAmount + line.igstAmount);
    existing.totalTax = round2(existing.totalTax + line.totalTax);
    hsnMap.set(line.hsnCode, existing);
  }
  const hsnSummary = Array.from(hsnMap.values());

  const grandTotal = round2(order.total);
  const totalTax = round2(totalCgst + totalSgst + totalIgst);

  const orderDateObj = typeof order.createdAt === "string" ? new Date(order.createdAt) : order.createdAt;
  const formattedOrderDate = orderDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const recipientAddr = order.shippingAddress;

  return {
    supplier: {
      ...SUPPLIER_ORIGIN,
      gstin: supplierGstin,
    },
    recipient: {
      fullName: recipientAddr?.fullName || "Valued Customer",
      addressLine: recipientAddr?.addressLine || "Kalyanipur",
      landmark: recipientAddr?.landmark || undefined,
      city: recipientAddr?.city || "East Champaran",
      state: recipientAddr?.state || SUPPLIER_ORIGIN.state,
      stateCode,
      pincode: recipientAddr?.pincode || SUPPLIER_ORIGIN.pincode,
      phone: recipientAddr?.phone || SUPPLIER_ORIGIN.phone,
    },
    invoice: {
      invoiceNumber: `AV-INV-${order.orderNumber}`,
      invoiceDate: formattedOrderDate,
      orderNumber: order.orderNumber,
      orderDate: formattedOrderDate,
      placeOfSupply: `${shippingState} (${stateCode})`,
      placeOfSupplyStateCode: stateCode,
      isIntraState: isIntra,
      reverseCharge: "No",
      paymentMethod: (order.paymentMethod || "online").toUpperCase(),
      paymentStatus: (order.paymentStatus || "pending").toUpperCase(),
    },
    items: lines,
    hsnSummary,
    summary: {
      subtotal: round2(order.subtotal),
      shippingFee: round2(order.shippingFee),
      discount: totalDiscount,
      taxableAmount: totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      grandTotal,
      amountInWords: numberToWordsINR(grandTotal),
    },
  };
}
