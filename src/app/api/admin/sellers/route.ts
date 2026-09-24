import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const rows = await db
      .select({
        id: stores.id,
        storeName: stores.storeName,
        slug: stores.slug,
        city: stores.city,
        state: stores.state,
        isActive: stores.isActive,
        rating: stores.rating,
        totalSales: stores.totalSales,
        createdAt: stores.createdAt,
        ownerEmail: users.email,
        ownerName: users.fullName,
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .orderBy(desc(stores.createdAt))
      .limit(100);

    return NextResponse.json({ sellers: rows, count: rows.length });
  } catch (err) {
    console.error("[api/admin/sellers] Error:", err);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
