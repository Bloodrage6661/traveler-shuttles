// Earliest and latest pickup times offered to travellers (24-hour clock).
export const PICKUP_MIN = "04:00"; // 04:00
export const PICKUP_MAX = "23:59"; // up to midnight (24:00)

// Scheduling buffers so Greg can complete each trip and reset between jobs.
export const TRIP_COMPLETE_MIN = 90; // 1.5 h to complete a trip
export const BOOKING_GRACE_MIN = 45; // grace between one trip and the next
// Two pickups on the same day must be at least this many minutes apart.
export const MIN_SLOT_GAP_MIN = TRIP_COMPLETE_MIN + BOOKING_GRACE_MIN; // 135

// Legacy bookings stored a named window instead of an exact time (24-hour).
const WINDOW_LABELS: Record<string, string> = {
  morning: "Morning (06:00–10:00)",
  midday: "Midday (10:00–14:00)",
  afternoon: "Afternoon (14:00–18:00)",
  evening: "Evening (18:00–22:00)",
};

/** Minutes-since-midnight for an "HH:MM" string, or null if unparseable. */
export function pickupMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** True when an "HH:MM" string falls within the allowed 04:00–24:00 pickup range. */
export function isPickupTimeInRange(value: string): boolean {
  const mins = pickupMinutes(value);
  if (mins == null) return false;
  return mins >= 4 * 60 && mins <= 24 * 60;
}

/** Formats a stored pickup time for display in 24-hour format: "07:30" -> "07:30". Falls back to legacy window labels. */
export function formatPickupTime(value: string | null | undefined): string {
  if (!value) return "Not specified";
  if (WINDOW_LABELS[value]) return WINDOW_LABELS[value];
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (m) {
    const h = String(parseInt(m[1], 10)).padStart(2, "0");
    return `${h}:${m[2]}`;
  }
  return value;
}
