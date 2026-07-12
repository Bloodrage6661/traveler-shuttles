import type { Metadata } from "next";
import { Plane, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/BookingWizard";

export const metadata: Metadata = {
  title: "Book a Transfer | Traveler Shuttles and Tours",
  description: "Book your Cape Town airport transfer or shuttle online. Transparent pricing, instant fare calculation, confirmed by the driver.",
  openGraph: {
    title: "Book a Transfer | Traveler Shuttles and Tours",
    description: "Book your Cape Town airport transfer or shuttle online.",
    type: "website",
  },
};

const perks = [
  "Transparent pricing — see your fare before you commit",
  "Driver confirms within the hour",
  "Real-time flight tracking on airport transfers",
  "No payment required upfront — pay on the day",
];

export default function BookPage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* Hero strip */}
        <section
          className="py-20 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}
          aria-label="Book a transfer"
        >
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Plane size={12} aria-hidden="true" /> Online Booking
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Book Your Transfer</h1>
            <p className="text-white/65 text-lg max-w-lg mx-auto leading-relaxed mb-8">
              Fill in your details, get your fare instantly, pick a date. The driver will confirm within the hour.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
              {perks.map((p) => (
                <div key={p} className="flex items-start gap-2 text-left">
                  <CheckCircle2 size={14} className="text-[#C9A84C] mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-white/60 text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking wizard */}
        <section className="bg-slate-50 pb-20" aria-label="Booking form">
          <BookingWizard />
        </section>
      </main>

      <Footer />
    </>
  );
}
