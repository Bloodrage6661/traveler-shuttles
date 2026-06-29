"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, User, Mail, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";

const BAND_LABELS = ["Up to 25 km", "Up to 50 km", "Up to 75 km", "75 km +"];
const BAND_AREAS  = ["Stellenbosch, Somerset West & nearby", "Franschhoek, Paarl & Cape Town suburbs", "Cape Town CBD, V&A Waterfront & CTIA", "Long distance — custom quote"];

export default function PricingGate() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect straight to book
  useEffect(() => {
    if (!authLoading && user) router.push("/book");
  }, [user, authLoading, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email to view rates.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    sessionStorage.setItem("prefill_name",  name.trim());
    sessionStorage.setItem("prefill_email", email.trim());
    router.push("/signup");
  };

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="pricing-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Pricing</p>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
          <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
          <p className="text-slate-500 max-w-xl mx-auto">
            Rates based on distance and customer type. No surge pricing, no surprises.
            Sign up to see your exact fare.
          </p>
        </div>

        <div className="relative rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Blurred/locked table preview */}
          <div className="select-none pointer-events-none" aria-hidden="true">
            <table className="w-full text-sm blur-[6px] opacity-60">
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #1B4D2E, #1B3A6B)" }} className="text-white">
                  <th className="text-left px-6 py-4 font-semibold">Distance</th>
                  <th className="px-4 py-4 font-semibold text-center">1 pax</th>
                  <th className="px-4 py-4 font-semibold text-center">2 pax</th>
                  <th className="px-4 py-4 font-semibold text-center">3 pax</th>
                </tr>
              </thead>
              <tbody>
                {BAND_LABELS.map((band, i) => (
                  <tr key={band} className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{band}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{BAND_AREAS[i]}</p>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-300">R ●●●</td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-300">R ●●●</td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-300">R ●●●</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gate overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-md mx-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center text-[#1B3A6B] mx-auto mb-4">
                <Lock size={22} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 text-center mb-2">View Your Fare</h3>
              <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
                Enter your details to see live pricing and book your transfer.
              </p>

              <form onSubmit={submit} className="space-y-3" noValidate>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                  />
                </div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                  />
                </div>
                {error && <p className="text-red-500 text-xs" role="alert">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <Eye size={15} aria-hidden="true" /> Create Account & View Rates <ArrowRight size={14} aria-hidden="true" />
                </button>
              </form>
              <p className="text-slate-400 text-xs text-center mt-3">
                Already have an account?{" "}
                <a href="/login" className="text-[#1B3A6B] underline">Sign in</a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Corporate & Hotel/B&B partners receive preferential rates.{" "}
          <a href="/contact" className="text-[#1B3A6B] underline">Contact us to register.</a>
        </p>
      </div>
    </section>
  );
}
