import type { Metadata } from "next";
import { Grape, CheckCircle2, CloudSun, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourBuilder from "@/components/TourBuilder";
import { Pane } from "@/components/motion";

export const metadata: Metadata = {
  title: "Cape Town Day Tours — Build Your Own Tour",
  description: "Private and small-group Cape Town day tours: Table Mountain, the Peninsula, the Winelands, safaris and more — or hire a private vehicle and guide. Pick your tours and send one request.",
  alternates: { canonical: "/tours" },
};

const bookingNotes = [
  "Bookings are secured once the deposit is received — R500 per person.",
  "Balance of payment is due on the day of the tour.",
  "No-show bookings are non-refundable unless a valid reason is agreed case-by-case.",
  "Certain specialist tours or overnight packages may require full payment in advance.",
];

const tourNotes = [
  "Weather can affect Table Mountain, Robben Island, shark diving, skydiving and other outdoor activities.",
  "Where an included attraction is unavailable, alternative arrangements or supplier credits may apply where possible.",
  "Guide tipping is at the guest's discretion and is not included in the published rate.",
  "Third-party activity availability and operating times are subject to supplier confirmation.",
];

export default function ToursPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Pane fx="shutter">
          <section className="relative py-24 px-4 sm:px-6 text-center overflow-hidden" aria-labelledby="tours-heading">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1489676138048-ba1786a7f026?auto=format&fit=crop&w=1920&q=70" alt="" aria-hidden="true" className="hero-zoom absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(160deg, rgba(15,43,26,0.92) 0%, rgba(27,77,46,0.78) 50%, rgba(27,58,107,0.88) 100%)" }} />
            <div className="relative max-w-2xl mx-auto">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-2"><Grape size={14} /> One booking. One Traveler. One great day.</p>
              <h1 id="tours-heading" className="text-4xl sm:text-5xl font-bold text-white mb-5">Discover Cape Town your way</h1>
              <p className="text-white/70 text-lg max-w-xl mx-auto">
                Private and small-group day tours around Cape Town and the Western Cape. Choose ready-made tours, or build a day around your interests, timing and group size.
              </p>
              <p className="text-white/50 text-sm mt-5">Ideal for leisure travellers, B&amp;B and hotel guests, corporate clients and airline crew.</p>
            </div>
          </section>
        </Pane>

        <Pane fx="wipe">
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-label="Choose your tours">
            <TourBuilder />
          </section>
        </Pane>

        <Pane fx="rise">
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="booking-info-heading">
            <div className="max-w-5xl mx-auto">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-center">Booking information</p>
              <h2 id="booking-info-heading" className="text-3xl font-bold text-slate-900 text-center mb-10">Simple booking. Clear expectations.</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Info size={17} className="text-[#1B4D2E]" /> Booking &amp; payment</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {bookingNotes.map((n) => <li key={n} className="flex gap-2"><CheckCircle2 size={15} className="text-[#1B4D2E] shrink-0 mt-0.5" /> {n}</li>)}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><CloudSun size={17} className="text-[#1B4D2E]" /> Important tour notes</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {tourNotes.map((n) => <li key={n} className="flex gap-2"><CheckCircle2 size={15} className="text-[#1B4D2E] shrink-0 mt-0.5" /> {n}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </Pane>
      </main>
      <Footer />
    </>
  );
}
