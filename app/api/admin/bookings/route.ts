import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminCookie } from "@/app/api/admin/login/route";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Select only the columns the admin UI renders — smaller payload and keeps
  // sensitive fields (confirm_token, token_used, user_id) off the wire.
  const { data: bookings } = await getSupabaseAdmin()
    .from("bookings")
    .select(
      "id,created_at,client_name,client_email,client_cell,pickup_address,dropoff_address,distance_km,passengers,trip_type,customer_tier,pricing_band,fare_zar,preferred_date,preferred_time_window,dropoff_time,flight_number,status",
    )
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookings: bookings ?? [] });
}
