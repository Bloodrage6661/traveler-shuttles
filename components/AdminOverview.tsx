"use client";

import {
  CalendarDays, Clock, Users, Plane, MapPin, TrendingUp,
  AlertCircle, CheckCircle2, Wallet, CalendarClock, ArrowRight, ArrowUpRight,
} from "lucide-react";
import { formatPickupTime } from "@/lib/time";

type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface OverviewBooking {
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
  flight_number: string | null;
  status: BookingStatus;
}

const TRIP_LABELS: Record<string, string> = {
  to_airport: "To Airport",
  from_airport: "From Airport",
  point_to_point: "Point-to-point",
};

const zar = (n: number) => `R ${Math.round(n).toLocaleString("en-ZA")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AdminOverview({
  bookings,
  onOpenBooking,
  onGoToBookings,
}: {
  bookings: OverviewBooking[];
  onOpenBooking: (id: string) => void;
  onGoToBookings: (filter: "all" | BookingStatus) => void;
}) {
  const today = todayStr();
  const now = new Date();

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const upcoming = confirmed
    .filter((b) => (b.preferred_date ?? "") >= today)
    .sort((a, b) => (a.preferred_date ?? "").localeCompare(b.preferred_date ?? ""));

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = bookings.filter((b) => (b.created_at ?? "").slice(0, 7) === monthKey);

  const revenue = confirmed.reduce((sum, b) => sum + (b.fare_zar ?? 0), 0);
  const faresKnown = confirmed.filter((b) => b.fare_zar != null);
  const avgFare = faresKnown.length ? revenue / faresKnown.length : 0;

  // Bookings created per day, last 14 days.
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString("en-ZA", { day: "numeric" }),
      count: bookings.filter((b) => (b.created_at ?? "").slice(0, 10) === key).length,
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const last14 = days.reduce((s, d) => s + d.count, 0);

  // Trip-type split.
  const tripSplit = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.trip_type] = (acc[b.trip_type] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const tripMax = Math.max(1, ...tripSplit.map(([, n]) => n));

  const cards = [
    {
      label: "Pending", value: pending.length, icon: AlertCircle,
      accent: "text-amber-600", ring: "bg-amber-50 text-amber-600",
      action: pending.length > 0, onClick: () => onGoToBookings("pending"),
      sub: pending.length > 0 ? "Needs your action" : "All caught up",
    },
    {
      label: "Upcoming transfers", value: upcoming.length, icon: CalendarClock,
      accent: "text-[#1B4D2E]", ring: "bg-[#1B4D2E]/10 text-[#1B4D2E]",
      onClick: () => onGoToBookings("confirmed"), sub: "Confirmed, still to come",
    },
    {
      label: "Confirmed revenue", value: zar(revenue), icon: Wallet,
      accent: "text-[#1B3A6B]", ring: "bg-[#1B3A6B]/10 text-[#1B3A6B]",
      onClick: () => onGoToBookings("confirmed"), sub: `${faresKnown.length} priced trips`,
    },
    {
      label: "New this month", value: thisMonth.length, icon: TrendingUp,
      accent: "text-[#1B3A6B]", ring: "bg-[#1B3A6B]/10 text-[#1B3A6B]",
      onClick: () => onGoToBookings("all"), sub: now.toLocaleDateString("en-ZA", { month: "long" }),
    },
    {
      label: "Avg fare", value: avgFare ? zar(avgFare) : "—", icon: Wallet,
      accent: "text-slate-700", ring: "bg-slate-100 text-slate-600",
      onClick: () => onGoToBookings("confirmed"), sub: "Across confirmed trips",
    },
    {
      label: "Total bookings", value: bookings.length, icon: CheckCircle2,
      accent: "text-slate-700", ring: "bg-slate-100 text-slate-600",
      onClick: () => onGoToBookings("all"), sub: `${last14} in last 14 days`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="group text-left bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 transition-all hover:border-[#1B3A6B]/30 hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.ring}`}>
                <c.icon size={17} />
              </span>
              {c.action ? (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Action
                </span>
              ) : (
                <ArrowUpRight size={15} className="text-slate-300 group-hover:text-[#1B3A6B] transition" />
              )}
            </div>
            <p className={`text-2xl font-bold tabular-nums ${c.accent}`}>{c.value}</p>
            <p className="text-slate-500 text-xs mt-1">{c.label}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{c.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Needs attention */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <AlertCircle size={16} className="text-amber-500" /> Needs attention
              {pending.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </h2>
            {pending.length > 0 && (
              <button onClick={() => onGoToBookings("pending")} className="text-xs text-[#1B3A6B] font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            )}
          </div>
          {pending.length === 0 ? (
            <Empty icon={CheckCircle2} text="No pending bookings — you're all caught up." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.slice(0, 6).map((b) => (
                <li key={b.id}>
                  <button onClick={() => onOpenBooking(b.id)} className="w-full text-left py-3 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm truncate">{b.client_name}</span>
                        <span className="text-[11px] font-mono text-slate-400">#{b.id.slice(0, 8).toUpperCase()}</span>
                        {b.flight_number && (
                          <span className="flex items-center gap-1 bg-[#1B3A6B]/10 text-[#1B3A6B] px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            <Plane size={9} />{b.flight_number}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                        {b.preferred_date && <span className="flex items-center gap-1"><CalendarDays size={10} />{b.preferred_date}</span>}
                        {b.preferred_time_window && <span className="flex items-center gap-1"><Clock size={10} />{formatPickupTime(b.preferred_time_window)}</span>}
                        <span className="flex items-center gap-1"><Users size={10} />{b.passengers}</span>
                        <span>{TRIP_LABELS[b.trip_type] ?? b.trip_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-700">
                        {b.fare_zar != null ? zar(b.fare_zar) : "Quote"}
                      </span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-[#1B3A6B] transition" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Next transfers */}
        <section className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <CalendarClock size={16} className="text-[#1B4D2E]" /> Next transfers
            </h2>
            {upcoming.length > 0 && (
              <button onClick={() => onGoToBookings("confirmed")} className="text-xs text-[#1B3A6B] font-medium hover:underline flex items-center gap-1">
                All <ArrowRight size={12} />
              </button>
            )}
          </div>
          {upcoming.length === 0 ? (
            <Empty icon={Plane} text="No upcoming confirmed transfers." />
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <button onClick={() => onOpenBooking(b.id)} className="w-full text-left rounded-xl bg-[#1B4D2E]/[0.04] border border-[#1B4D2E]/10 p-3 hover:border-[#1B4D2E]/25 transition group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-sm truncate">{b.client_name}</span>
                      <span className="text-[11px] font-semibold text-[#1B4D2E] whitespace-nowrap">
                        {b.preferred_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 min-w-0">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{b.pickup_address}</span>
                      <ArrowRight size={9} className="shrink-0 text-slate-300" />
                      <span className="truncate">{b.dropoff_address}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-2">
                        {b.preferred_time_window && <span className="flex items-center gap-1"><Clock size={10} />{formatPickupTime(b.preferred_time_window)}</span>}
                        <span className="flex items-center gap-1"><Users size={10} />{b.passengers}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{b.fare_zar != null ? zar(b.fare_zar) : "—"}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Bookings last 14 days */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-[#1B3A6B]" /> Bookings — last 14 days
            </h2>
            <span className="text-xs text-slate-400">{last14} total</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-[#1B3A6B] to-[#2b5aa0] relative transition-all group-hover:opacity-80"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "6px" : "2px", opacity: d.count > 0 ? 1 : 0.25 }}
                  >
                    {d.count > 0 && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-500">{d.count}</span>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trip type split */}
        <section className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm mb-4">
            <MapPin size={16} className="text-[#C9A84C]" /> Trip types
          </h2>
          {tripSplit.length === 0 ? (
            <Empty icon={MapPin} text="No bookings yet." />
          ) : (
            <ul className="space-y-3">
              {tripSplit.map(([type, n]) => (
                <li key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{TRIP_LABELS[type] ?? type}</span>
                    <span className="text-slate-400 tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1B4D2E] to-[#1B3A6B]" style={{ width: `${(n / tripMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="py-8 text-center">
      <Icon size={26} className="text-slate-200 mx-auto mb-2" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}
