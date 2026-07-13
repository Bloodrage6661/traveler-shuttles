"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }

    setLoading(true);
    const sb = getSupabaseBrowser();
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Always show success — don't reveal whether an account exists.
    if (err && err.message.toLowerCase().includes("rate")) {
      setError("Too many attempts. Please wait a minute and try again.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Plane size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Traveler Shuttles and Tours</p>
            <p className="text-white/40 text-[11px] mt-0.5">South Africa</p>
          </div>
        </Link>

        <div>
          <h2 className="text-3xl font-bold mb-3">Forgot your password?</h2>
          <p className="text-white/60 text-lg">No problem — we&apos;ll email you a secure link to reset it.</p>
        </div>

        <p className="text-white/25 text-xs">© 2026 Traveler Shuttles and Tours</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Plane size={18} className="text-[#1B4D2E]" />
            <span className="font-bold text-sm text-slate-800">Traveler Shuttles</span>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h1 className="font-bold text-xl text-slate-900 mb-2">Check your email</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                  It expires in 1 hour — check your spam folder if you don&apos;t see it.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1B3A6B] font-semibold hover:underline">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <h1 className="font-bold text-2xl text-slate-900 mb-1">Reset password</h1>
                <p className="text-slate-500 text-sm mb-7">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Send reset link</>}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  <Link href="/login" className="text-[#1B3A6B] font-semibold hover:underline inline-flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
