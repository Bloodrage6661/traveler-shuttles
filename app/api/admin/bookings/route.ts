import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminCookie } from "@/app/api/admin/login/route";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bookings } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookings: bookings ?? [] });
}
