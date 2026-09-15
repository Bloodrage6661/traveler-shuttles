import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendClientConfirmed, sendClientDeclined, sendClientPriceUpdated, sendClientRescheduled, sendDriverCalendarInvite } from "@/lib/email";
import { verifyAdminCookie } from "@/app/api/admin/login/route";
import { isPickupTimeInRange } from "@/lib/time";

function auth(req: NextRequest) {
  return verifyAdminCookie(req.cookies.get("admin_session")?.value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, finalPrice, preferredDate, pickupTime, dropoffTime } = await req.json();
  const db = getSupabaseAdmin();

  const { data: booking } = await db.from("bookings").select("*").eq("id", id).single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "confirm") {
    // Greg sets the final price manually; fall back to the estimate if none provided.
    const fare = typeof finalPrice === "number" && finalPrice > 0 ? Math.round(finalPrice) : booking.fare_zar;
    await db.from("bookings").update({ status: "confirmed", token_used: true, fare_zar: fare }).eq("id", id);
    const results = await Promise.allSettled([
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
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`[confirm] email ${i} failed:`, r.reason);
    });
    if (req.nextUrl.searchParams.get("debug") === "1") {
      return NextResponse.json({
        ok: true,
        clientEmail: booking.client_email,
        emails: results.map(r => r.status === "rejected" ? { ok: false, error: String(r.reason?.message ?? r.reason) } : { ok: true }),
      });
    }
  } else if (action === "update_price") {
    // Change the fare on an already-confirmed booking and re-notify the client.
    const fare = typeof finalPrice === "number" && finalPrice > 0 ? Math.round(finalPrice) : booking.fare_zar;
    await db.from("bookings").update({ fare_zar: fare }).eq("id", id);
    await sendClientPriceUpdated({
      id: booking.id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      passengers: booking.passengers,
      fareZar: fare,
      preferredDate: booking.preferred_date,
      preferredTimeWindow: booking.preferred_time_window,
    });
  } else if (action === "reschedule") {
    // Greg changes the pickup date/time (and optional drop-off time). Updating
    // the row updates in-app availability; re-sending the invite (higher
    // SEQUENCE, same UID) overwrites the event on his calendar.
    if (!preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
    }
    if (!pickupTime || !isPickupTimeInRange(pickupTime)) {
      return NextResponse.json({ error: "Pickup time must be between 04:00 and 24:00." }, { status: 400 });
    }
    const cleanDropoff = typeof dropoffTime === "string" && /^\d{1,2}:\d{2}$/.test(dropoffTime) ? dropoffTime : null;
    if (cleanDropoff && cleanDropoff <= pickupTime) {
      return NextResponse.json({ error: "Drop-off time must be after the pickup time." }, { status: 400 });
    }

    await db.from("bookings")
      .update({ preferred_date: preferredDate, preferred_time_window: pickupTime, dropoff_time: cleanDropoff })
      .eq("id", id);

    const updated = { ...booking, preferred_date: preferredDate, preferred_time_window: pickupTime, dropoff_time: cleanDropoff };
    // Monotonic sequence so calendar clients treat each save as an update.
    const sequence = Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 1000);

    const tasks: Promise<unknown>[] = [
      sendDriverCalendarInvite({
        id: updated.id,
        clientName: updated.client_name,
        clientCell: updated.client_cell,
        clientEmail: updated.client_email,
        pickupAddress: updated.pickup_address,
        dropoffAddress: updated.dropoff_address,
        passengers: updated.passengers,
        tripType: updated.trip_type,
        fareZar: updated.fare_zar,
        preferredDate,
        preferredTimeWindow: pickupTime,
        dropoffTime: cleanDropoff,
      }, sequence),
    ];
    if (updated.status === "confirmed") {
      tasks.push(sendClientRescheduled({
        id: updated.id,
        clientName: updated.client_name,
        clientEmail: updated.client_email,
        pickupAddress: updated.pickup_address,
        dropoffAddress: updated.dropoff_address,
        passengers: updated.passengers,
        preferredDate,
        preferredTimeWindow: pickupTime,
        dropoffTime: cleanDropoff,
      }));
    }
    const results = await Promise.allSettled(tasks);
    results.forEach((r, i) => { if (r.status === "rejected") console.error(`[reschedule] task ${i} failed:`, r.reason); });
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
