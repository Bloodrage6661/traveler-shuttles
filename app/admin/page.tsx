"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, Check, X, CalendarDays, Clock, Loader2, Users, MapPin, Phone, Mail, ChevronDown, ChevronUp, Plane, RefreshCw, LayoutDashboard, ListChecks, Wallet, CalendarClock, Search, Plus, Building2, ArrowLeft } from "lucide-react";
import { formatPickupTime, PICKUP_MIN, PICKUP_MAX } from "@/lib/time";
import { TIER_LABELS, type CustomerTier } from "@/lib/pricing";
import AdminOverview from "@/components/AdminOverview";
import AdminFinance from "@/components/AdminFinance";

type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  created_at: string;
  client_name: string;
  company_name: string | null;
  client_email: string;
  client_cell: string;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number;
  passengers: number;
  trip_type: string;
  customer_tier: string;
  pricing_band: string;
  fare_zar: number | null;
  preferred_date: string | null;
  preferred_time_window: string | null;
  dropoff_time: string | null;
  flight_number: string | null;
  status: BookingStatus;
}

// ─── Live flight status ─────────────────────────────────────────────────────────

interface FlightStatus {
  number: string;
  label: string;
  tone: "ok" | "live" | "warn" | "bad" | "muted";
  departureAirport: string | null;
  arrivalAirport: string | null;
  scheduledArrivalLocal: string | null;
  estimatedArrivalLocal: string | null;
  arrivalDelayMinutes: number | null;
  fetchedAt: string;
}

const FLIGHT_TONE: Record<FlightStatus["tone"], string> = {
  ok:    "bg-green-100 text-green-700",
  live:  "bg-blue-100 text-blue-700",
  warn:  "bg-amber-100 text-amber-700",
  bad:   "bg-red-100 text-red-600",
  muted: "bg-slate-100 text-slate-500",
};

function fmtTime(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

function FlightTracker({ flightNumber, date }: { flightNumber: string; date: string | null }) {
  const [status, setStatus] = useState<FlightStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/flight-status?flight=${encodeURIComponent(flightNumber)}&date=${date}`);
      const data = await res.json();
      if (data.status) setStatus(data.status);
      else { setStatus(null); setNotFound(true); }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [flightNumber, date]);

  // Load on mount and auto-refresh every 90s (live).
  useEffect(() => {
    load();
    const t = setInterval(load, 90_000);
    return () => clearInterval(t);
  }, [load]);

  const delay = status?.arrivalDelayMinutes ?? null;

  return (
    <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Plane size={14} className="text-[#1B3A6B]" />
          <span className="font-semibold text-slate-700 text-sm">Flight {flightNumber}</span>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${FLIGHT_TONE[status.tone]}`}>
              {status.label}
            </span>
          )}
        </div>
        <button onClick={load} disabled={loading} title="Refresh"
          className="text-slate-400 hover:text-[#1B3A6B] transition p-1 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && !status && <p className="text-xs text-slate-400">Checking live status…</p>}
      {notFound && !loading && (
        <p className="text-xs text-slate-400">No live data yet for this flight/date. It usually appears within ~24h of departure.</p>
      )}

      {status && (
        <div className="space-y-1.5 text-xs text-slate-600">
          {(status.departureAirport || status.arrivalAirport) && (
            <p className="flex items-center gap-1.5">
              <span className="truncate">{status.departureAirport ?? "—"}</span>
              <span className="text-slate-300">→</span>
              <span className="truncate">{status.arrivalAirport ?? "—"}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Scheduled arrival: <strong className="text-slate-700">{fmtTime(status.scheduledArrivalLocal)}</strong></span>
            {status.estimatedArrivalLocal && (
              <span>
                Estimated: <strong className={delay && delay > 5 ? "text-amber-600" : "text-green-700"}>{fmtTime(status.estimatedArrivalLocal)}</strong>
              </span>
            )}
          </div>
          {delay != null && delay > 5 && (
            <p className="text-amber-600 font-medium">⚠ Running ~{delay} min late</p>
          )}
          {delay != null && delay <= 5 && delay >= -5 && (
            <p className="text-green-700 font-medium">On time</p>
          )}
          <p className="text-slate-300 text-[10px] pt-1">Updated {new Date(status.fetchedAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · auto-refreshes</p>
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};


// ─── Login ────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) { onLogin(); }
    else { setError("Incorrect password."); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Admin Login</h1>
        <p className="text-slate-500 text-sm mb-6">Traveler Shuttles and Tours</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 bg-white text-slate-800"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1B3A6B] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#224889] transition disabled:opacity-60">
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Admin calendar ───────────────────────────────────────────────────────────

function AdminCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  const month = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

  const load = useCallback(async () => {
    const res = await fetch(`/api/availability?month=${month}`);
    const data = await res.json();
    setUnavailable(new Set(data.busyDates ?? []));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (dateStr: string) => {
    setSaving(dateStr);
    const isBlocked = unavailable.has(dateStr);
    await fetch("/api/admin/availability", {
      method: isBlocked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    });
    await load();
    setSaving(null);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = viewDate.getDay();
  const todayStr = today.toISOString().slice(0, 10);
  const monthLabel = viewDate.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <CalendarDays size={18} className="text-[#1B3A6B]" /> Block Dates / Time Off
      </h2>
      <p className="text-slate-500 text-xs mb-4">Tap any day to block it (e.g. your days off) — blocked days can&apos;t be booked by clients. Tap again to unblock.</p>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600">‹</button>
        <span className="font-semibold text-slate-800 text-sm">{monthLabel}</span>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isPast = dateStr < todayStr;
          const isBlocked = unavailable.has(dateStr);
          const isSaving = saving === dateStr;

          return (
            <button key={dateStr} disabled={isPast || isSaving} onClick={() => toggle(dateStr)}
              title={isBlocked ? "Click to unblock" : "Click to block"}
              className={`aspect-square rounded-lg text-xs font-medium transition-all relative
                ${isPast ? "text-slate-200 cursor-default" :
                  isSaving ? "opacity-50 cursor-wait" :
                  isBlocked ? "bg-red-100 text-red-500 hover:bg-red-200" :
                  "bg-[#1B4D2E]/10 text-[#1B4D2E] hover:bg-red-50 hover:text-red-400"}`}
            >{d}</button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1B4D2E]/20 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Blocked</span>
      </div>
    </div>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onUpdate, defaultExpanded, onSelectCustomer }: { booking: Booking; onUpdate: () => void; defaultExpanded?: boolean; onSelectCustomer?: (email: string) => void }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [loading, setLoading]   = useState(false);
  const [finalPrice, setFinalPrice] = useState<string>(booking.fare_zar != null ? String(booking.fare_zar) : "");
  const [priceSaved, setPriceSaved] = useState(false);

  // Reschedule editor state (pickup date/time + optional drop-off time).
  const [rDate, setRDate]       = useState(booking.preferred_date ?? "");
  const [rPickup, setRPickup]   = useState(booking.preferred_time_window ?? "");
  const [rDropoff, setRDropoff] = useState(booking.dropoff_time ?? "");
  const [reschedMsg, setReschedMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [reschedLoading, setReschedLoading] = useState(false);

  const act = async (action: "confirm" | "cancel" | "update_price") => {
    setLoading(true);
    setPriceSaved(false);
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        finalPrice: (action === "confirm" || action === "update_price") && finalPrice ? Number(finalPrice) : undefined,
      }),
    });
    setLoading(false);
    if (action === "update_price") { setPriceSaved(true); setTimeout(() => setPriceSaved(false), 4000); }
    onUpdate();
  };

  const saveReschedule = async () => {
    setReschedMsg(null);
    setReschedLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", preferredDate: rDate, pickupTime: rPickup, dropoffTime: rDropoff || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setReschedMsg({ ok: false, text: data.error ?? "Couldn't save the new time." }); return; }
      setReschedMsg({ ok: true, text: booking.status === "confirmed" ? "Saved — calendar updated and client notified." : "Saved — calendar updated." });
      onUpdate();
    } catch {
      setReschedMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setReschedLoading(false);
    }
  };

  const ref = booking.id.slice(0, 8).toUpperCase();
  const fare = booking.fare_zar ? `R ${booking.fare_zar.toLocaleString("en-ZA")}` : "Custom quote";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {onSelectCustomer && booking.client_email ? (
              <button onClick={() => onSelectCustomer(booking.client_email)}
                className="font-bold text-slate-900 hover:text-[#1B3A6B] hover:underline transition" title="View this customer's bookings">
                {booking.client_name}
              </button>
            ) : (
              <span className="font-bold text-slate-900">{booking.client_name}</span>
            )}
            {booking.company_name && (
              <span className="flex items-center gap-1 bg-[#1B3A6B]/10 text-[#1B3A6B] px-1.5 py-0.5 rounded text-xs font-medium"><Building2 size={10} />{booking.company_name}</span>
            )}
            <span className="text-xs font-mono text-slate-400">#{ref}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {booking.preferred_date && (
              <span className="flex items-center gap-1"><CalendarDays size={11} />{booking.preferred_date}</span>
            )}
            {booking.preferred_time_window && (
              <span className="flex items-center gap-1"><Clock size={11} />{formatPickupTime(booking.preferred_time_window)}{booking.dropoff_time && ` – ${formatPickupTime(booking.dropoff_time)}`}</span>
            )}
            <span className="flex items-center gap-1"><Users size={11} />{booking.passengers} pax</span>
            {booking.flight_number && (
              <span className="flex items-center gap-1 bg-[#1B3A6B]/10 text-[#1B3A6B] px-1.5 py-0.5 rounded text-xs font-semibold"><Plane size={10} />{booking.flight_number}</span>
            )}
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs font-medium">{booking.customer_tier}</span>
            <span className="font-semibold text-slate-700">{fare}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600 transition p-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
            <div className="flex items-start gap-2 text-slate-600">
              <Mail size={13} className="mt-0.5 shrink-0 text-slate-400" />{booking.client_email}
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <Phone size={13} className="mt-0.5 shrink-0 text-slate-400" />{booking.client_cell}
            </div>
            <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
              <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
              <span><strong>From:</strong> {booking.pickup_address}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 sm:col-span-2">
              <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
              <span><strong>To:</strong> {booking.dropoff_address}</span>
            </div>
            <div className="text-slate-500 text-xs">{booking.distance_km} km · {booking.trip_type.replace(/_/g, " ")} · {booking.pricing_band}</div>
          </div>

          {booking.flight_number && (
            <div className="mb-4">
              <FlightTracker flightNumber={booking.flight_number} date={booking.preferred_date} />
            </div>
          )}

          {/* Reschedule pickup / drop-off times → pushes to the calendar on save */}
          {booking.status !== "cancelled" && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2.5 flex items-center gap-1.5">
                <CalendarClock size={13} className="text-[#1B3A6B]" /> Reschedule times
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Date</label>
                  <input type="date" value={rDate} onChange={e => { setRDate(e.target.value); setReschedMsg(null); }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Pickup time</label>
                  <input type="time" value={rPickup} min={PICKUP_MIN} max={PICKUP_MAX} step={900} onChange={e => { setRPickup(e.target.value); setReschedMsg(null); }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Drop-off time <span className="text-slate-300">(opt)</span></label>
                  <input type="time" value={rDropoff} min={PICKUP_MIN} max={PICKUP_MAX} step={900} onChange={e => { setRDropoff(e.target.value); setReschedMsg(null); }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={saveReschedule} disabled={reschedLoading || !rDate || !rPickup}
                  className="py-2 px-4 rounded-lg bg-[#1B3A6B] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#224889] transition disabled:opacity-50">
                  {reschedLoading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Save &amp; update calendar</>}
                </button>
                {reschedMsg && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${reschedMsg.ok ? "text-green-600" : "text-red-500"}`}>
                    {reschedMsg.ok ? <Check size={12} /> : <X size={12} />}{reschedMsg.text}
                  </span>
                )}
              </div>
            </div>
          )}

          {booking.status === "pending" && (
            <div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Final price (R)</label>
                <div className="relative max-w-[220px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">R</span>
                  <input
                    type="number" min="0" step="1" inputMode="numeric"
                    value={finalPrice}
                    onChange={e => setFinalPrice(e.target.value)}
                    placeholder="Enter final price"
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1B4D2E] focus:ring-2 focus:ring-[#1B4D2E]/10"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated fare: {booking.fare_zar != null ? `R ${booking.fare_zar.toLocaleString("en-ZA")}` : "—"}. Adjust to the final price the client will be charged.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => act("confirm")} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#246038] transition disabled:opacity-60">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Confirm with this price</>}
                </button>
                <button onClick={() => act("cancel")} disabled={loading}
                  className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition disabled:opacity-60">
                  <X size={13} /> Decline
                </button>
              </div>
            </div>
          )}

          {booking.status === "confirmed" && (
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Change price (R)</label>
              <div className="flex gap-2 items-start">
                <div className="relative max-w-[180px] flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">R</span>
                  <input
                    type="number" min="0" step="1" inputMode="numeric"
                    value={finalPrice}
                    onChange={e => setFinalPrice(e.target.value)}
                    placeholder="New price"
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                  />
                </div>
                <button onClick={() => act("update_price")} disabled={loading || !finalPrice}
                  className="py-2.5 px-4 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#224889] transition disabled:opacity-60">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <><Mail size={13} /> Update price &amp; notify client</>}
                </button>
              </div>
              {priceSaved && (
                <p className="text-green-600 text-xs font-medium mt-2 flex items-center gap-1"><Check size={12} /> Price updated — the client has been emailed the new fare.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Manual booking modal ─────────────────────────────────────────────────────

const TRIP_OPTIONS: { value: string; label: string }[] = [
  { value: "to_airport", label: "To Airport" },
  { value: "from_airport", label: "From Airport" },
  { value: "point_to_point", label: "Point-to-point" },
];

function NewBookingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({
    clientName: "", companyName: "", clientEmail: "", clientCell: "",
    pickupAddress: "", dropoffAddress: "",
    passengers: "1", tripType: "point_to_point", customerTier: "General" as CustomerTier,
    preferredDate: "", pickupTime: "", dropoffTime: "",
    fareZar: "", flightNumber: "", status: "confirmed" as BookingStatus,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF(prev => ({ ...prev, [k]: v }));

  const inp = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10";
  const lbl = "block text-[11px] font-medium text-slate-500 mb-1";

  const submit = async () => {
    setError(null);
    if (!f.clientName.trim()) { setError("Client name is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Could not save the booking."); return; }
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Plus size={18} className="text-[#1B3A6B]" /> New booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Client name *</label><input className={inp} value={f.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Jane Smith" /></div>
            <div><label className={lbl}>Company (optional)</label><input className={inp} value={f.companyName} onChange={e => set("companyName", e.target.value)} placeholder="Acme Corp" /></div>
            <div><label className={lbl}>Email</label><input className={inp} type="email" value={f.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="jane@example.com" /></div>
            <div><label className={lbl}>Cell</label><input className={inp} type="tel" value={f.clientCell} onChange={e => set("clientCell", e.target.value)} placeholder="+27 82 123 4567" /></div>
          </div>
          <div><label className={lbl}>Pickup address</label><input className={inp} value={f.pickupAddress} onChange={e => set("pickupAddress", e.target.value)} placeholder="Pickup" /></div>
          <div><label className={lbl}>Drop-off address</label><input className={inp} value={f.dropoffAddress} onChange={e => set("dropoffAddress", e.target.value)} placeholder="Drop-off" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>Passengers</label><input className={inp} type="number" min="1" value={f.passengers} onChange={e => set("passengers", e.target.value)} /></div>
            <div>
              <label className={lbl}>Trip type</label>
              <select className={inp} value={f.tripType} onChange={e => set("tripType", e.target.value)}>
                {TRIP_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Customer type</label>
              <select className={inp} value={f.customerTier} onChange={e => set("customerTier", e.target.value)}>
                {(Object.keys(TIER_LABELS) as CustomerTier[]).map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>Date</label><input className={inp} type="date" value={f.preferredDate} onChange={e => set("preferredDate", e.target.value)} /></div>
            <div><label className={lbl}>Pickup time</label><input className={inp} type="time" min={PICKUP_MIN} max={PICKUP_MAX} step={900} value={f.pickupTime} onChange={e => set("pickupTime", e.target.value)} /></div>
            <div><label className={lbl}>Drop-off time</label><input className={inp} type="time" min={PICKUP_MIN} max={PICKUP_MAX} step={900} value={f.dropoffTime} onChange={e => set("dropoffTime", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>Fare (R)</label><input className={inp} type="number" min="0" value={f.fareZar} onChange={e => set("fareZar", e.target.value)} placeholder="e.g. 350" /></div>
            <div><label className={lbl}>Flight no.</label><input className={inp} value={f.flightNumber} onChange={e => set("flightNumber", e.target.value.toUpperCase())} placeholder="BA349" /></div>
            <div>
              <label className={lbl}>Status</label>
              <select className={inp} value={f.status} onChange={e => set("status", e.target.value)}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={submit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#246038] transition disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Create booking</>}
            </button>
            <button onClick={onClose} className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition">Cancel</button>
          </div>
          {f.status === "confirmed" && <p className="text-[11px] text-slate-400">A confirmed booking with a date &amp; time is added to your calendar.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ bookings, loading, reload }: { bookings: Booking[]; loading: boolean; reload: () => void }) {
  const [tab, setTab]             = useState<"overview" | "finance" | "bookings">("overview");
  const [filter, setFilter]       = useState<"all" | BookingStatus>("all");
  const [highlight, setHighlight] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [showNew, setShowNew]     = useState(false);

  // Deep link from the driver email: /admin?booking=<id> opens that booking expanded on the bookings tab.
  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get("booking");
    if (b) { setHighlight(b); setTab("bookings"); }
  }, []);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  // Jump from an overview card/row straight to that booking, expanded.
  const openBooking = (id: string) => {
    setHighlight(id);
    setFilter("all");
    setTab("bookings");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToBookings = (f: "all" | BookingStatus) => {
    setFilter(f);
    setTab("bookings");
  };

  const selectCustomer = (email: string) => {
    setCustomerEmail(email);
    setSearch("");
    setFilter("all");
    setTab("bookings");
  };

  // Search across name / email / phone / company, or focus one customer by email.
  const q = search.trim().toLowerCase();
  let list = bookings;
  if (customerEmail) {
    list = list.filter(b => (b.client_email ?? "").toLowerCase() === customerEmail.toLowerCase());
  } else if (q) {
    list = list.filter(b =>
      [b.client_name, b.client_email, b.client_cell, b.company_name]
        .some(v => (v ?? "").toLowerCase().includes(q)));
  }
  const filtered = filter === "all" ? list : list.filter(b => b.status === filter);
  const pending  = bookings.filter(b => b.status === "pending").length;

  // Summary for the focused customer.
  const customer = customerEmail ? bookings.filter(b => (b.client_email ?? "").toLowerCase() === customerEmail.toLowerCase()) : [];
  const customerName = customer[0]?.client_name ?? customerEmail ?? "";
  const customerCompany = customer.find(b => b.company_name)?.company_name ?? null;
  const customerSpent = customer.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.fare_zar ?? 0), 0);

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { key: "finance" as const, label: "Finance", icon: Wallet },
    { key: "bookings" as const, label: "Bookings", icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header style={{ background: "linear-gradient(90deg, #133820, #132950)" }} className="px-6 pt-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Traveler Shuttles Admin</p>
              <p className="text-white/50 text-xs">Operations Dashboard</p>
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition">
              <LogOut size={13} /> Sign out
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 -mb-px">
            {TABS.map(t => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition
                    ${active ? "bg-slate-50 text-[#1B3A6B]" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                  <t.icon size={14} /> {t.label}
                  {t.key === "bookings" && pending > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-amber-100 text-amber-700" : "bg-amber-400/90 text-[#133820]"}`}>{pending}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-24 text-slate-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : tab === "overview" ? (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AdminOverview bookings={bookings} onOpenBooking={openBooking} onGoToBookings={goToBookings} />
        </div>
      ) : tab === "finance" ? (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AdminFinance bookings={bookings} onOpenBooking={openBooking} />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                Bookings
                {pending > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending} pending</span>
                )}
              </h2>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4D2E] text-white text-xs font-bold hover:bg-[#246038] transition">
                <Plus size={14} /> New booking
              </button>
            </div>

            {/* Search + status filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCustomerEmail(null); }}
                  placeholder="Search name, email, phone or company…"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
                      ${filter === s ? "bg-[#1B3A6B] text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Focused-customer banner */}
            {customerEmail && (
              <div className="mb-4 rounded-xl border border-[#1B3A6B]/20 bg-[#1B3A6B]/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                      {customerName}
                      {customerCompany && <span className="flex items-center gap-1 bg-[#1B3A6B]/10 text-[#1B3A6B] px-1.5 py-0.5 rounded text-xs font-medium"><Building2 size={10} />{customerCompany}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 break-all">{customerEmail}{customer[0]?.client_cell ? ` · ${customer[0].client_cell}` : ""}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong className="text-slate-700">{customer.length}</strong> booking{customer.length !== 1 ? "s" : ""} · <strong className="text-slate-700">R {customerSpent.toLocaleString("en-ZA")}</strong> confirmed
                    </p>
                  </div>
                  <button onClick={() => setCustomerEmail(null)}
                    className="flex items-center gap-1 text-xs text-[#1B3A6B] font-medium hover:underline whitespace-nowrap">
                    <ArrowLeft size={12} /> All bookings
                  </button>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                {search || customerEmail ? "No bookings match." : `No ${filter !== "all" ? filter : ""} bookings yet.`}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(b => <BookingCard key={b.id} booking={b} onUpdate={reload} onSelectCustomer={selectCustomer} defaultExpanded={highlight != null && (b.id === highlight || b.id.startsWith(highlight.toLowerCase()))} />)}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="sticky top-24">
            <AdminCalendar />
          </div>
        </div>
      )}

      {showNew && <NewBookingModal onClose={() => setShowNew(false)} onCreated={reload} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]   = useState<boolean | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Single fetch: it both proves the session (401 → login) and loads the data,
  // so the admin panel makes ONE round-trip on load instead of two.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setAuthed(true);
    } catch {
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (authed === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <Loader2 size={24} className="animate-spin text-white" />
    </div>
  );

  if (!authed) return <LoginForm onLogin={load} />;
  return <Dashboard bookings={bookings} loading={loading} reload={load} />;
}
