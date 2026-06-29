"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plane, CalendarDays, Clock, MapPin, Users, LogOut,
  ChevronDown, ChevronUp, ArrowRight, Loader2, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type BookingStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  created_at: string;
  client_name: string;
  pickup_address: string;
  dropoff_address: string;
  passengers: number;
  trip_type: string;
  customer_tier: string;
  pricing_band: string;
  fare_zar: number | null;
  preferred_date: string | null;
  preferred_time_window: string | null;
  status: BookingStatus;
}

const STATUS_CONFIG: Record<BookingStatus, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:   { icon: AlertCircle,  label: "Awaiting confirmation", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  confirmed: { icon: CheckCircle2, label: "Confirmed",             color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  cancelled: { icon: XCircle,      label: "Cancelled",             color: "text-red-600",    bg: "bg-red-50 border-red-200" },
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (6am–10am)",
  midday: "Midday (10am–2pm)",
  afternoon: "Afternoon (2pm–6pm)",
  evening: "Evening (6pm–10pm)",
};

const TRIP_LABELS: Record<string, string> = {
  to_airport: "To Airport",
  from_airport: "From Airport",
  point_to_point: "Point-to-point",
};

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false);
  const ref = booking.id.slice(0, 8).toUpperCase();
  const { icon: Icon, label, color, bg } = STATUS_CONFIG[booking.status];
  const fare = booking.fare_zar ? `R ${booking.fare_zar.toLocaleString("en-ZA")}` : "Custom quote";
  const isUpcoming = booking.status === "confirmed" && booking.preferred_date
    ? booking.preferred_date >= new Date().toISOString().slice(0, 10)
    : false;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isUpcoming ? "border-[#1B4D2E]/30" : "border-slate-100"}`}>
      {isUpcoming && (
        <div className="bg-[#1B4D2E] px-5 py-1.5 flex items-center gap-2">
          <Plane size={12} className="text-white/70" />
          <span className="text-white text-xs font-semibold">Upcoming transfer</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm font-mono">#{ref}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${bg} ${color}`}>
                <Icon size={11} aria-hidden="true" /> {label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {booking.preferred_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={11} aria-hidden="true" /> {booking.preferred_date}
                </span>
              )}
              {booking.preferred_time_window && (
                <span className="flex items-center gap-1.5">
                  <Clock size={11} aria-hidden="true" /> {TIME_LABELS[booking.preferred_time_window]}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={11} aria-hidden="true" /> {booking.passengers} passenger{booking.passengers > 1 ? "s" : ""}
              </span>
              <span className="font-semibold text-slate-700">{fare}</span>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0" aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-sm">
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
              <span><strong>From:</strong> {booking.pickup_address}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
              <span><strong>To:</strong> {booking.dropoff_address}</span>
            </div>
            <div className="flex gap-6 text-xs text-slate-500 pt-1">
              <span>{TRIP_LABELS[booking.trip_type] ?? booking.trip_type}</span>
              <span>{booking.customer_tier}</span>
              <span>{booking.pricing_band} band</span>
            </div>
            <div className="text-xs text-slate-400 pt-1">
              Booked {new Date(booking.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "upcoming" | "past">("all");

  const load = useCallback(async () => {
    const sb = getSupabaseBrowser();
    const { data: { user: u } } = await sb.auth.getUser();

    if (!u) { router.push("/login"); return; }
    setUser(u);

    const { data } = await sb
      .from("bookings")
      .select("*")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });

    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const logout = async () => {
    await getSupabaseBrowser().auth.signOut();
    router.push("/");
  };

  const today = new Date().toISOString().slice(0, 10);

  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return b.status === "confirmed" && (b.preferred_date ?? "") >= today;
    if (filter === "past")     return b.status === "cancelled" || (b.preferred_date ?? "") < today;
    return true;
  });

  const upcomingCount = bookings.filter(b => b.status === "confirmed" && (b.preferred_date ?? "") >= today).length;
  const pendingCount  = bookings.filter(b => b.status === "pending").length;
  const firstName     = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
        <Loader2 size={28} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header style={{ background: "linear-gradient(90deg, #133820, #132950)" }} className="px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Plane size={15} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Traveler Shuttles</p>
              <p className="text-white/40 text-[10px] mt-0.5">My Dashboard</p>
            </div>
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Hi {firstName} 👋</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-2xl font-bold text-[#1B3A6B]">{bookings.length}</p>
            <p className="text-slate-500 text-xs mt-1">Total bookings</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-2xl font-bold text-[#1B4D2E]">{upcomingCount}</p>
            <p className="text-slate-500 text-xs mt-1">Upcoming</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className={`text-2xl font-bold ${pendingCount > 0 ? "text-amber-600" : "text-slate-300"}`}>{pendingCount}</p>
            <p className="text-slate-500 text-xs mt-1">Pending</p>
          </div>
        </div>

        {/* Bookings */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-semibold text-slate-800">Your Trips</h2>
          <div className="flex gap-1">
            {(["all", "upcoming", "past"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? "bg-[#1B3A6B] text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Plane size={36} className="text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-700 mb-2">
              {filter === "all" ? "No bookings yet" : `No ${filter} trips`}
            </p>
            <p className="text-slate-400 text-sm mb-6">
              {filter === "all" ? "Book your first transfer to get started." : "Nothing to show here."}
            </p>
            {filter === "all" && (
              <Link href="/book" className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
                Book a Transfer <ArrowRight size={15} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}

        {/* Book another CTA */}
        {bookings.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-3.5 rounded-full transition-colors text-sm">
              Book Another Transfer <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
