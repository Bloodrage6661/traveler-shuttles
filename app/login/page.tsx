"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    const sb = getSupabaseBrowser();
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (err) { setError("Incorrect email or password."); return; }
    router.push("/dashboard");
    router.refresh();
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
          <h2 className="text-3xl font-bold mb-3">Welcome back.</h2>
          <p className="text-white/60 text-lg">Sign in to view your bookings and manage your transfers.</p>
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
            <h1 className="font-bold text-2xl text-slate-900 mb-1">Sign in</h1>
            <p className="text-slate-500 text-sm mb-7">
              No account?{" "}
              <Link href="/signup" className="text-[#1B3A6B] font-semibold hover:underline">Create one free</Link>
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
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#1B3A6B] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={showPw ? "text" : "password"} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
