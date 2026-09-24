/**
 * 👑 AALM VASTRALAY — CENTRALIZED ORDER LIFECYCLE DISPATCHER
 * Coordinates all order status transitions, automated inventory restocking,
 * customer push & in-app notifications, and audit logging.
 */

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, products, type Order, type OrderStatus, ORDER_STATUSES } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { sendOrderStatusPushNotification } from "@/lib/push";
import { restock } from "@/actions/orders";

export interface TransitionOrderStatusInput {
  orderId: string;
  status: OrderStatus | string;
  courier?: string | null;
  trackingNumber?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: "seller" | "admin" | "system" | "customer";
}

export interface TransitionOrderStatusResult {
  success: boolean;
  order?: Order;
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
  error?: string;
  message?: string;
}

/**
 * Centrally coordinates an order status transition:
 * 1. Validates the transition and updates the orders table.
 * 2. Restocks inventory if cancelled or returned.
 * 3. Records in-app notification in notifications table.
 * 4. Dispatches web push notification via push engine (e.g. photo review prompt on delivery).
 * 5. Records enterprise audit trail.
 * 6. Invalidates Next.js cache paths.
 */
export async function transitionOrderStatus(
  input: TransitionOrderStatusInput,
): Promise<TransitionOrderStatusResult> {
  const statusStr = input.status;
  if (!(ORDER_STATUSES as readonly string[]).includes(statusStr)) {
    return {
      success: false,
      error: `Invalid order status: ${statusStr}. Allowed values: ${ORDER_STATUSES.join(", ")}`,
    };
  }
  const newStatus = statusStr as OrderStatus;

  // 1. Fetch current order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, input.orderId))
    .limit(1);

  if (!order) {
    return { success: false, error: `Order not found with ID ${input.orderId}` };
  }

  const previousStatus = order.status as OrderStatus;
  const courier = input.courier?.trim() || order.courier;
  const trackingNumber = input.trackingNumber?.trim() || order.trackingNumber;

  // 2. Compute paymentStatus
  let paymentStatus = order.paymentStatus;
  if (newStatus === "delivered") {
    paymentStatus = "paid";
  } else if (
    (newStatus === "cancelled" || newStatus === "returned") &&
    (order.paymentStatus === "paid" || order.paymentMethod === "online" || order.paymentMethod === "upi")
  ) {
    paymentStatus = "refunded";
  }

  // 3. Persist order update
  const [updatedOrder] = await db
    .update(orders)
    .set({
      status: newStatus,
      courier,
      trackingNumber,
      paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, input.orderId))
    .returning();

  // 4. Handle Restocking on cancellation / return
  if (
    (newStatus === "cancelled" || newStatus === "returned") &&
    previousStatus !== "cancelled" &&
    previousStatus !== "returned"
  ) {
    try {
      await restock(input.orderId);
    } catch (err) {
      console.error(`[Order Lifecycle] Restock failed for order ${input.orderId}:`, err);
    }
  }

  // 5. Customer Notification (In-App + Web Push)
  if (order.customerId) {
    let productName: string | undefined;
    try {
      const [firstItem] = await db
        .select({ title: products.title })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.orderId))
        .limit(1);
      productName = firstItem?.title ?? undefined;
    } catch {
      // Non-blocking item lookup
    }

    try {
      await sendOrderStatusPushNotification({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        userId: order.customerId,
        status: newStatus,
        courier,
        trackingNumber,
        productName,
      });
    } catch (err) {
      console.error(`[Order Lifecycle] Notification dispatch failed for order ${input.orderId}:`, err);
    }
  }

  // 6. Enterprise Audit Logging
  if (input.actorId) {
    try {
      const logDetails = `${previousStatus} → ${newStatus}${
        courier || trackingNumber ? ` · ${courier ?? ""} ${trackingNumber ?? ""}`.trim() : ""
      }`;
      await recordAudit({
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: "order.status",
        target: order.orderNumber,
        detail: logDetails,
      });
    } catch (err) {
      console.error(`[Order Lifecycle] Audit logging failed for order ${input.orderId}:`, err);
    }
  }

  // 7. Cache Revalidation
  try {
    revalidatePath("/seller/orders");
    revalidatePath("/orders");
    revalidatePath(`/orders/${input.orderId}`);
    revalidatePath(`/orders/${input.orderId}/invoice`);
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  } catch {
    // Revalidation ignored if invoked outside of Next.js server action context (e.g. testing)
  }

  return {
    success: true,
    order: updatedOrder,
    previousStatus,
    newStatus,
    message: `Order #${order.orderNumber} successfully updated to ${newStatus}`,
  };
}
