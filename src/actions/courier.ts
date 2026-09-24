"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/cached";
import { generateAwbForOrder } from "@/lib/courier";
import type { CourierProvider } from "@/types/courier";

export type AwbActionState = {
  success?: string;
  error?: string;
  awbCode?: string;
  courier?: string;
  labelUrl?: string;
} | null;

export async function createOrderAwbAction(
  orderId: string,
  provider: CourierProvider = "auto"
): Promise<AwbActionState> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return { error: "Unauthorized. Admin or Seller access required." };
  }

  try {
    const result = await generateAwbForOrder(orderId, provider);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/seller/orders");
    revalidatePath("/admin");

    return {
      success: `Generated ${result.courier} AWB: ${result.awbCode}`,
      awbCode: result.awbCode,
      courier: result.courier,
      labelUrl: result.labelUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate AWB";
    return { error: message };
  }
}
