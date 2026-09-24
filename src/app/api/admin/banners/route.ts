import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHomeConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const homeConfig = await getHomeConfig();
    return NextResponse.json({
      banner: homeConfig.banner,
      homeConfig,
    });
  } catch (err) {
    console.error("[api/admin/banners] Error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
