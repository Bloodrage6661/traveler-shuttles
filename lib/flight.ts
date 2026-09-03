// Live flight tracking via AeroDataBox (RapidAPI). Free tier, no card required.
//
// Setup:
//   1. Sign up at https://rapidapi.com and subscribe to AeroDataBox's free "Basic" plan.
//   2. Copy your RapidAPI key and set AERODATABOX_RAPIDAPI_KEY in the environment.
//
// This module looks up a flight by its number + date and returns a normalised,
// display-ready status (scheduled vs. estimated arrival, delay, live state).

const RAPIDAPI_HOST = "aerodatabox.p.rapidapi.com";

export type FlightTone = "ok" | "live" | "warn" | "bad" | "muted";

export type FlightStatus = {
  number: string;
  status: string; // raw AeroDataBox status, e.g. "EnRoute"
  label: string; // friendly label, e.g. "En route"
  tone: FlightTone;
  departureAirport: string | null;
  arrivalAirport: string | null;
  scheduledDepartureLocal: string | null; // ISO-ish local string
  estimatedDepartureLocal: string | null;
  scheduledArrivalLocal: string | null;
  estimatedArrivalLocal: string | null;
  arrivalDelayMinutes: number | null;
  fetchedAt: string; // ISO timestamp of this lookup
};

type AdbTime = { utc?: string; local?: string } | undefined;
type AdbMovement = {
  airport?: { iata?: string; icao?: string; name?: string; municipalityName?: string };
  scheduledTime?: AdbTime;
  revisedTime?: AdbTime;
  predictedTime?: AdbTime;
  runwayTime?: AdbTime;
  terminal?: string;
};
type AdbFlight = {
  number?: string;
  status?: string;
  departure?: AdbMovement;
  arrival?: AdbMovement;
};

// Map AeroDataBox's raw status to a friendly label + colour tone.
function classify(raw: string): { label: string; tone: FlightTone } {
  const s = (raw || "").toLowerCase();
  if (s.includes("arriv") || s.includes("landed")) return { label: "Landed", tone: "ok" };
  if (s.includes("enroute") || s.includes("en route") || s.includes("airborne")) return { label: "In the air", tone: "live" };
  if (s.includes("board")) return { label: "Boarding", tone: "live" };
  if (s.includes("depart")) return { label: "Departed", tone: "live" };
  if (s.includes("delay")) return { label: "Delayed", tone: "warn" };
  if (s.includes("cancel")) return { label: "Cancelled", tone: "bad" };
  if (s.includes("divert")) return { label: "Diverted", tone: "bad" };
  if (s.includes("expect") || s.includes("scheduled") || s.includes("checkin") || s.includes("check-in")) return { label: "On schedule", tone: "ok" };
  if (s.includes("unknown") || s === "") return { label: "Awaiting data", tone: "muted" };
  // Fall back to a title-cased version of whatever the API sent.
  return { label: raw.charAt(0).toUpperCase() + raw.slice(1), tone: "ok" };
}

function pickTime(t: AdbTime): string | null {
  return t?.local ?? t?.utc ?? null;
}

// Best "estimated" time: revised (confirmed) beats predicted (forecast).
function estimatedTime(m: AdbMovement | undefined): string | null {
  return pickTime(m?.revisedTime) ?? pickTime(m?.predictedTime) ?? null;
}

function airportLabel(m: AdbMovement | undefined): string | null {
  const a = m?.airport;
  if (!a) return null;
  const name = a.municipalityName || a.name;
  return a.iata ? (name ? `${name} (${a.iata})` : a.iata) : name ?? null;
}

// AeroDataBox local times look like "2026-09-10 14:35+02:00" — parse to a Date.
function parseLocal(s: string | null): Date | null {
  if (!s) return null;
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function delayMinutes(scheduled: string | null, estimated: string | null): number | null {
  const s = parseLocal(scheduled);
  const e = parseLocal(estimated);
  if (!s || !e) return null;
  return Math.round((e.getTime() - s.getTime()) / 60000);
}

/**
 * Look up live status for a flight number on a given date (YYYY-MM-DD).
 * Returns null when tracking isn't configured or the flight can't be found.
 */
export async function getFlightStatus(flightNumber: string, dateISO: string): Promise<FlightStatus | null> {
  const key = process.env.AERODATABOX_RAPIDAPI_KEY;
  if (!key) return null;

  const num = flightNumber.replace(/\s+/g, "").toUpperCase();
  const date = dateISO.slice(0, 10);
  if (!/^[A-Z0-9]{2,8}$/.test(num) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const url = `https://${RAPIDAPI_HOST}/flights/number/${encodeURIComponent(num)}/${date}?withAircraftImage=false&withLocation=false`;

  let flights: AdbFlight[];
  try {
    const res = await fetch(url, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": RAPIDAPI_HOST },
      // Never cache — this is live data.
      cache: "no-store",
    });
    if (res.status === 204 || res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    flights = Array.isArray(json) ? json : json?.flights ?? [];
  } catch {
    return null;
  }
  if (!flights || flights.length === 0) return null;

  // If several legs share the number that day, prefer the most progressed one.
  const priority = (f: AdbFlight) => {
    const s = (f.status || "").toLowerCase();
    if (s.includes("arriv") || s.includes("landed")) return 5;
    if (s.includes("enroute") || s.includes("airborne") || s.includes("depart")) return 4;
    if (s.includes("board")) return 3;
    if (s.includes("delay")) return 2;
    return 1;
  };
  const f = [...flights].sort((a, b) => priority(b) - priority(a))[0];

  const raw = f.status ?? "Unknown";
  const { label, tone } = classify(raw);
  const schedArr = pickTime(f.arrival?.scheduledTime);
  const estArr = estimatedTime(f.arrival);

  return {
    number: f.number ?? num,
    status: raw,
    label,
    tone,
    departureAirport: airportLabel(f.departure),
    arrivalAirport: airportLabel(f.arrival),
    scheduledDepartureLocal: pickTime(f.departure?.scheduledTime),
    estimatedDepartureLocal: estimatedTime(f.departure),
    scheduledArrivalLocal: schedArr,
    estimatedArrivalLocal: estArr,
    arrivalDelayMinutes: delayMinutes(schedArr, estArr),
    fetchedAt: new Date().toISOString(),
  };
}
