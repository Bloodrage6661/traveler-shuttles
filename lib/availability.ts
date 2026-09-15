import { getSupabaseAdmin } from "./supabase";
import { pickupMinutes, isPickupTimeInRange, MIN_SLOT_GAP_MIN, formatPickupTime } from "./time";
import { getGoogleCalendarBusyDates } from "./google-calendar";

export async function getUnavailableDates(month: string): Promise<string[]> {
  const [year, mon] = month.split("-").map(Number);
  const from = `${year}-${String(mon).padStart(2, "0")}-01`;
  // Exclusive upper bound = first day of next month. Avoids invalid dates like
  // "2026-09-31" (30-day months / February), which error and returned nothing.
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon = mon === 12 ? 1 : mon + 1;
  const toExclusive = `${nextYear}-${String(nextMon).padStart(2, "0")}-01`;

  const { data, error } = await getSupabaseAdmin()
    .from("unavailable_dates")
    .select("date")
    .gte("date", from)
    .lt("date", toExclusive);

  if (error) console.error("getUnavailableDates error:", error.message);
  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function markUnavailable(date: string, note?: string) {
  await getSupabaseAdmin()
    .from("unavailable_dates")
    .upsert({ date, note: note ?? null });
}

export async function markAvailable(date: string) {
  await getSupabaseAdmin()
    .from("unavailable_dates")
    .delete()
    .eq("date", date);
}

/** Pickup times ("HH:MM") already taken on a date (pending or confirmed trips). */
export async function getBookedPickupTimes(date: string): Promise<string[]> {
  const { data } = await getSupabaseAdmin()
    .from("bookings")
    .select("preferred_time_window")
    .eq("preferred_date", date)
    .in("status", ["pending", "confirmed"]);
  return (data ?? [])
    .map((r: { preferred_time_window: string | null }) => r.preferred_time_window)
    .filter((t: string | null): t is string => !!t);
}

export type SlotCheck = {
  available: boolean;
  reason?: "out_of_range" | "day_blocked" | "too_close";
  message: string;
};

/** Checks a specific date + time against blocked days and the 135-min spacing rule. */
export async function checkSlot(date: string, time: string): Promise<SlotCheck> {
  if (!isPickupTimeInRange(time)) {
    return { available: false, reason: "out_of_range", message: "Pickups are available between 04:00 and 24:00." };
  }

  const [adminDates, calendarDates] = await Promise.all([
    getUnavailableDates(date.slice(0, 7)),
    getGoogleCalendarBusyDates(date.slice(0, 7)).catch(() => [] as string[]),
  ]);
  if (new Set([...adminDates, ...calendarDates]).has(date)) {
    return { available: false, reason: "day_blocked", message: "That day is fully booked or unavailable. Please pick another date." };
  }

  const wanted = pickupMinutes(time)!;
  const taken = await getBookedPickupTimes(date);
  const clash = taken.find((t) => {
    const m = pickupMinutes(t);
    return m != null && Math.abs(m - wanted) < MIN_SLOT_GAP_MIN;
  });
  if (clash) {
    return {
      available: false,
      reason: "too_close",
      message: `There's already a trip near ${formatPickupTime(clash)}. Please choose a time at least ${MIN_SLOT_GAP_MIN} minutes clear of it.`,
    };
  }

  return { available: true, message: "This time is available." };
}
