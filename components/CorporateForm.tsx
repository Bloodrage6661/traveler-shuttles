"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { BUSINESS_CATEGORIES, CORPORATE_SERVICES } from "@/lib/corporate";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const inp = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function CorporateForm() {
  const [f, setF] = useState({ companyName: "", contactPerson: "", jobTitle: "", email: "", phone: "", location: "", category: "", monthly: "", message: "" });
  const [services, setServices] = useState<string[]>([]);
  const [consent, setConsent] = useState(false); // never pre-ticked
  const [hp, setHp] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderTurnstile = () => {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || !widgetRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: TURNSTILE_SITE_KEY, action: "contact",
      callback: (t: string) => setToken(t), "expired-callback": () => setToken(""), "error-callback": () => setToken(""),
    });
  };
  useEffect(() => { renderTurnstile(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.companyName || !f.contactPerson || !f.email || !f.phone || !f.location || !f.category) { setError("Please fill in all required fields."); return; }
    if (TURNSTILE_SITE_KEY && !token) { setError("Please complete the verification below."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, services, marketingConsent: consent, hp, turnstileToken: token }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "send failed");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message !== "send failed" ? err.message : "Sorry, something went wrong. Please try again or WhatsApp us.");
      window.turnstile?.reset(widgetIdRef.current ?? undefined);
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={40} className="text-[#1B4D2E] mx-auto mb-3" />
        <p className="font-semibold text-slate-900 text-xl mb-1">Thank you — enquiry received</p>
        <p className="text-slate-500 text-sm">We&apos;ll be in touch shortly to discuss a partnership.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Company name *</label><input className={inp} autoComplete="organization" value={f.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
        <div><label className={lbl}>Contact person *</label><input className={inp} autoComplete="name" value={f.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></div>
        <div><label className={lbl}>Position / job title</label><input className={inp} autoComplete="organization-title" value={f.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} /></div>
        <div><label className={lbl}>Business email *</label><input className={inp} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><label className={lbl}>Telephone number *</label><input className={inp} type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><label className={lbl}>Business location *</label><input className={inp} placeholder="e.g. Stellenbosch" value={f.location} onChange={(e) => set("location", e.target.value)} /></div>
        <div>
          <label className={lbl}>Business category *</label>
          <select className={inp} value={f.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Select…</option>
            {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Estimated monthly requirements</label><input className={inp} placeholder="e.g. 20 airport transfers / month" value={f.monthly} onChange={(e) => set("monthly", e.target.value)} /></div>
      </div>
      <fieldset>
        <legend className={lbl}>Services required</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {CORPORATE_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer has-[:checked]:border-[#1B4D2E] has-[:checked]:bg-[#1B4D2E]/5">
              <input type="checkbox" className="accent-[#1B4D2E]" checked={services.includes(s)}
                onChange={() => setServices((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))} />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <div><label className={lbl}>Additional information</label><textarea className={`${inp} resize-none`} rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} /></div>

      <p className="text-xs text-slate-500 leading-relaxed rounded-xl bg-slate-50 border border-slate-100 p-3">
        We collect these details only to respond to your enquiry and discuss transport services with your business, in line with
        the Protection of Personal Information Act (POPIA). See our <Link href="/privacy" className="text-[#1B3A6B] underline">Privacy Policy</Link> for
        how we handle your information and how to make a privacy request.
      </p>
      <label className="flex items-start gap-2.5 text-sm text-slate-600 cursor-pointer">
        <input type="checkbox" className="mt-1 accent-[#1B4D2E]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree that Traveler Shuttles &amp; Tours may contact me with information about its transportation services, business partnerships and promotional offers. I understand that I may withdraw my consent at any time. <span className="text-slate-400">(Optional)</span></span>
      </label>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" onLoad={renderTurnstile} />
          <div ref={widgetRef} className="cf-turnstile" />
        </>
      )}
      {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold text-sm transition-colors disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send business enquiry <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}
