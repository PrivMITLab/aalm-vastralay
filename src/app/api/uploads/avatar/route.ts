import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * RETIRED: user profile-photo uploads were removed in favour of
 * auto-generated privacy-first avatars (GET /api/avatar?seed=...).
 *
 * The file is kept as an explicit 410 Gone stub (instead of deleting the
 * route) so old clients get a clear answer instead of a mysterious 404,
 * and the decision stays visible in code review. Seller logo/banner
 * uploads live separately under /api/uploads/logo and are unaffected.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Profile photo uploads are retired. Avatars are auto-generated now." },
    { status: 410 },
  );
}
