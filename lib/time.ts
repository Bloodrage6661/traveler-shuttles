// Earliest and latest pickup times offered to travellers.
export const PICKUP_MIN = "04:00"; // 4 am
export const PICKUP_MAX = "18:00"; // 6 pm

// Legacy bookings stored a named window instead of an exact time.
const WINDOW_LABELS: Record<string, string> = {
  morning: "Morning (6am–10am)",
  midday: "Midday (10am–2pm)",
  afternoon: "Afternoon (2pm–6pm)",
  evening: "Evening (6pm–10pm)",
};

/** True when an "HH:MM" string falls within the allowed 4am–6pm pickup range. */
export function isPickupTimeInRange(value: string): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return false;
  const mins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  return mins >= 4 * 60 && mins <= 18 * 60;
}

/** Formats a stored pickup time for display: "07:30" -> "7:30 AM". Falls back to legacy window labels. */
export function formatPickupTime(value: string | null | undefined): string {
  if (!value) return "Not specified";
  if (WINDOW_LABELS[value]) return WINDOW_LABELS[value];
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${min} ${ampm}`;
  }
  return value;
}
