import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendDriverNotification, sendClientPending } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      clientName, clientEmail, clientCell,
      pickupAddress, dropoffAddress,
      distanceKm, passengers, tripType,
      customerTier, pricingBand, fareZar,
      preferredDate, preferredTimeWindow, flightNumber,
      userId,
    } = body;

    if (!clientName || !clientEmail || !clientCell || !pickupAddress || !dropoffAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanFlight = typeof flightNumber === "string" && flightNumber.trim()
      ? flightNumber.trim().toUpperCase()
      : null;

    const baseRow = {
      client_name: clientName,
      client_email: clientEmail,
      client_cell: clientCell,
      pickup_address: pickupAddress,
      dropoff_address: dropoffAddress,
      distance_km: distanceKm ?? 0,
      passengers,
      trip_type: tripType,
      customer_tier: customerTier ?? "General",
      pricing_band: pricingBand,
      fare_zar: fareZar ?? null,
      preferred_date: preferredDate ?? null,
      preferred_time_window: preferredTimeWindow ?? null,
      status: "pending",
      user_id: userId ?? null,
    };

    let { data: booking, error } = await getSupabaseAdmin()
      .from("bookings")
      .insert({ ...baseRow, flight_number: cleanFlight })
      .select()
      .single();

    // If the flight_number column hasn't been added to the DB yet, don't lose
    // the booking — retry the insert without it.
    if (error && /flight_number/i.test(error.message ?? "")) {
      ({ data: booking, error } = await getSupabaseAdmin()
        .from("bookings")
        .insert(baseRow)
        .select()
        .single());
    }

    if (error || !booking) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }

    await Promise.allSettled([
      sendDriverNotification({
        id: booking.id,
        confirmToken: booking.confirm_token,
        clientName, clientEmail, clientCell,
        pickupAddress, dropoffAddress,
        distanceKm: distanceKm ?? 0, passengers, tripType,
        customerTier: customerTier ?? "General",
        pricingBand, fareZar,
        preferredDate, preferredTimeWindow,
        flightNumber: cleanFlight,
      }),
      sendClientPending({
        id: booking.id,
        clientName,
        clientEmail,
        preferredDate,
      }),
    ]);

    return NextResponse.json({
      bookingId: booking.id,
      ref: booking.id.slice(0, 8).toUpperCase(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
