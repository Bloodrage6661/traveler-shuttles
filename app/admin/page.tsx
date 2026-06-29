"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, Check, X, CalendarDays, Clock, Loader2, Users, MapPin, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  created_at: string;
  client_name: string;
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
  status: BookingStatus;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (6am–10am)",
  midday: "Midday (10am–2pm)",
  afternoon: "Afternoon (2pm–6pm)",
  evening: "Evening (6pm–10pm)",
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
        <CalendarDays size={18} className="text-[#1B3A6B]" /> Availability
      </h2>
      <p className="text-slate-500 text-xs mb-4">Click a date to block or unblock it. Blocked dates won&apos;t be available for booking.</p>

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

function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState(false);

  const act = async (action: "confirm" | "cancel") => {
    setLoading(true);
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    onUpdate();
  };

  const ref = booking.id.slice(0, 8).toUpperCase();
  const fare = booking.fare_zar ? `R ${booking.fare_zar.toLocaleString("en-ZA")}` : "Custom quote";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-slate-900">{booking.client_name}</span>
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
              <span className="flex items-center gap-1"><Clock size={11} />{TIME_LABELS[booking.preferred_time_window]}</span>
            )}
            <span className="flex items-center gap-1"><Users size={11} />{booking.passengers} pax</span>
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

          {booking.status === "pending" && (
            <div className="flex gap-2">
              <button onClick={() => act("confirm")} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#246038] transition disabled:opacity-60">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Accept</>}
              </button>
              <button onClick={() => act("cancel")} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition disabled:opacity-60">
                <X size={13} /> Decline
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | BookingStatus>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bookings");
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const pending  = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header style={{ background: "linear-gradient(90deg, #133820, #132950)" }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">Traveler Shuttles Admin</p>
            <p className="text-white/50 text-xs">Driver Dashboard</p>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              Bookings
              {pending > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending} pending</span>
              )}
            </h2>
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

          {loading ? (
            <div className="text-center py-16 text-slate-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No {filter !== "all" ? filter : ""} bookings yet.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => <BookingCard key={b.id} booking={b} onUpdate={load} />)}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="sticky top-4">
          <AdminCalendar />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(r => setAuthed(r.status !== 401))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <Loader2 size={24} className="animate-spin text-white" />
    </div>
  );

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <Dashboard />;
}
