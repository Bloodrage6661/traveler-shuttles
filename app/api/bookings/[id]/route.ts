import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendDriverNotification } from "@/lib/email";
import { checkSlot } from "@/lib/availability";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { loyaltyEligible } from "@/lib/loyalty";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// A signed-in client changes one of their own bookings. It goes back to
// "pending" so Greg re-confirms it (the email link works again).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!rateLimit(`booking-change:${clientIp(req)}`, 10, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const db = getSupabaseAdmin();
    const { data: auth } = token ? await db.auth.getUser(token) : { data: { user: null } };
    if (!auth.user) return NextResponse.json({ error: "Please sign in to change a booking." }, { status: 401 });

    const { data: booking } = await db.from("bookings").select("*").eq("id", id).single();
    if (!booking || booking.user_id !== auth.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    const today = new Date().toISOString().slice(0, 10);
    if (booking.status === "cancelled" || (booking.preferred_date && booking.preferred_date < today)) {
      return NextResponse.json({ error: "This booking can no longer be changed — please make a new one." }, { status: 409 });
    }

    const b = await req.json();
    if (!b.clientName || !b.clientEmail || !b.clientCell || !b.pickupAddress || !b.dropoffAddress || !b.preferredDate || !b.preferredTimeWindow) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const slot = await checkSlot(b.preferredDate, b.preferredTimeWindow, id);
    if (!slot.available) return NextResponse.json({ error: slot.message }, { status: 409 });

    const loyalty = typeof b.fareZar === "number" && (await loyaltyEligible(b.clientEmail, id));
    const fareZar = loyalty ? Math.round(b.fareZar / 2) : (b.fareZar ?? null);
    const cleanFlight = typeof b.flightNumber === "string" && b.flightNumber.trim() ? b.flightNumber.trim().toUpperCase() : null;

    const { error } = await db.from("bookings").update({
      client_name: b.clientName,
      client_email: b.clientEmail,
      client_cell: b.clientCell,
      pickup_address: b.pickupAddress,
      dropoff_address: b.dropoffAddress,
      distance_km: b.distanceKm ?? 0,
      passengers: b.passengers,
      trip_type: b.tripType,
      customer_tier: b.customerTier ?? "General",
      pricing_band: b.pricingBand,
      fare_zar: fareZar,
      preferred_date: b.preferredDate,
      preferred_time_window: b.preferredTimeWindow,
      flight_number: cleanFlight,
      status: "pending",
      token_used: false,
    }).eq("id", id);
    if (error) {
      console.error("Booking change error:", error);
      return NextResponse.json({ error: "Failed to save your changes" }, { status: 500 });
    }

    await Promise.allSettled([
      sendDriverNotification({
        id, confirmToken: booking.confirm_token, changed: true, loyalty,
        clientName: b.clientName, clientEmail: b.clientEmail, clientCell: b.clientCell,
        pickupAddress: b.pickupAddress, dropoffAddress: b.dropoffAddress,
        distanceKm: b.distanceKm ?? 0, passengers: b.passengers, tripType: b.tripType,
        customerTier: b.customerTier ?? "General", pricingBand: b.pricingBand, fareZar,
        preferredDate: b.preferredDate, preferredTimeWindow: b.preferredTimeWindow, flightNumber: cleanFlight,
      }),
      sendWhatsAppAlert(
        `Booking changed by ${b.clientName}`,
        `${b.preferredDate} ${b.preferredTimeWindow} · ${b.passengers ?? 1} pax · ${fareZar ? "R" + fareZar : "custom quote"} — please re-confirm`,
        `${BASE_URL}/admin?booking=${id}`,
      ),
    ]);

    return NextResponse.json({ ref: id.slice(0, 8).toUpperCase(), loyalty, fareZar });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
