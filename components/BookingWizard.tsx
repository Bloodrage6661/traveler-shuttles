"use client";

import { useState } from "react";
import { Plane, Car, Users, Phone, Mail, User, ChevronRight, Check, Loader2, Clock } from "lucide-react";
import { formatRand, applyWeekendSurcharge, isWeekendDate, WEEKEND_SURCHARGE, BAND_LABELS, TIER_LABELS, TIER_DESCRIPTIONS, type PricingBand, type CustomerTier } from "@/lib/pricing";
import { useAuth } from "@/lib/auth";
import AddressAutocomplete, { type SelectedPlace } from "@/components/AddressAutocomplete";

type TripType = "to_airport" | "from_airport" | "point_to_point";
type TimeWindow = "morning" | "midday" | "afternoon" | "evening";
type Step = "details" | "price" | "calendar" | "submitted";

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  to_airport:     "To Airport",
  from_airport:   "From Airport",
  point_to_point: "Point-to-point",
};

const TIME_WINDOWS: { value: TimeWindow; label: string; sub: string }[] = [
  { value: "morning",   label: "Morning",   sub: "6am – 10am" },
  { value: "midday",    label: "Midday",    sub: "10am – 2pm" },
  { value: "afternoon", label: "Afternoon", sub: "2pm – 6pm" },
  { value: "evening",   label: "Evening",   sub: "6pm – 10pm" },
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}</label>;
}

function Field({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 ${Icon ? "pl-9" : ""}`}
      />
    </div>
  );
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
      ${done ? "bg-[#1B4D2E] text-white" : active ? "bg-[#1B3A6B] text-white" : "bg-slate-200 text-slate-400"}`}>
      {done ? <Check size={14} /> : n}
    </div>
  );
}

function AvailabilityCalendar({ selectedDate, onSelect }: {
  selectedDate: string | null;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const month = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

  const loadMonth = async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?month=${m}`);
      const data = await res.json();
      setBusyDates(new Set(data.busyDates ?? []));
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(next);
    const m = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    loadMonth(m);
  };

  useState(() => { loadMonth(month); });

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = viewDate.getDay();
  const todayStr = today.toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} disabled={month <= currentMonthStr}
          className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 disabled:opacity-30">‹</button>
        <span className="font-semibold text-slate-800 text-sm">
          {viewDate.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600">›</button>
      </div>

      {loading && <p className="text-center text-slate-400 text-xs py-2">Loading…</p>}

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isPast = dateStr < todayStr;
          const isBusy = busyDates.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const disabled = isPast || isBusy;
          return (
            <button key={dateStr} disabled={disabled} onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-lg text-sm font-medium transition-all
                ${isSelected ? "bg-[#1B3A6B] text-white ring-2 ring-[#1B3A6B] ring-offset-1" :
                  isBusy ? "bg-slate-100 text-slate-300 cursor-not-allowed" :
                  isPast ? "text-slate-200 cursor-not-allowed" :
                  "bg-[#1B4D2E]/10 text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white"}`}
            >{d}</button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1B4D2E]/20 inline-block" />Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 inline-block" />Unavailable</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1B3A6B] inline-block" />Selected</span>
      </div>
    </div>
  );
}

export default function BookingWizard() {
  const { user } = useAuth();
  const [step, setStep]       = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Pre-fill from auth or sessionStorage
  const getPrefill = (key: string) => {
    if (typeof window === "undefined") return "";
    const val = sessionStorage.getItem(key) ?? "";
    if (val) sessionStorage.removeItem(key);
    return val;
  };

  // Step 1 — pre-fill from logged-in user or sessionStorage
  const [firstName, setFirstName] = useState(() => {
    const authName = typeof window !== "undefined" ? "" : "";
    const sessName = getPrefill("prefill_name");
    const full = sessName || authName;
    return full.split(" ")[0] ?? "";
  });
  const [lastName, setLastName] = useState(() => {
    const sessName = getPrefill("prefill_name");
    return sessName.split(" ").slice(1).join(" ") ?? "";
  });
  const [email, setEmail] = useState(() => getPrefill("prefill_email"));
  const [cell,         setCell]         = useState("");
  const [pickup,       setPickup]       = useState("");
  const [dropoff,      setDropoff]      = useState("");
  const [passengers,   setPassengers]   = useState(1);
  const [tripType,     setTripType]     = useState<TripType>("to_airport");
  const [customerTier, setCustomerTier] = useState<CustomerTier>("General");

  // Coordinates captured when an autocomplete suggestion is chosen
  const [pickupCoords,  setPickupCoords]  = useState<SelectedPlace | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<SelectedPlace | null>(null);

  // Step 2 — distance computed by Geoapify routing
  const [band, setBand] = useState<PricingBand | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [fare, setFare] = useState<number | null>(null);

  // Step 3
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeWindow,   setTimeWindow]   = useState<TimeWindow | null>(null);

  // Result
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Weekend (Sat/Sun) trips get a surcharge once a date is chosen.
  const weekendApplies = selectedDate ? isWeekendDate(selectedDate) : false;
  const finalFare = applyWeekendSurcharge(fare, selectedDate);

  const stepIndex: Record<Step, number> = { details: 0, price: 1, calendar: 2, submitted: 3 };
  const currentStep = stepIndex[step];

  const goToFare = async () => {
    setError(null);
    if (!firstName || !lastName || !email || !cell || !pickup || !dropoff) {
      setError("Please fill in all fields.");
      return;
    }
    if (!pickupCoords || !dropoffCoords) {
      setError("Please pick both addresses from the suggestions list so we can measure the distance.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/calculate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { lat: pickupCoords.lat, lon: pickupCoords.lon },
          dropoff: { lat: dropoffCoords.lat, lon: dropoffCoords.lon },
          passengers,
          customerTier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not calculate your fare");
      setDistanceKm(data.distanceKm);
      setBand(data.band);
      setFare(data.fare);
      setStep("price");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not calculate your fare");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selectedDate || !timeWindow) { setError("Please select a date and time window."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: `${firstName} ${lastName}`,
          clientEmail: email,
          clientCell: cell,
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          distanceKm: distanceKm ?? 0,
          passengers,
          tripType,
          customerTier,
          userId: user?.id ?? null,
          pricingBand: band,
          fareZar: finalFare,
          preferredDate: selectedDate,
          preferredTimeWindow: timeWindow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setBookingRef(data.ref);
      setStep("submitted");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: `${firstName} ${lastName}`,
          clientEmail: email,
          clientCell: cell,
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          distanceKm: distanceKm ?? 0,
          passengers,
          tripType,
          userId: user?.id ?? null,
          customerTier,
          pricingBand: "custom",
          fareZar: null,
          preferredDate: null,
          preferredTimeWindow: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setBookingRef(data.ref);
      setStep("submitted");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#1B4D2E]/10 text-[#1B4D2E] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
          <Plane size={12} /> Airport Transfer Booking
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Your Transfer</h1>
        <p className="text-slate-500 text-sm">Fill in your details and we&apos;ll confirm your fare.</p>
      </div>

      {step !== "submitted" && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Your Details", "Fare", "Date & Time"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <StepDot n={i + 1} active={currentStep === i} done={currentStep > i} />
                <span className={`text-xs mt-1 ${currentStep === i ? "text-[#1B3A6B] font-medium" : "text-slate-400"}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-10 h-0.5 mb-4 ${currentStep > i ? "bg-[#1B4D2E]" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">

        {/* ── Step 1: Details ── */}
        {step === "details" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg mb-4">Your Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Field icon={User} placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><Label>Last name</Label><Field placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            </div>
            <div><Label>Email address</Label><Field icon={Mail} type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Cell number</Label><Field icon={Phone} type="tel" placeholder="+27 82 123 4567" value={cell} onChange={e => setCell(e.target.value)} /></div>
            <div>
              <Label>Pickup address</Label>
              <AddressAutocomplete
                value={pickup}
                onChange={v => { setPickup(v); setPickupCoords(null); }}
                onSelect={p => { setPickup(p.address); setPickupCoords(p); }}
                placeholder="Start typing an address…"
              />
            </div>
            <div>
              <Label>Drop-off address</Label>
              <AddressAutocomplete
                value={dropoff}
                onChange={v => { setDropoff(v); setDropoffCoords(null); }}
                onSelect={p => { setDropoff(p.address); setDropoffCoords(p); }}
                placeholder="Start typing an address…"
              />
            </div>
            <div>
              <Label>Number of passengers</Label>
              <div className="flex gap-3">
                {[1,2,3].map(n => (
                  <button key={n} onClick={() => setPassengers(n)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition
                      ${passengers === n ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "border-slate-200 text-slate-600 hover:border-[#1B3A6B]"}`}>
                    <Users size={14} className="inline mr-1" />{n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Trip type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(TRIP_TYPE_LABELS) as [TripType, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setTripType(val)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition
                      ${tripType === val ? "bg-[#1B4D2E] text-white border-[#1B4D2E]" : "border-slate-200 text-slate-600 hover:border-[#1B4D2E]"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Customer type</Label>
              <div className="space-y-2">
                {(Object.keys(TIER_LABELS) as CustomerTier[]).map(tier => (
                  <button key={tier} onClick={() => setCustomerTier(tier)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between
                      ${customerTier === tier ? "border-[#1B3A6B] bg-[#1B3A6B]/5 ring-2 ring-[#1B3A6B]/20" : "border-slate-200 hover:border-slate-300"}`}>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{TIER_LABELS[tier]}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{TIER_DESCRIPTIONS[tier]}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition
                      ${customerTier === tier ? "border-[#1B3A6B] bg-[#1B3A6B]" : "border-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={goToFare} disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1B3A6B] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#224889] transition disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><ChevronRight size={16} /> Calculate My Fare</>}
            </button>
          </div>
        )}

        {/* ── Step 2b: Custom quote ── */}
        {step === "price" && band === "custom" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mx-auto mb-4">
              <Car size={28} />
            </div>
            <h2 className="font-semibold text-slate-800 text-xl mb-2">Custom Quote Required</h2>
            <p className="text-slate-500 text-sm mb-2">Your trip is beyond our standard pricing bands.</p>
            <p className="text-slate-500 text-sm mb-8">Submit your details and we&apos;ll get back to you with personalised pricing promptly.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {distanceKm != null && (
              <p className="text-slate-400 text-xs mb-4">Estimated distance: <strong>{distanceKm} km</strong></p>
            )}
            <button onClick={handleQuoteSubmit} disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1B3A6B] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#224889] transition disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Quote Request"}
            </button>
            <button onClick={() => setStep("details")} className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 transition">← Change details</button>
          </div>
        )}

        {/* ── Step 3: Calendar ── */}
        {step === "price" && band !== "custom" && (
          <div>
            {/* Fare summary */}
            <div className="bg-gradient-to-br from-[#1B4D2E] to-[#1B3A6B] rounded-2xl p-5 text-white mb-6">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{BAND_LABELS[band!]} · {passengers} pax · {TIER_LABELS[customerTier]}</p>
              <p className="text-4xl font-bold mb-1">{finalFare ? formatRand(finalFare) : "—"}</p>
              <p className="text-white/60 text-sm">
                Per trip · {TRIP_TYPE_LABELS[tripType]}
                {distanceKm != null && <> · {distanceKm} km</>}
              </p>
              {weekendApplies && fare != null && finalFare != null && (
                <p className="mt-3 inline-flex items-center gap-1.5 bg-[#C9A84C]/25 text-[#F3E4BE] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Clock size={12} /> Includes {Math.round(WEEKEND_SURCHARGE * 100)}% weekend surcharge (base {formatRand(fare)})
                </p>
              )}
            </div>

            <h2 className="font-semibold text-slate-800 text-lg mb-2">Choose a Date</h2>
            <p className="text-slate-500 text-sm mb-5">Green dates are available. Select your preferred day.</p>

            <AvailabilityCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />

            {selectedDate && (
              <div className="mt-5">
                <Label>Preferred time window</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {TIME_WINDOWS.map(w => (
                    <button key={w.value} onClick={() => setTimeWindow(w.value)}
                      className={`p-3 rounded-xl border text-left transition
                        ${timeWindow === w.value ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "border-slate-200 hover:border-[#1B3A6B]"}`}>
                      <div className="flex items-center gap-2">
                        <Clock size={13} />
                        <span className="font-medium text-sm">{w.label}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${timeWindow === w.value ? "text-white/70" : "text-slate-400"}`}>{w.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <button onClick={handleSubmit} disabled={loading || !selectedDate || !timeWindow}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#1B4D2E] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#246038] transition disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Confirm Booking Request</>}
            </button>
            <button onClick={() => setStep("details")} className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 transition">← Change details</button>
          </div>
        )}

        {/* ── Submitted ── */}
        {step === "submitted" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
              <Check size={28} />
            </div>
            <h2 className="font-bold text-slate-900 text-2xl mb-2">
              {band === "custom" ? "Quote Request Sent!" : "Booking Received!"}
            </h2>
            {bookingRef && (
              <div className="inline-block bg-[#F9F5EF] border border-[#C9A84C]/30 rounded-xl px-6 py-3 my-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your reference</p>
                <p className="text-2xl font-bold text-[#1B3A6B]">#{bookingRef}</p>
              </div>
            )}
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              {band === "custom"
                ? "We've received your request and will be in touch with personalised pricing."
                : "We've sent you a confirmation email. The driver will review and confirm your booking shortly."}
            </p>
            <p className="text-slate-400 text-xs mt-4">Keep your reference number handy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
