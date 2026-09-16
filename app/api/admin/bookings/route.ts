import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminCookie } from "@/app/api/admin/login/route";
import { sendDriverCalendarInvite } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Select only the columns the admin UI renders — smaller payload and keeps
  // sensitive fields (confirm_token, token_used, user_id) off the wire.
  const { data: bookings } = await getSupabaseAdmin()
    .from("bookings")
    .select(
      "id,created_at,client_name,company_name,client_email,client_cell,pickup_address,dropoff_address,distance_km,passengers,trip_type,customer_tier,pricing_band,fare_zar,preferred_date,preferred_time_window,dropoff_time,flight_number,status",
    )
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookings: bookings ?? [] });
}

// Greg places a booking manually from the admin panel.
export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const b = await req.json();
  if (!b.clientName || !String(b.clientName).trim()) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }

  const status = b.status === "pending" ? "pending" : "confirmed";
  const row = {
    client_name: String(b.clientName).trim(),
    company_name: b.companyName?.trim() || null,
    client_email: b.clientEmail?.trim() || "",
    client_cell: b.clientCell?.trim() || "",
    pickup_address: b.pickupAddress?.trim() || "",
    dropoff_address: b.dropoffAddress?.trim() || "",
    distance_km: Number(b.distanceKm) || 0,
    passengers: Number(b.passengers) || 1,
    trip_type: b.tripType || "point_to_point",
    customer_tier: b.customerTier || "General",
    pricing_band: b.pricingBand || "custom",
    fare_zar: b.fareZar != null && b.fareZar !== "" ? Math.round(Number(b.fareZar)) : null,
    preferred_date: b.preferredDate || null,
    preferred_time_window: b.pickupTime || null,
    dropoff_time: b.dropoffTime || null,
    flight_number: b.flightNumber?.trim().toUpperCase() || null,
    status,
    token_used: true, // admin-created; no client confirm link needed
  };

  const { data: booking, error } = await getSupabaseAdmin()
    .from("bookings")
    .insert(row)
    .select()
    .single();

  if (error || !booking) {
    console.error("Manual booking insert error:", error);
    return NextResponse.json({ error: "Could not save the booking." }, { status: 500 });
  }

  // Put confirmed manual bookings on Greg's calendar too.
  if (status === "confirmed") {
    try {
      await sendDriverCalendarInvite({
        id: booking.id,
        clientName: booking.client_name,
        clientCell: booking.client_cell,
        clientEmail: booking.client_email,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        passengers: booking.passengers,
        tripType: booking.trip_type,
        fareZar: booking.fare_zar,
        preferredDate: booking.preferred_date,
        preferredTimeWindow: booking.preferred_time_window,
        dropoffTime: booking.dropoff_time,
      });
    } catch (e) {
      console.error("Manual booking calendar invite failed:", e);
    }
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
