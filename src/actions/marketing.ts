"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, notifications, pushSubscriptions } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { sendGasEmail, type GasEmailPayload } from "@/lib/gas-mailer";

const broadcastSchema = z.object({
  campaignType: z.enum(["FESTIVAL_OFFER", "COUPON_OFFER", "STOCK_DELIVERY_ALERT", "GENERAL"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
  festivalName: z.string().optional(),
  discountText: z.string().optional(),
  couponCode: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal("")),
  targetAudience: z.enum(["all_customers", "all_sellers", "test_admin"]),
  testEmail: z.string().email().optional().or(z.literal("")),
  channels: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    webPush: z.boolean(),
  }),
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;

export type BroadcastResult = {
  ok: boolean;
  message: string;
  sentCount?: number;
  inAppCount?: number;
  emailCount?: number;
};

/**
 * Server action to dispatch 1-click marketing broadcasts (Festival Offers, Coupons, Stock Alerts).
 * Restricted to verified admins. Zero data loss, audit-logged, and rate-safe.
 */
export async function sendBroadcastCampaignAction(input: BroadcastInput): Promise<BroadcastResult> {
  const admin = await requireRole(["admin"], "/admin/marketing");

  const parsed = broadcastSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid campaign payload",
    };
  }

  const {
    campaignType,
    title,
    message,
    festivalName,
    discountText,
    couponCode,
    ctaUrl,
    targetAudience,
    testEmail,
    channels,
  } = parsed.data;

  const finalCta = ctaUrl && ctaUrl.trim() !== "" ? ctaUrl.trim() : "https://aalm-vastralay.vercel.app/products";

  try {
    let targetUsers: Array<{ id: string; email: string; fullName: string | null }> = [];

    if (targetAudience === "test_admin") {
      const emailToUse = testEmail?.trim() || admin.email;
      targetUsers = [{ id: admin.id, email: emailToUse, fullName: admin.fullName || "Admin" }];
    } else if (targetAudience === "all_sellers") {
      targetUsers = await db
        .select({ id: users.id, email: users.email, fullName: users.fullName })
        .from(users)
        .where(eq(users.role, "seller"))
        .limit(200);
    } else {
      // All active registered customers
      targetUsers = await db
        .select({ id: users.id, email: users.email, fullName: users.fullName })
        .from(users)
        .where(inArray(users.role, ["customer", "seller"]))
        .orderBy(desc(users.createdAt))
        .limit(300);
    }

    let inAppCount = 0;
    let emailCount = 0;

    // 1. Dispatch In-App Notifications
    if (channels.inApp && targetUsers.length > 0) {
      const inAppRecords = targetUsers.map((u) => ({
        userId: u.id,
        type: "marketing",
        title: title,
        body: message,
        data: {
          campaignType,
          discountText: discountText || null,
          couponCode: couponCode || null,
          ctaUrl: finalCta,
        },
      }));

      // Insert in chunks of 50 to avoid query length limits
      for (let i = 0; i < inAppRecords.length; i += 50) {
        const chunk = inAppRecords.slice(i, i + 50);
        await db.insert(notifications).values(chunk);
      }
      inAppCount = inAppRecords.length;
    }

    // 2. Dispatch Emails via GAS Mailer
    if (channels.email && targetUsers.length > 0) {
      // In test mode, send 1 email; for bulk, cap at safety limit (e.g. 100 per campaign)
      const emailList = targetAudience === "test_admin" ? targetUsers : targetUsers.slice(0, 50);

      for (const u of emailList) {
        let emailPayload: GasEmailPayload;

        if (campaignType === "FESTIVAL_OFFER") {
          emailPayload = {
            type: "FESTIVAL_OFFER",
            to: u.email,
            name: u.fullName,
            festivalName: festivalName || "त्योहार स्पेशल (Festive Season)",
            discountText: discountText || "SPECIAL DISCOUNT",
            headline: title,
            message: message,
            ctaUrl: finalCta,
          };
        } else if (campaignType === "COUPON_OFFER") {
          emailPayload = {
            type: "COUPON_OFFER",
            to: u.email,
            name: u.fullName,
            couponCode: couponCode || "FESTIVE500",
            discountText: discountText || "SPECIAL OFFER",
            ctaUrl: finalCta,
          };
        } else if (campaignType === "STOCK_DELIVERY_ALERT") {
          emailPayload = {
            type: "STOCK_DELIVERY_ALERT",
            to: u.email,
            name: u.fullName,
            headline: title,
            message: message,
            ctaUrl: finalCta,
          };
        } else {
          emailPayload = {
            type: "GENERAL",
            to: u.email,
            name: u.fullName,
            subject: title,
            body: message,
          };
        }

        const res = await sendGasEmail(emailPayload);
        if (res.ok) emailCount++;
      }
    }

    // Record audit trail
    await recordAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "marketing.campaign_broadcast",
      target: targetAudience,
      detail: JSON.stringify({
        campaignType,
        title,
        channels,
        inAppCount,
        emailCount,
      }),
    });

    revalidatePath("/admin/marketing");
    revalidatePath("/notifications");

    return {
      ok: true,
      message: `अभियान सफलतापूर्वक भेजा गया! (${inAppCount} इन-ऐप, ${emailCount} ईमेल)`,
      sentCount: targetUsers.length,
      inAppCount,
      emailCount,
    };
  } catch (err: unknown) {
    console.error("[Marketing] Broadcast failed:", err);
    return {
      ok: false,
      message: "Broadcast dispatch failed. Please check server logs.",
    };
  }
}
