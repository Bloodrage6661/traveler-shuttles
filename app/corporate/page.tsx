import type { Metadata } from "next";
import { Building2, Plane, Grape, Users, Ship } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CorporateForm from "@/components/CorporateForm";
import { Pane } from "@/components/motion";

export const metadata: Metadata = {
  title: "Corporate Transportation & Travel Partnerships",
  description: "Reliable transportation partner for hotels, guesthouses, travel agents, tour operators, cruise operators and corporate businesses in Cape Town and the Winelands.",
  alternates: { canonical: "/corporate" },
};

const offers = [
  { icon: Plane, t: "Airport transfers" },
  { icon: Building2, t: "Corporate & executive transport" },
  { icon: Grape, t: "Peninsula & Winelands tours" },
  { icon: Ship, t: "Cruise & crew transport" },
  { icon: Users, t: "Small-group transport" },
];

export default function CorporatePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Pane fx="shutter">
          <section className="py-24 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }} aria-labelledby="corp-heading">
            <div className="max-w-3xl mx-auto">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Business partnerships</p>
              <h1 id="corp-heading" className="text-3xl sm:text-5xl font-bold text-white mb-4">Corporate Transportation &amp; Travel Partnerships</h1>
              <p className="text-white/80 text-lg font-medium mb-5">Reliable Transportation. Personal Service. Professional Partnerships.</p>
              <p className="text-white/65 max-w-2xl mx-auto">
                Traveler Shuttles &amp; Tours offers personalised transportation solutions for businesses, accommodation establishments,
                travel professionals and international visitors.
              </p>
            </div>
          </section>
        </Pane>

        <Pane fx="wipe">
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-label="Corporate enquiry">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
              <div>
                <p className="text-slate-600 mb-4">
                  Our services include airport transfers, corporate transportation, private Cape Town excursions, Cape Winelands tours and small-group transportation.
                </p>
                <p className="text-slate-600 mb-4">
                  We welcome enquiries from hotels, guesthouses, travel agencies, tour operators, cruise industry representatives and corporate businesses looking for a reliable local transportation partner.
                </p>
                <p className="text-slate-600 mb-6">
                  Whether you require regular airport transfers, private excursions or transportation for international visitors, we would welcome the opportunity to work with you.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {offers.map(({ icon: Icon, t }) => (
                    <li key={t} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#1B4D2E]/10 text-[#1B4D2E]"><Icon size={17} aria-hidden="true" /></span>{t}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-[#1B3A6B]">Contact us to discuss a business partnership.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="font-bold text-2xl text-slate-900 mb-6">Corporate enquiry</h2>
                <CorporateForm />
              </div>
            </div>
          </section>
        </Pane>
      </main>
      <Footer />
    </>
  );
}
