import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendClientConfirmed, sendClientDeclined, sendDriverCalendarInvite } from "@/lib/email";
import { verifyAdminCookie } from "@/app/api/admin/login/route";

function auth(req: NextRequest) {
  return verifyAdminCookie(req.cookies.get("admin_session")?.value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, finalPrice } = await req.json();
  const db = getSupabaseAdmin();

  const { data: booking } = await db.from("bookings").select("*").eq("id", id).single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "confirm") {
    // Greg sets the final price manually; fall back to the estimate if none provided.
    const fare = typeof finalPrice === "number" && finalPrice > 0 ? Math.round(finalPrice) : booking.fare_zar;
    await db.from("bookings").update({ status: "confirmed", token_used: true, fare_zar: fare }).eq("id", id);
    await Promise.allSettled([
      sendClientConfirmed({
        id: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        passengers: booking.passengers,
        fareZar: fare,
        preferredDate: booking.preferred_date,
        preferredTimeWindow: booking.preferred_time_window,
      }),
      sendDriverCalendarInvite({
        id: booking.id,
        clientName: booking.client_name,
        clientCell: booking.client_cell,
        clientEmail: booking.client_email,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
        passengers: booking.passengers,
        tripType: booking.trip_type,
        fareZar: fare,
        preferredDate: booking.preferred_date,
        preferredTimeWindow: booking.preferred_time_window,
      }),
    ]);
  } else if (action === "cancel") {
    await db.from("bookings").update({ status: "cancelled", token_used: true }).eq("id", id);
    await sendClientDeclined({
      id: booking.id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
    });
  }

  return NextResponse.json({ ok: true });
}
