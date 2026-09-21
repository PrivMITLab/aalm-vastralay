import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { clientIp } from "./rate-limit";
import { getSettingBool } from "./settings";

/** Append-only audit trail for every privileged action (admin + seller). */
export async function recordAudit(input: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  target?: string;
  detail?: string;
}) {
  try {
    const h = await headers();
    const trustProxy = await getSettingBool("security.trustProxyHeaders", true);
    await db.insert(auditLogs).values({
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      target: input.target ?? null,
      detail: input.detail?.slice(0, 2000) ?? null,
      ip: clientIp(h, trustProxy),
      userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    });
  } catch (error) {
    console.error("[audit] failed to record", error);
  }
}

export const AUDIT_LABELS: Record<string, string> = {
  "auth.sign_in": "Signed in",
  "auth.sign_in_failed": "Failed sign-in",
  "auth.sign_up": "Created account",
  "auth.sign_out": "Signed out",
  "auth.locked": "Account temporarily locked",
  "settings.update": "Updated site settings",
  "settings.reset": "Reset settings to defaults",
  "order.place": "Placed order",
  "order.status": "Changed order status",
  "order.cancel": "Cancelled order",
  "order.return": "Requested return",
  "product.create": "Created product",
  "product.update": "Updated product",
  "product.delete": "Deleted product",
  "product.toggle": "Toggled product visibility",
  "store.create": "Created store",
  "store.update": "Updated store",
  "store.toggle": "Suspended/activated store",
  "user.role": "Changed user role",
  "coupon.create": "Created coupon",
  "coupon.toggle": "Toggled coupon",
  "category.create": "Created category",
  "review.create": "Published review",
};

export function auditLabel(action: string) {
  return AUDIT_LABELS[action] ?? action;
}
