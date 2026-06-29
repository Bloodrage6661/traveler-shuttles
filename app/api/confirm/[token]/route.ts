import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendClientConfirmed, sendClientDeclined } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const action = req.nextUrl.searchParams.get("action");
  const db = getSupabaseAdmin();

  if (action !== "accept" && action !== "decline") {
    return NextResponse.redirect(`${BASE_URL}/confirm/invalid`);
  }

  const { data: booking, error } = await db
    .from("bookings")
    .select("*")
    .eq("confirm_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.redirect(`${BASE_URL}/confirm/invalid`);
  }

  if (booking.token_used || booking.status !== "pending") {
    return NextResponse.redirect(`${BASE_URL}/confirm/already-used`);
  }

  await db.from("bookings").update({ token_used: true }).eq("id", booking.id);

  if (action === "accept") {
    await db.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);

    await sendClientConfirmed({
      id: booking.id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      passengers: booking.passengers,
      fareZar: booking.fare_zar,
      preferredDate: booking.preferred_date,
      preferredTimeWindow: booking.preferred_time_window,
    });

    return NextResponse.redirect(`${BASE_URL}/confirm/accepted`);
  } else {
    await db.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);

    await sendClientDeclined({
      id: booking.id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
    });

    return NextResponse.redirect(`${BASE_URL}/confirm/declined`);
  }
}
