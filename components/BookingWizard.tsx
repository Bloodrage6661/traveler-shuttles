"use client";

import { useState, useEffect } from "react";
import { Plane, Users, Phone, Mail, User, ChevronRight, Check, Loader2, Clock, X, Star } from "lucide-react";
import { formatRand, applyWeekendSurcharge, isWeekendDate, WEEKEND_SURCHARGE, type PricingBand, type CustomerTier } from "@/lib/pricing";
import { PICKUP_MIN, PICKUP_MAX, isPickupTimeInRange } from "@/lib/time";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowser } from "@/lib/supabase";
import AddressAutocomplete, { type SelectedPlace } from "@/components/AddressAutocomplete";

type SlotResult = { available: boolean; message: string };
type Step = "you" | "trip" | "route" | "done";
type Quote = { distanceKm: number; band: PricingBand; fare: number | null; loyalty: boolean };
// A past trip handed over from the dashboard "Book again" button.
type Rebook = { name: string; email: string; cell: string; tier: CustomerTier; passengers: number; pickup: string; dropoff: string; id?: string; date?: string; time?: string };

const STEPS: Step[] = ["you", "trip", "route", "done"];
const STEP_LABELS = ["Your Details", "Trip", "Addresses"];
// Each pane slides in from its own side: left, top, right, then up from below.
const PANE_ANIM: Record<Step, string> = { you: "bw-left", trip: "bw-top", route: "bw-right", done: "bw-up" };

const TIERS: { value: CustomerTier; label: string }[] = [
  { value: "Corporate", label: "Corporate" },
  { value: "Hotel/B&B", label: "Hotel / B&B" },
  { value: "General",   label: "Point to point" },
];

const isAirport = (s: string) => /airport|\bCTIA\b/i.test(s);
const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}</label>;
}

function Field({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input {...props} className={`${inputCls} ${Icon ? "pl-9" : ""}`} />
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

export default function BookingWizard() {
  const { user } = useAuth();
  const [step, setStep]       = useState<Step>("you");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [rebook, setRebook] = useState<Rebook | null>(null);

  // Pane 1 — who
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [cell,  setCell]  = useState("");

  // Pane 2 — trip
  const [customerTier, setCustomerTier] = useState<CustomerTier>("General");
  const [passengers,   setPassengers]   = useState(1);
  const [date,         setDate]         = useState("");
  const [time,         setTime]         = useState("");
  const changingId = rebook?.id; // set when changing an existing booking
  const [slot,         setSlot]         = useState<SlotResult | null>(null);

  // Pane 3 — addresses
  const [pickup,        setPickup]        = useState("");
  const [dropoff,       setDropoff]       = useState("");
  const [pickupCoords,  setPickupCoords]  = useState<SelectedPlace | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<SelectedPlace | null>(null);
  const [flightNumber,  setFlightNumber]  = useState("");
  const [quote,         setQuote]         = useState<Quote | null>(null);
  const [quoting,       setQuoting]       = useState(false);

  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);

  // Pre-fill once on mount: a trip from the dashboard ("Book again" / "Change"),
  // else name & email from the pricing gate. Read after mount so it matches hydration.
  useEffect(() => {
    const take = (k: string) => { const v = sessionStorage.getItem(k) ?? ""; sessionStorage.removeItem(k); return v; };
    let r: Rebook | null = null;
    try { r = JSON.parse(take("rebook") || "null"); } catch { /* ignore */ }
    const gateName = take("prefill_name"), gateEmail = take("prefill_email");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time read of browser-only storage */
    if (!r) { setName(gateName); setEmail(gateEmail); return; }
    setRebook(r);
    setName(r.name); setEmail(r.email); setCell(r.cell);
    setCustomerTier(r.tier); setPassengers(r.passengers);
    setPickup(r.pickup); setDropoff(r.dropoff);
    if (r.date) setDate(r.date);
    if (r.time) setTime(r.time);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Existing clients: fill their details from their last booking (or account) when signed in.
  useEffect(() => {
    if (!user || rebook) return;
    getSupabaseBrowser().from("bookings").select("client_name,client_email,client_cell")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
      .then(({ data }: { data: { client_name: string; client_email: string; client_cell: string }[] | null }) => {
        const last = data?.[0];
        setName((v) => v || last?.client_name || user.user_metadata?.full_name || "");
        setEmail((v) => v || last?.client_email || user.email || "");
        setCell((v) => v || last?.client_cell || "");
      });
  }, [user, rebook]);

  // Rebooking: look the saved addresses up again so the fare can be measured.
  useEffect(() => {
    if (!rebook) return;
    const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const find = async (text: string): Promise<SelectedPlace | null> => {
      if (!key || !text) return null;
      try {
        const r = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&filter=countrycode:za&limit=1&format=json&apiKey=${key}`);
        const hit = (await r.json())?.results?.[0];
        return hit ? { address: text, lat: hit.lat, lon: hit.lon } : null;
      } catch { return null; }
    };
    find(rebook.pickup).then(setPickupCoords);
    find(rebook.dropoff).then(setDropoffCoords);
  }, [rebook]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const tripType = isAirport(dropoff) ? "to_airport" : isAirport(pickup) ? "from_airport" : "point_to_point";
  const isCustom = quote?.band === "custom";
  const finalFare = applyWeekendSurcharge(quote?.fare ?? null, date);
  // What the guest pays: half on a loyalty trip (the server applies it for real).
  const shownFare = finalFare != null && quote?.loyalty ? Math.round(finalFare / 2) : finalFare;
  const currentStep = STEPS.indexOf(step);

  const go = (s: Step) => { setError(null); setStep(s); };

  const checkSlot = async (d: string, t: string) => {
    setSlot(null);
    if (!d || !t || !isPickupTimeInRange(t)) return;
    try {
      const res = await fetch(`/api/availability/slot?date=${d}&time=${t}${changingId ? `&exclude=${changingId}` : ""}`);
      setSlot(await res.json());
    } catch { /* fail open — the server re-checks on submit */ }
  };

  // Fare is worked out as soon as both addresses are picked.
  const getQuote = async (p: SelectedPlace | null, d: SelectedPlace | null) => {
    setQuote(null);
    setError(null);
    if (!p || !d) return;
    setQuoting(true);
    try {
      const res = await fetch("/api/calculate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: { lat: p.lat, lon: p.lon },
          dropoff: { lat: d.lat, lon: d.lon },
          passengers,
          customerTier,
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not calculate your fare");
      setQuote({ distanceKm: data.distanceKm, band: data.band, fare: data.fare, loyalty: !!data.loyalty });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not calculate your fare");
    } finally {
      setQuoting(false);
    }
  };

  const nextFromYou = () => {
    if (!name.trim() || !email.trim() || !cell.trim()) { setError("Please fill in your name, email and phone number."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Please enter a valid email address."); return; }
    go("trip");
  };

  const nextFromTrip = () => {
    if (!date || !time) { setError("Please choose a date and pickup time."); return; }
    if (!isPickupTimeInRange(time)) { setError("Pickup time must be between 04:00 and 24:00."); return; }
    if (slot && !slot.available) { setError(slot.message); return; }
    go("route");
    // Coming from "Book again": the addresses are already known, so price it straight away.
    if (pickupCoords && dropoffCoords && !quote) getQuote(pickupCoords, dropoffCoords);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!pickupCoords || !dropoffCoords || !quote) {
      setError("Please pick both addresses from the suggestions list so we can measure the distance.");
      return;
    }
    setLoading(true);
    try {
      const token = changingId ? (await getSupabaseBrowser().auth.getSession()).data.session?.access_token : null;
      const res = await fetch(changingId ? `/api/bookings/${changingId}` : "/api/bookings", {
        method: changingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientCell: cell.trim(),
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          distanceKm: quote.distanceKm ?? 0,
          passengers,
          tripType,
          customerTier,
          flightNumber: tripType === "point_to_point" ? null : flightNumber,
          userId: user?.id ?? null,
          pricingBand: quote.band,
          fareZar: isCustom ? null : finalFare,
          preferredDate: date,
          preferredTimeWindow: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setBookingRef(data.ref);
      setLoyaltyApplied(!!data.loyalty);
      go("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn = "w-full py-3.5 rounded-xl bg-[#1B3A6B] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#224889] transition disabled:opacity-60";
  const backBtn = "w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 transition";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#1B4D2E]/10 text-[#1B4D2E] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
          <Plane size={12} /> Transfer Booking
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{changingId ? "Change Your Booking" : "Book Your Transfer"}</h1>
        <p className="text-slate-500 text-sm">Three quick steps — no payment now.</p>
      </div>

      {step !== "done" && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => (
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

      <div className="overflow-x-clip">
        <div key={step} className={`${PANE_ANIM[step]} bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8`}>

          {/* ── Pane 1: who ── */}
          {step === "you" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 text-lg">Your Details</h2>
              <div><Label>Name &amp; surname</Label><Field icon={User} autoComplete="name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Email address</Label><Field icon={Mail} type="email" autoComplete="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Phone number</Label><Field icon={Phone} type="tel" autoComplete="tel" placeholder="+27 82 123 4567" value={cell} onChange={e => setCell(e.target.value)} /></div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={nextFromYou} className={primaryBtn}>Next <ChevronRight size={16} /></button>
            </div>
          )}

          {/* ── Pane 2: trip ── */}
          {step === "trip" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 text-lg">Your Trip</h2>
              <div>
                <Label>Booking type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map(({ value, label }) => (
                    <button key={value} onClick={() => setCustomerTier(value)}
                      className={`py-3 px-2 rounded-xl border text-xs font-semibold transition
                        ${customerTier === value ? "bg-[#1B4D2E] text-white border-[#1B4D2E]" : "border-slate-200 text-slate-600 hover:border-[#1B4D2E]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Passengers</Label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setPassengers(n)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition
                        ${passengers === n ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "border-slate-200 text-slate-600 hover:border-[#1B3A6B]"}`}>
                      <Users size={14} className="inline mr-1" />{n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <input type="date" value={date} min={todayISO} className={inputCls}
                      onChange={e => { setDate(e.target.value); checkSlot(e.target.value, time); }} />
                  </div>
                  <div>
                    <Label>Pickup time</Label>
                    <input type="time" value={time} min={PICKUP_MIN} max={PICKUP_MAX} step={900} className={inputCls}
                      onChange={e => { setTime(e.target.value); checkSlot(date, e.target.value); }} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Pickups between 04:00 and 24:00.</p>
                {slot && slot.message && (
                  <div className={`mt-2 flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium
                    ${slot.available ? "bg-[#1B4D2E]/10 text-[#1B4D2E]" : "bg-red-50 text-red-600"}`}>
                    {slot.available ? <Check size={13} className="mt-0.5 shrink-0" /> : <X size={13} className="mt-0.5 shrink-0" />}
                    <span>{slot.message}</span>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <button onClick={nextFromTrip} className={primaryBtn}>Next <ChevronRight size={16} /></button>
                <button onClick={() => go("you")} className={backBtn}>← Back</button>
              </div>
            </div>
          )}

          {/* ── Pane 3: addresses + fare ── */}
          {step === "route" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 text-lg">Pickup &amp; Destination</h2>
              <div>
                <Label>Pickup address</Label>
                <AddressAutocomplete
                  value={pickup}
                  onChange={v => { setPickup(v); setPickupCoords(null); setQuote(null); }}
                  onSelect={p => { setPickup(p.address); setPickupCoords(p); getQuote(p, dropoffCoords); }}
                  placeholder="Start typing an address…"
                />
              </div>
              <div>
                <Label>Destination address</Label>
                <AddressAutocomplete
                  value={dropoff}
                  onChange={v => { setDropoff(v); setDropoffCoords(null); setQuote(null); }}
                  onSelect={p => { setDropoff(p.address); setDropoffCoords(p); getQuote(pickupCoords, p); }}
                  placeholder="Start typing an address…"
                />
              </div>
              {tripType !== "point_to_point" && (
                <div>
                  <Label>Flight number <span className="text-slate-400 font-normal">(optional — we&apos;ll track it)</span></Label>
                  <Field icon={Plane} type="text" placeholder="e.g. BA349 or FA123" autoCapitalize="characters"
                    value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} />
                </div>
              )}

              {quoting && <p className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={14} className="animate-spin" /> Working out your fare…</p>}
              {quote && (
                <div className="bg-gradient-to-br from-[#1B4D2E] to-[#1B3A6B] rounded-2xl p-5 text-white">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                    {isCustom ? "Custom quote" : "Estimated total"} · {passengers} pax · {quote.distanceKm} km
                  </p>
                  <p className="text-3xl font-bold">
                    {isCustom ? "We'll quote you" : shownFare != null ? formatRand(shownFare) : "—"}
                    {!isCustom && quote.loyalty && finalFare != null && <span className="ml-2 text-base font-semibold text-white/50 line-through">{formatRand(finalFare)}</span>}
                  </p>
                  {!isCustom && quote.fare != null && passengers > 1 && (
                    <p className="text-white/70 text-sm mt-1">{formatRand(Math.round(quote.fare / passengers))} per person × {passengers}</p>
                  )}
                  {!isCustom && quote.loyalty && (
                    <p className="mt-2 inline-flex items-center gap-1.5 bg-[#C9A84C] text-[#133820] text-xs font-bold px-3 py-1.5 rounded-full">
                      <Star size={12} /> Traveler Rewards: your 6th trip is half price
                    </p>
                  )}
                  <p className="mt-2 text-white/70 text-xs leading-relaxed">
                    {isCustom
                      ? "This trip is beyond our standard range — send it through and we'll reply with a price."
                      : "We confirm the final price when we accept your booking — you're not charged now."}
                  </p>
                  {!isCustom && isWeekendDate(date) && quote.fare != null && (
                    <p className="mt-3 inline-flex items-center gap-1.5 bg-[#C9A84C]/25 text-[#F3E4BE] text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Clock size={12} /> Includes {Math.round(WEEKEND_SURCHARGE * 100)}% weekend surcharge (base {formatRand(quote.fare)})
                    </p>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <button onClick={handleSubmit} disabled={loading || quoting}
                  className="w-full py-3.5 rounded-xl bg-[#1B4D2E] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#246038] transition disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> {changingId ? "Save Changes" : isCustom ? "Send Quote Request" : "Confirm Booking Request"}</>}
                </button>
                <button onClick={() => go("trip")} className={backBtn}>← Back</button>
              </div>
            </div>
          )}

          {/* ── Confirmation ── */}
          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
                <Check size={28} />
              </div>
              <h2 className="font-bold text-slate-900 text-2xl mb-2">
                {changingId ? "Changes Sent!" : isCustom ? "Quote Request Sent!" : "Booking Received!"}
              </h2>
              {bookingRef && (
                <div className="inline-block bg-[#F9F5EF] border border-[#C9A84C]/30 rounded-xl px-6 py-3 my-4">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your reference</p>
                  <p className="text-2xl font-bold text-[#1B3A6B]">#{bookingRef}</p>
                </div>
              )}
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                {changingId
                  ? "Your updated booking has been sent. The driver will review and re-confirm it shortly."
                  : isCustom
                  ? "We've received your request and will be in touch with personalised pricing."
                  : "We've sent you a confirmation email. The driver will review and confirm your booking shortly."}
              </p>
              {loyaltyApplied && <p className="text-[#1B4D2E] text-sm font-semibold mt-3">Traveler Rewards applied — this trip is half price. Thank you for travelling with us!</p>}
              <p className="text-slate-400 text-xs mt-4">Keep your reference number handy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
