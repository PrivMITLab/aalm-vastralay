/**
 * 👑 AALM VASTRALAY — UNIFIED COURIER & AWB ENGINE
 * Connects Shiprocket & Delhivery, generates compliant AWBs, updates order state,
 * and triggers automated dispatch push notifications.
 */

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { createShiprocketAwb } from "./shiprocket";
import { createDelhiveryAwb } from "./delhivery";
import { sendOrderDispatchNotification } from "@/lib/push";
import type { AwbGenerationResult, CourierProvider } from "@/types/courier";

export async function generateAwbForOrder(
  orderId: string,
  provider: CourierProvider = "auto"
): Promise<AwbGenerationResult> {
  // 1. Fetch order details
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // 2. Fetch order items for shipment manifest
  const items = await db
    .select({
      quantity: orderItems.quantity,
      price: orderItems.price,
      title: products.title,
      sku: products.sku,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const shippingAddr = order.shippingAddress;
  const pincode = shippingAddr.pincode || "110001";
  const orderNumber = order.orderNumber || `AV-${order.id.slice(0, 8).toUpperCase()}`;
  const productSummary = items.map((i) => i.title).join(", ") || "Ethnic Wear";

  // 3. Provider selection logic:
  // If 'auto', select Delhivery for Bihar (8x), UP (2x), and Delhi NCR (1x), otherwise Shiprocket
  let selectedProvider = provider;
  if (selectedProvider === "auto") {
    if (pincode.startsWith("8") || pincode.startsWith("2") || pincode.startsWith("11")) {
      selectedProvider = "delhivery";
    } else {
      selectedProvider = "shiprocket";
    }
  }

  // 4. Generate AWB with selected courier
  let awbResult: AwbGenerationResult;

  if (selectedProvider === "delhivery") {
    awbResult = await createDelhiveryAwb({
      orderId: order.id,
      orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod as "cod" | "online" | "upi",
      shippingAddress: {
        fullName: shippingAddr.fullName,
        phone: shippingAddr.phone,
        addressLine: shippingAddr.addressLine,
        city: shippingAddr.city,
        state: shippingAddr.state,
        pincode,
      },
      productSummary,
    });
  } else {
    awbResult = await createShiprocketAwb({
      orderId: order.id,
      orderNumber,
      orderDate: order.createdAt.toISOString().slice(0, 10),
      total: order.total,
      paymentMethod: order.paymentMethod as "cod" | "online" | "upi",
      shippingAddress: {
        fullName: shippingAddr.fullName,
        phone: shippingAddr.phone,
        addressLine: shippingAddr.addressLine,
        city: shippingAddr.city,
        state: shippingAddr.state,
        pincode,
      },
      items: items.map((i) => ({
        name: i.title,
        sku: i.sku,
        units: i.quantity,
        sellingPrice: i.price,
      })),
    });
  }

  // 5. Update Order in Database with AWB and Shipped Status
  const updatedNotes = order.notes
    ? `${order.notes}\n[AWB] ${awbResult.courier}: ${awbResult.awbCode}`
    : `[AWB] ${awbResult.courier}: ${awbResult.awbCode}`;

  await db
    .update(orders)
    .set({
      status: "shipped",
      courier: awbResult.courier,
      trackingNumber: awbResult.awbCode,
      notes: updatedNotes,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  // 6. Trigger Push Notification & In-App Alert for Customer
  await sendOrderDispatchNotification({
    orderId: order.id,
    orderNumber,
    userId: order.customerId,
    courier: awbResult.courier,
    trackingNumber: awbResult.awbCode,
    productName: items[0]?.title || "Ethnic Wear",
  });

  return awbResult;
}
