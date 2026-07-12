"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MessageCircle, MapPin, Clock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}</label>;
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
    />
  );
}

export default function ContactPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !message) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      window.location.href = `mailto:info@travelershuttles.co.za?subject=Enquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`)}`;
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section
          className="py-24 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}
          aria-labelledby="contact-heading"
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Reach Out</p>
            <h1 id="contact-heading" className="text-4xl sm:text-5xl font-bold text-white mb-5">Get in Touch</h1>
            <p className="text-white/65 text-lg max-w-xl mx-auto">
              Questions, quotes, or corporate account enquiries — we respond within the hour during business hours.
            </p>
          </div>
        </section>

        {/* Contact form + details */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-label="Contact form and details">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10">

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="font-bold text-2xl text-slate-900 mb-6">Send Us a Message</h2>

              {sent ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
                    <CheckCircle2 size={26} aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-slate-900 text-lg mb-2">Message sent!</p>
                  <p className="text-slate-500 text-sm">Your email client should have opened. We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div>
                    <Label>Full name <span className="text-red-400" aria-hidden="true">*</span></Label>
                    <Field type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div>
                    <Label>Email address <span className="text-red-400" aria-hidden="true">*</span></Label>
                    <Field type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <Field type="tel" placeholder="+27 82 123 4567" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                  </div>
                  <div>
                    <Label>Message <span className="text-red-400" aria-hidden="true">*</span></Label>
                    <textarea
                      rows={5}
                      placeholder="Tell us about your transfer needs, request a quote, or ask about corporate accounts…"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <><ArrowRight size={16} aria-hidden="true" /> Send Message</>}
                  </button>
                  <p className="text-xs text-slate-400 text-center">We respond within 1 hour during business hours.</p>
                </form>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/27766432418"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#1B4D2E] hover:bg-[#246038] text-white rounded-2xl p-5 transition-colors group"
                aria-label="Chat with us on WhatsApp"
              >
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <MessageCircle size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-base">Chat on WhatsApp</p>
                  <p className="text-white/65 text-sm">Fastest response — available now</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-white/50 group-hover:text-white transition-colors" aria-hidden="true" />
              </a>

              {/* Phone */}
              <a
                href="tel:+27766432418"
                className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-[#C9A84C]/40 transition-all group"
                aria-label="Call us"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center text-[#1B3A6B] shrink-0">
                  <Phone size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">076 643 2418</p>
                  <p className="text-slate-400 text-sm">Available 24/7</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@travelershuttles.co.za"
                className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-[#C9A84C]/40 transition-all"
                aria-label="Email us"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center text-[#1B3A6B] shrink-0">
                  <Mail size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">info@travelershuttles.co.za</p>
                  <p className="text-slate-400 text-sm">We reply within 1 hour</p>
                </div>
              </a>

              {/* Info card */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#1B4D2E] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Service Area</p>
                    <p className="text-slate-500 text-sm">Cape Town & Western Cape</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[#1B4D2E] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Response Time</p>
                    <p className="text-slate-500 text-sm">Within 1 hour, business hours</p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="rounded-2xl h-52 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #0F2B1A 0%, #1B4D2E 45%, #1B3A6B 100%)" }}
                aria-label="Cape Town service area map"
              >
                <MapPin size={36} className="text-white/25 mb-2" aria-hidden="true" />
                <p className="text-white/65 font-semibold">Cape Town</p>
                <p className="text-white/35 text-xs mt-0.5">Western Cape, South Africa</p>
              </div>
            </div>
          </div>
        </section>

        {/* Book CTA */}
        <section
          className="py-16 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(135deg, #1B4D2E, #1B3A6B)" }}
          aria-labelledby="contact-cta-heading"
        >
          <h2 id="contact-cta-heading" className="text-2xl font-bold text-white mb-3">Ready to book?</h2>
          <p className="text-white/60 mb-6 text-sm">Skip the message — book your transfer directly online.</p>
          <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors">
            Book a Transfer <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
