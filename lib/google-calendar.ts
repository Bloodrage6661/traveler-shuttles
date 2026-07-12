/**
 * Reads Greg's Google Calendar via its private iCal ("secret address") URL and
 * returns the set of dates (YYYY-MM-DD) that have at least one event in the
 * requested month. Those dates are treated as unavailable for booking.
 *
 * Setup: Google Calendar → Settings → (his calendar) → "Integrate calendar" →
 * copy the "Secret address in iCal format" URL into GREG_CALENDAR_ICAL_URL.
 *
 * Dependency-free parser. Handles all-day (VALUE=DATE), timed events, multi-day
 * spans, and simple weekly/daily RRULE recurrences. Complex recurrence rules
 * (BYDAY lists, monthly/yearly) fall back to just the first occurrence.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Parse an iCal DTSTART/DTEND value into a UTC Date. */
function parseICalDate(value: string): Date | null {
  // Date only: 20260715
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Date.UTC(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]));
  }
  // Date-time: 20260715T090000Z or 20260715T090000
  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
  if (dateTime) {
    return new Date(Date.UTC(+dateTime[1], +dateTime[2] - 1, +dateTime[3], +dateTime[4], +dateTime[5], +dateTime[6]));
  }
  return null;
}

/** Unfold RFC 5545 folded lines (continuation lines start with space/tab). */
function unfold(ics: string): string[] {
  const rawLines = ics.split(/\r?\n/);
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

export async function getGoogleCalendarBusyDates(month: string): Promise<string[]> {
  const url = process.env.GREG_CALENDAR_ICAL_URL;
  if (!url) return [];

  const [year, mon] = month.split("-").map(Number);
  const monthStart = Date.UTC(year, mon - 1, 1);
  const monthEnd = Date.UTC(year, mon, 1); // exclusive: first of next month

  let ics: string;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    ics = await res.text();
  } catch {
    return [];
  }

  const lines = unfold(ics);
  const busy = new Set<string>();

  let inEvent = false;
  let dtStart: Date | null = null;
  let dtEnd: Date | null = null;
  let rrule = "";

  const dayMs = 24 * 60 * 60 * 1000;

  const addSpan = (start: Date, end: Date | null) => {
    // For all-day events DTEND is exclusive; for timed events fall back to same day.
    const last = end ? end.getTime() - dayMs : start.getTime();
    for (let t = start.getTime(); t <= last; t += dayMs) {
      if (t >= monthStart && t < monthEnd) busy.add(toDateStr(new Date(t)));
    }
  };

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true; dtStart = null; dtEnd = null; rrule = "";
      continue;
    }
    if (line === "END:VEVENT") {
      if (dtStart) {
        if (rrule) {
          // Simple weekly/daily recurrence expansion across the requested month.
          const freq = /FREQ=(DAILY|WEEKLY)/.exec(rrule)?.[1];
          const untilRaw = /UNTIL=([0-9TZ]+)/.exec(rrule)?.[1];
          const until = untilRaw ? parseICalDate(untilRaw)?.getTime() ?? monthEnd : monthEnd;
          const step = freq === "DAILY" ? dayMs : freq === "WEEKLY" ? 7 * dayMs : 0;
          if (step > 0) {
            for (let t = dtStart.getTime(); t < monthEnd && t <= until; t += step) {
              if (t >= monthStart) busy.add(toDateStr(new Date(t)));
            }
          } else {
            addSpan(dtStart, dtEnd);
          }
        } else {
          addSpan(dtStart, dtEnd);
        }
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    if (line.startsWith("DTSTART")) {
      const val = line.split(":").pop() ?? "";
      dtStart = parseICalDate(val);
    } else if (line.startsWith("DTEND")) {
      const val = line.split(":").pop() ?? "";
      dtEnd = parseICalDate(val);
    } else if (line.startsWith("RRULE")) {
      rrule = line.split(":").pop() ?? "";
    }
  }

  return [...busy];
}
