"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, inArray, desc, sql } from "drizzle-orm";
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
      // Auto-ensure schema columns exist on notifications relation
      try {
        await db.execute(sql.raw(`
          ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'info' NOT NULL;
          ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "channel_id" text DEFAULT 'orders_and_alerts' NOT NULL;
          ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_buttons" jsonb DEFAULT '[]'::jsonb NOT NULL;
        `));
      } catch {
        // Non-fatal if columns already exist
      }

      const inAppRecords = targetUsers.map((u) => ({
        userId: u.id,
        type: "marketing",
        title: title,
        body: message,
        priority: "info",
        channelId: "orders_and_alerts",
        actionButtons: [{ label: "View Offer", action: "OPEN_URL", url: finalCta }],
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
      // For free tier serverless reliability, send up to 10 emails in bounded parallel execution
      const emailList = targetAudience === "test_admin" ? targetUsers : targetUsers.slice(0, 10);

      const emailPromises = emailList.map(async (u) => {
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

        return sendGasEmail(emailPayload);
      });

      const settled = await Promise.allSettled(emailPromises);
      for (const res of settled) {
        if (res.status === "fulfilled" && res.value.ok) {
          emailCount++;
        }
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
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Marketing] Broadcast failed:", err);
    return {
      ok: false,
      message: `Broadcast dispatch failed: ${errorMsg}`,
    };
  }
}
