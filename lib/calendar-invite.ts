import { formatPickupTime } from "./time";

// South Africa Standard Time is a fixed UTC+2 (no daylight saving).
const SAST_OFFSET_HOURS = 2;
const ORGANIZER_EMAIL = "noreply@travelershuttlesandtours.co.za";
const TRIP_MINUTES = 60; // assumed trip length for the calendar block

export type InviteBooking = {
  id: string;
  clientName: string;
  clientCell?: string | null;
  clientEmail?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  tripType?: string | null;
  fareZar?: number | null;
  preferredDate: string | null;
  preferredTimeWindow: string | null; // holds an "HH:MM" time (or a legacy window name)
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Compact UTC timestamp: 20260814T053000Z
function utcStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

// Returns UTC start/end for a timed booking, or null when there's no precise time.
function times(b: InviteBooking): { start: Date; end: Date } | null {
  const dm = b.preferredDate ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.preferredDate) : null;
  const tm = b.preferredTimeWindow ? /^(\d{1,2}):(\d{2})$/.exec(b.preferredTimeWindow) : null;
  if (!dm || !tm) return null;
  // Local SAST -> UTC by subtracting the offset.
  const start = new Date(Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +tm[1] - SAST_OFFSET_HOURS, +tm[2], 0));
  const end = new Date(start.getTime() + TRIP_MINUTES * 60 * 1000);
  return { start, end };
}

function summary(b: InviteBooking) {
  return `Shuttle: ${b.clientName}`;
}

function descriptionLines(b: InviteBooking): string[] {
  const ref = b.id.slice(0, 8).toUpperCase();
  const fare = b.fareZar != null ? `R ${b.fareZar.toLocaleString("en-ZA")}` : "TBC";
  return [
    `Booking #${ref}`,
    `Client: ${b.clientName}`,
    b.clientCell ? `Cell: ${b.clientCell}` : "",
    b.clientEmail ? `Email: ${b.clientEmail}` : "",
    `Passengers: ${b.passengers}`,
    b.tripType ? `Trip: ${b.tripType.replace(/_/g, " ")}` : "",
    `Pickup: ${b.pickupAddress}`,
    `Drop-off: ${b.dropoffAddress}`,
    `Time: ${formatPickupTime(b.preferredTimeWindow)}`,
    `Fare: ${fare}`,
  ].filter(Boolean);
}

// Escape per RFC 5545 for text fields.
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Builds an iCalendar (.ics) REQUEST invite, or null if the booking can't be scheduled. */
export function buildBookingIcs(b: InviteBooking, attendees: string[]): string | null {
  if (!b.preferredDate) return null;
  const t = times(b);
  const ref = b.id.slice(0, 8).toUpperCase();
  const desc = esc(descriptionLines(b).join("\n"));
  const loc = esc(`${b.pickupAddress} → ${b.dropoffAddress}`);
  const now = utcStamp(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Traveler Shuttles and Tours//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${b.id}@travelershuttlesandtours.co.za`,
    `DTSTAMP:${now}`,
  ];

  if (t) {
    lines.push(`DTSTART:${utcStamp(t.start)}`, `DTEND:${utcStamp(t.end)}`);
  } else {
    // No precise time -> all-day event on the requested date.
    const d = b.preferredDate.replace(/-/g, "");
    const next = new Date(Date.UTC(+b.preferredDate.slice(0, 4), +b.preferredDate.slice(5, 7) - 1, +b.preferredDate.slice(8, 10) + 1));
    lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`);
  }

  lines.push(
    `SUMMARY:${esc(summary(b))}`,
    `LOCATION:${loc}`,
    `DESCRIPTION:${desc}`,
    `ORGANIZER;CN=Traveler Shuttles and Tours:mailto:${ORGANIZER_EMAIL}`
  );
  for (const a of attendees) {
    lines.push(`ATTENDEE;CN=${a};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${a}`);
  }
  lines.push("STATUS:CONFIRMED", "SEQUENCE:0", "END:VEVENT", "END:VCALENDAR");

  void ref;
  return lines.join("\r\n");
}

/** One-click "Add to Google Calendar" URL, or null if the booking can't be scheduled. */
export function googleCalendarLink(b: InviteBooking): string | null {
  if (!b.preferredDate) return null;
  const t = times(b);
  let dates: string;
  if (t) {
    dates = `${utcStamp(t.start)}/${utcStamp(t.end)}`;
  } else {
    const d = b.preferredDate.replace(/-/g, "");
    const next = new Date(Date.UTC(+b.preferredDate.slice(0, 4), +b.preferredDate.slice(5, 7) - 1, +b.preferredDate.slice(8, 10) + 1));
    dates = `${d}/${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary(b),
    dates,
    details: descriptionLines(b).join("\n"),
    location: `${b.pickupAddress} → ${b.dropoffAddress}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
