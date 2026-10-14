"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Check, Plus, Clock, Users, Car, Loader2, CheckCircle2, ArrowRight, X } from "lucide-react";
import { TOURS, BAND_LABELS, bandFor, VEHICLES, vehicleFor, AFTER_HOURS_PER_HOUR, DEPOSIT_PER_PERSON } from "@/lib/tours";
import { Reveal } from "@/components/motion";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const R = (n: number) => `R${n.toLocaleString("en-ZA")}`;
const msSince = (t: number) => Date.now() - t; // spam-timing check
const OWN = "own"; // id for "Create your own itinerary"

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10";

export default function TourBuilder() {
  const [picked, setPicked] = useState<string[]>([]);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [loadedAt] = useState(() => Date.now());
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderTurnstile = () => {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || !widgetRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action: "contact",
      callback: (t: string) => setToken(t),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  };
  useEffect(() => { renderTurnstile(); }, []);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const band = bandFor(guests);
  const vehicle = vehicleFor(guests);
  const lines = picked.map((id) => {
    if (id === OWN) {
      return { label: `Create your own itinerary — ${vehicle ? `${vehicle.name} + guide` : "vehicle + guide"}`, amount: vehicle ? vehicle.perDay : null, unit: "/ day" };
    }
    const t = TOURS.find((x) => x.n === id)!;
    return { label: `${t.n} ${t.title}`, amount: band == null ? null : t.rates[band] * guests, unit: band == null ? "" : `(${R(t.rates[band])} pp)` };
  });
  const allPriced = lines.length > 0 && lines.every((l) => l.amount != null);
  const total = lines.reduce((s, l) => s + (l.amount ?? 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!picked.length) { setError("Pick at least one tour above."); return; }
    if (!name.trim() || !email.trim()) { setError("Please add your name and email."); return; }
    if (TURNSTILE_SITE_KEY && !token) { setError("Please complete the verification below."); return; }
    const message = [
      "TOUR REQUEST",
      `Guests: ${guests}`,
      `Preferred date: ${date || "not given"}`,
      `Pickup: ${pickup || "not given"}`,
      "",
      "Selected:",
      ...lines.map((l) => `- ${l.label}: ${l.amount != null ? `${R(l.amount)} ${l.unit}` : "price on request"}`),
      "",
      allPriced ? `Estimated total: ${R(total)} · deposit ${R(DEPOSIT_PER_PERSON * guests)}` : "Estimated total: on request",
      notes.trim() ? `\nNotes: ${notes.trim()}` : "",
    ].join("\n");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, hp, elapsed: msSince(loadedAt), turnstileToken: token }),
      });
      if (!res.ok) throw new Error("send failed");
      setSent(true);
    } catch {
      setError("Sorry, something went wrong sending your request. Please try again or WhatsApp us.");
      window.turnstile?.reset(widgetIdRef.current ?? undefined);
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* Tour list */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users size={16} className="text-[#1B4D2E]" /> Guests</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
              <button key={g} type="button" onClick={() => setGuests(g)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold border transition ${guests === g ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-white border-slate-200 text-slate-600 hover:border-[#1B3A6B]"}`}>
                {g}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">{band == null ? "Rates for 1 guest on request" : `Showing ${BAND_LABELS[band]} rates`}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {TOURS.map((t, i) => {
            const on = picked.includes(t.n);
            return (
              <Reveal key={t.n} delay={(i % 2) * 0.06} className={`rounded-2xl border bg-white p-5 flex flex-col transition-shadow ${on ? "border-[#1B4D2E] ring-2 ring-[#1B4D2E]/20 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="grid place-items-center shrink-0 w-9 h-9 rounded-lg bg-[#1B4D2E] text-white text-xs font-bold">{t.n}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">{t.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><Clock size={12} /> {t.hours}</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-3 text-[13px] text-slate-600">
                  {t.includes.slice(2).map((x) => (
                    <li key={x} className="flex gap-1.5"><Check size={14} className="text-[#1B4D2E] shrink-0 mt-0.5" /> {x}</li>
                  ))}
                  <li className="text-xs text-slate-400 pt-1">Guide, return transfers &amp; water included · Excludes: {t.excludes}</li>
                </ul>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Per person</p>
                    <p className="text-lg font-bold text-[#1B3A6B]">{band == null ? "On request" : R(t.rates[band])}</p>
                  </div>
                  <button type="button" onClick={() => toggle(t.n)} aria-pressed={on}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-[#1B4D2E] text-white" : "border border-[#1B4D2E] text-[#1B4D2E] hover:bg-[#1B4D2E]/5"}`}>
                    {on ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}
                  </button>
                </div>
              </Reveal>
            );
          })}

          {/* Create your own itinerary */}
          <Reveal className="sm:col-span-2">
            <div className={`rounded-2xl p-6 text-white ${picked.includes(OWN) ? "ring-4 ring-[#C9A84C]/50" : ""}`} style={{ background: "linear-gradient(135deg, #0F2B1A 0%, #1B4D2E 55%, #1B3A6B 100%)" }}>
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-2 flex items-center gap-2"><Car size={14} /> Vehicle &amp; guide hire</p>
              <h3 className="text-xl font-bold mb-2">Create your own itinerary</h3>
              <p className="text-white/70 text-sm mb-4">Build your own day with a qualified guide and a private vehicle. 08h00–17h00, within 200 km of Cape Town. 2 bottles of water per person included; entrances for own account.</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {VEHICLES.map((v) => (
                  <div key={v.name} className={`rounded-xl px-3 py-2.5 text-center border ${vehicle?.name === v.name ? "bg-white/15 border-[#C9A84C]" : "bg-white/5 border-white/10"}`}>
                    <p className="font-semibold text-sm">{v.name}</p>
                    <p className="text-[11px] text-white/60">1–{v.maxPax} pax</p>
                    <p className="font-bold text-[#C9A84C] text-sm mt-1">{R(v.perDay)}<span className="text-white/50 font-normal"> / day</span></p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-white/55">After hours: {R(AFTER_HOURS_PER_HOUR)} per hour thereafter.</p>
                <button type="button" onClick={() => toggle(OWN)} aria-pressed={picked.includes(OWN)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${picked.includes(OWN) ? "bg-[#C9A84C] text-[#133820]" : "bg-white/10 border border-white/30 hover:bg-white/20"}`}>
                  {picked.includes(OWN) ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* My tour */}
      <aside id="my-tour" className="lg:sticky lg:top-24 scroll-mt-24 bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
        <h2 className="font-bold text-xl text-slate-900 mb-1">Build my tour</h2>
        <p className="text-sm text-slate-500 mb-4">Add tours, then send it through — we&apos;ll confirm availability and your final price.</p>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 size={36} className="text-[#1B4D2E] mx-auto mb-3" />
            <p className="font-semibold text-slate-900 text-lg mb-1">Request sent!</p>
            <p className="text-slate-500 text-sm">Thanks — we&apos;ll be in touch shortly to plan your day.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3">
            {lines.length === 0 ? (
              <p className="rounded-xl bg-slate-50 border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">No tours added yet.</p>
            ) : (
              <ul className="space-y-2">
                {lines.map((l, i) => (
                  <li key={picked[i]} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-slate-700">{l.label}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="font-semibold text-slate-900">{l.amount != null ? R(l.amount) : "On request"}</span>
                      <button type="button" onClick={() => toggle(picked[i])} aria-label={`Remove ${l.label}`} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {lines.length > 0 && (
              <div className="rounded-xl bg-[#F9F5EF] px-4 py-3 text-sm">
                <div className="flex justify-between font-bold text-slate-900"><span>Estimated total · {guests} guest{guests > 1 ? "s" : ""}</span><span>{allPriced ? R(total) : "On request"}</span></div>
                <p className="text-xs text-slate-500 mt-1">Deposit {R(DEPOSIT_PER_PERSON)} per person secures your booking; balance on the day.</p>
              </div>
            )}

            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
            <input className={inputCls} placeholder="Name & surname *" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inputCls} type="email" placeholder="Email *" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputCls} type="tel" placeholder="Phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} type="date" aria-label="Preferred date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input className={inputCls} placeholder="Pickup area" value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </div>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Anything else? Stops you'd like, dietary needs…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {TURNSTILE_SITE_KEY && (
              <>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" onLoad={renderTurnstile} />
                <div ref={widgetRef} className="cf-turnstile" />
              </>
            )}
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send my tour request <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </aside>

      {/* Mobile: jump to the summary once something's picked */}
      {picked.length > 0 && !sent && (
        <a href="#my-tour" className="lg:hidden fixed bottom-4 left-4 right-20 z-40 flex items-center justify-between rounded-full bg-[#1B4D2E] text-white px-5 py-3 shadow-xl">
          <span className="text-sm font-semibold">{picked.length} added · {allPriced ? R(total) : "on request"}</span>
          <span className="text-sm font-bold flex items-center gap-1">Review <ArrowRight size={15} /></span>
        </a>
      )}
    </div>
  );
}
