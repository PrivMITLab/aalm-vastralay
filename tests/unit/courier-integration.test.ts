/**
 * 👑 AALM VASTRALAY — SHIPROCKET & DELHIVERY COURIER TEST SUITE
 * Validates automated AWB generation, provider selection & shipping label formatting.
 */

import { createShiprocketAwb } from "../../src/lib/courier/shiprocket";
import { createDelhiveryAwb } from "../../src/lib/courier/delhivery";

export async function testCourierIntegration() {
  console.log("  ▶ Running Shiprocket & Delhivery Courier API Tests...");

  // 1. Shiprocket AWB Generation
  const shiprocketOrder = {
    orderId: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    orderNumber: "AV-SR-1001",
    orderDate: "2026-09-24",
    total: 4599,
    paymentMethod: "online" as const,
    shippingAddress: {
      fullName: "Priya Sharma",
      phone: "9876543210",
      addressLine: "Flat 402, Lotus Court",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    items: [
      {
        name: "Banarasi Silk Saree",
        sku: "AV-BAN-001",
        units: 1,
        sellingPrice: 4599,
      },
    ],
  };

  const srResult = await createShiprocketAwb(shiprocketOrder);
  if (!srResult.success || srResult.courier !== "Shiprocket") {
    throw new Error("Shiprocket AWB generation failed");
  }
  if (!srResult.awbCode.startsWith("SR") || srResult.awbCode.length < 10) {
    throw new Error("Shiprocket AWB code invalid format");
  }
  if (!srResult.labelUrl.includes("Shiprocket")) {
    throw new Error("Shiprocket label URL missing provider identifier");
  }

  // 2. Delhivery Express AWB Generation
  const delhiveryOrder = {
    orderId: "d2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    orderNumber: "AV-DL-2002",
    total: 8999,
    paymentMethod: "cod" as const,
    shippingAddress: {
      fullName: "Ananya Verma",
      phone: "9123456780",
      addressLine: "House 12, Bailey Road",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
    },
    productSummary: "Royal Bridal Lehenga",
  };

  const dlResult = await createDelhiveryAwb(delhiveryOrder);
  if (!dlResult.success || dlResult.courier !== "Delhivery") {
    throw new Error("Delhivery AWB generation failed");
  }
  if (!dlResult.awbCode.startsWith("DLHV") || dlResult.awbCode.length < 12) {
    throw new Error("Delhivery Waybill code invalid format");
  }
  if (!dlResult.routingCode || !dlResult.routingCode.includes("DEL/EXPR-800")) {
    throw new Error("Delhivery hub routing code mismatch for Patna (800)");
  }

  console.log("  ✔ Shiprocket & Delhivery AWB generation, barcodes & hub routing passed!");
}
