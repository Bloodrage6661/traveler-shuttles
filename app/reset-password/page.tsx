"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Phase = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase,     setPhase]     = useState<Phase>("checking");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // The reset link routes through /auth/callback, which exchanges the code and
  // sets a recovery session cookie. If there's a valid user here, allow the reset.
  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.auth.getUser().then((res: { data: { user: User | null } }) => {
      setPhase(res.data.user ? "ready" : "invalid");
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    const sb = getSupabaseBrowser();
    const { error: err } = await sb.auth.updateUser({ password });
    setLoading(false);

    if (err) { setError(err.message || "Could not update password. The link may have expired."); return; }
    setPhase("done");
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 2000);
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
          <h2 className="text-3xl font-bold mb-3">Choose a new password.</h2>
          <p className="text-white/60 text-lg">Pick something secure you&apos;ll remember — you&apos;ll be signed straight in.</p>
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
            {phase === "checking" && (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-[#1B3A6B] mx-auto" />
                <p className="text-slate-400 text-sm mt-3">Verifying your link…</p>
              </div>
            )}

            {phase === "invalid" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
                  <AlertCircle size={26} aria-hidden="true" />
                </div>
                <h1 className="font-bold text-xl text-slate-900 mb-2">Link expired or invalid</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  This password reset link is no longer valid. Reset links expire after 1 hour.
                  Please request a new one.
                </p>
                <Link href="/forgot-password" className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Request a new link <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {phase === "done" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </div>
                <h1 className="font-bold text-xl text-slate-900 mb-2">Password updated</h1>
                <p className="text-slate-500 text-sm">Taking you to your dashboard…</p>
              </div>
            )}

            {phase === "ready" && (
              <>
                <h1 className="font-bold text-2xl text-slate-900 mb-1">Set new password</h1>
                <p className="text-slate-500 text-sm mb-7">Choose a password with at least 8 characters.</p>

                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPw ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                      <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPw ? "Hide password" : "Show password"}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPw ? "text" : "password"} placeholder="Re-enter your password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10" />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Update password</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
