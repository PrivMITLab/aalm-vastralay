import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const all = await getSettings();
    return NextResponse.json({ settings: all });
  } catch (err) {
    console.error("[api/admin/settings] Error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
