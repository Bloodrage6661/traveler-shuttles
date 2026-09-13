"use client";

import {
  Wallet, TrendingUp, TrendingDown, CalendarClock, Clock,
  PiggyBank, ArrowRight, Receipt,
} from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface FinanceBooking {
  id: string;
  created_at: string;
  client_name: string;
  trip_type: string;
  customer_tier: string;
  fare_zar: number | null;
  preferred_date: string | null;
  status: BookingStatus;
}

const TRIP_LABELS: Record<string, string> = {
  to_airport: "To Airport",
  from_airport: "From Airport",
  point_to_point: "Point-to-point",
};

const zar = (n: number) => `R ${Math.round(n).toLocaleString("en-ZA")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AdminFinance({
  bookings,
  onOpenBooking,
}: {
  bookings: FinanceBooking[];
  onOpenBooking: (id: string) => void;
}) {
  const now = new Date();
  const today = todayStr();
  const confirmed = bookings.filter((b) => b.status === "confirmed" && b.fare_zar != null);

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);

  const revIn = (mk: string) =>
    confirmed.filter((b) => (b.created_at ?? "").slice(0, 7) === mk).reduce((s, b) => s + (b.fare_zar ?? 0), 0);

  const thisMonthRev = revIn(thisMonth);
  const lastMonthRev = revIn(lastMonth);
  const delta = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : null;

  const pipeline = confirmed
    .filter((b) => (b.preferred_date ?? "") >= today)
    .reduce((s, b) => s + (b.fare_zar ?? 0), 0);

  const outstanding = bookings
    .filter((b) => b.status === "pending")
    .reduce((s, b) => s + (b.fare_zar ?? 0), 0);
  const outstandingCount = bookings.filter((b) => b.status === "pending").length;

  const ytdRev = confirmed
    .filter((b) => (b.created_at ?? "").slice(0, 4) === String(now.getFullYear()))
    .reduce((s, b) => s + (b.fare_zar ?? 0), 0);

  const totalRev = confirmed.reduce((s, b) => s + (b.fare_zar ?? 0), 0);
  const avgFare = confirmed.length ? totalRev / confirmed.length : 0;

  // Last 6 months revenue.
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString("en-ZA", { month: "short" }), value: revIn(monthKey(d)) });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.value));

  // Revenue split by trip type + tier.
  const byGroup = (field: "trip_type" | "customer_tier") =>
    Object.entries(
      confirmed.reduce<Record<string, number>>((acc, b) => {
        const k = b[field] || "—";
        acc[k] = (acc[k] ?? 0) + (b.fare_zar ?? 0);
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);

  const byTrip = byGroup("trip_type");
  const byTier = byGroup("customer_tier");
  const tripMax = Math.max(1, ...byTrip.map(([, v]) => v));
  const tierMax = Math.max(1, ...byTier.map(([, v]) => v));

  const recent = confirmed
    .slice()
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 6);

  const cards = [
    {
      label: "Revenue this month", value: zar(thisMonthRev), icon: Wallet,
      ring: "bg-[#1B4D2E]/10 text-[#1B4D2E]", accent: "text-[#1B4D2E]",
      foot: delta == null
        ? <span className="text-slate-400">{now.toLocaleDateString("en-ZA", { month: "long" })}</span>
        : (
          <span className={`inline-flex items-center gap-1 font-semibold ${delta >= 0 ? "text-[#1B4D2E]" : "text-red-500"}`}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(0)}% vs last month
          </span>
        ),
    },
    {
      label: "Confirmed pipeline", value: zar(pipeline), icon: CalendarClock,
      ring: "bg-[#1B3A6B]/10 text-[#1B3A6B]", accent: "text-[#1B3A6B]",
      foot: <span className="text-slate-400">Upcoming confirmed trips</span>,
    },
    {
      label: "Outstanding", value: zar(outstanding), icon: Clock,
      ring: "bg-amber-50 text-amber-600", accent: "text-amber-600",
      foot: <span className="text-slate-400">{outstandingCount} awaiting confirmation</span>,
    },
    {
      label: "Revenue YTD", value: zar(ytdRev), icon: PiggyBank,
      ring: "bg-[#1B3A6B]/10 text-[#1B3A6B]", accent: "text-[#1B3A6B]",
      foot: <span className="text-slate-400">{now.getFullYear()} confirmed</span>,
    },
    {
      label: "Avg fare", value: avgFare ? zar(avgFare) : "—", icon: Receipt,
      ring: "bg-slate-100 text-slate-600", accent: "text-slate-700",
      foot: <span className="text-slate-400">Per confirmed trip</span>,
    },
    {
      label: "Total confirmed", value: zar(totalRev), icon: Wallet,
      ring: "bg-slate-100 text-slate-600", accent: "text-slate-700",
      foot: <span className="text-slate-400">{confirmed.length} trips, all time</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.ring}`}>
                <c.icon size={17} />
              </span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums ${c.accent}`}>{c.value}</p>
            <p className="text-slate-500 text-xs mt-1">{c.label}</p>
            <p className="text-[11px] mt-0.5">{c.foot}</p>
          </div>
        ))}
      </div>

      {/* Monthly revenue trend */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-[#1B4D2E]" /> Revenue — last 6 months
          </h2>
          <span className="text-xs text-slate-400">{zar(months.reduce((s, m) => s + m.value, 0))} total</span>
        </div>
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-44">
          {months.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex items-end justify-center h-32">
                <div
                  className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-t from-[#1B4D2E] to-[#2f7d4c] relative transition-all group-hover:opacity-90"
                  style={{ height: `${(m.value / maxMonth) * 100}%`, minHeight: m.value > 0 ? "8px" : "3px", opacity: m.value > 0 ? 1 : 0.25 }}
                >
                  {m.value > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                      {m.value >= 1000 ? `R${(m.value / 1000).toFixed(1)}k` : `R${m.value}`}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Revenue by trip type */}
        <section className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm mb-4">
            <Wallet size={16} className="text-[#1B3A6B]" /> Revenue by trip type
          </h2>
          {byTrip.length === 0 ? <Empty /> : (
            <ul className="space-y-3">
              {byTrip.map(([k, v]) => (
                <li key={k}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{TRIP_LABELS[k] ?? k}</span>
                    <span className="text-slate-700 font-semibold tabular-nums">{zar(v)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1B3A6B] to-[#2b5aa0]" style={{ width: `${(v / tripMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Revenue by customer tier */}
        <section className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm mb-4">
            <PiggyBank size={16} className="text-[#C9A84C]" /> Revenue by customer type
          </h2>
          {byTier.length === 0 ? <Empty /> : (
            <ul className="space-y-3">
              {byTier.map(([k, v]) => (
                <li key={k}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium capitalize">{k}</span>
                    <span className="text-slate-700 font-semibold tabular-nums">{zar(v)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1B4D2E] to-[#C9A84C]" style={{ width: `${(v / tierMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent confirmed payments */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm mb-3">
          <Receipt size={16} className="text-[#1B4D2E]" /> Recent confirmed fares
        </h2>
        {recent.length === 0 ? <Empty /> : (
          <ul className="divide-y divide-slate-100">
            {recent.map((b) => (
              <li key={b.id}>
                <button onClick={() => onOpenBooking(b.id)} className="w-full text-left py-3 flex items-center justify-between gap-3 group">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 text-sm">{b.client_name}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {TRIP_LABELS[b.trip_type] ?? b.trip_type} · {new Date(b.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-[#1B4D2E] tabular-nums">{zar(b.fare_zar ?? 0)}</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-[#1B3A6B] transition" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-slate-400">No confirmed revenue yet.</p>;
}
