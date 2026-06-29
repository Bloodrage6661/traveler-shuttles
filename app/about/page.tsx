import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Shield, Star, CheckCircle2, ArrowRight, Plane, Users, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us | Traveler Shuttles and Tours — Cape Town",
  description: "Learn about Traveler Shuttles and Tours — a professional Cape Town shuttle and transfer service committed to reliability, transparency, and professionalism.",
  openGraph: {
    title: "About Us | Traveler Shuttles and Tours",
    description: "Professional Cape Town shuttle service committed to reliability, transparency, and professionalism.",
    type: "website",
  },
};

const values = [
  { icon: Clock, title: "Punctuality", desc: "Your time is valuable. We track flights, monitor traffic, and plan ahead so every transfer departs and arrives exactly on time.", color: "#1B4D2E" },
  { icon: Shield, title: "Transparency", desc: "No hidden fees. No surprise surcharges. The price you see when you book is the price you pay — every time.", color: "#1B3A6B" },
  { icon: Star, title: "Professionalism", desc: "Licensed drivers, well-maintained vehicles, and a service standard that reflects the quality your journey deserves.", color: "#C9A84C" },
];

const whyUs = [
  { icon: Plane, text: "Real-time flight tracking on all airport transfers" },
  { icon: MapPin, text: "Door-to-door service — no shuttling between points" },
  { icon: Shield, text: "Fully licensed and insured for passenger transport" },
  { icon: Clock, text: "Available 24 hours a day, 7 days a week" },
  { icon: Users, text: "Corporate accounts with monthly invoicing" },
  { icon: Phone, text: "Direct driver contact — no call centres" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section
          className="py-24 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}
          aria-labelledby="about-heading"
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Who We Are</p>
            <h1 id="about-heading" className="text-4xl sm:text-5xl font-bold text-white mb-5">
              About Traveler Shuttles and Tours
            </h1>
            <p className="text-white/65 text-lg max-w-xl mx-auto">
              A Cape Town shuttle service built on three principles — reliability, transparency, and professionalism.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="story-heading">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our Story</p>
              <h2 id="story-heading" className="text-3xl font-bold text-slate-900 mb-4">Cape Town, from the ground up</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mb-6" aria-hidden="true" />
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Traveler Shuttles and Tours was founded to solve a simple problem: the gap between professional, reliable transfers
                  and the uncertainty that often comes with booking transport in Cape Town. Too many travellers arrived to find no
                  driver, or departed with no idea what they&apos;d be charged.
                </p>
                <p>
                  We started with airport transfers — the highest-stakes journey most travellers make — and built a system around
                  real-time flight tracking, confirmed bookings, and transparent pricing. That foundation has grown into a full
                  transfer service covering corporate clients, hospitality partners, and private travellers across the Western Cape.
                </p>
                <p>
                  Every booking is personally confirmed. Every driver is professionally licensed. Every fare is agreed upfront.
                  That&apos;s not a promise — it&apos;s just how we operate.
                </p>
              </div>
            </div>
            <div
              className="rounded-2xl h-80 flex flex-col items-center justify-center relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #0F2B1A 0%, #1B4D2E 40%, #1B3A6B 100%)" }}
              aria-hidden="true"
            >
              <Plane size={64} className="text-white/15 mb-4" />
              <p className="text-white/60 font-semibold text-xl">Traveler Shuttles</p>
              <p className="text-white/35 text-sm mt-1">Cape Town, South Africa</p>
              <div className="absolute bottom-6 left-6 right-6 bg-white/8 border border-white/15 rounded-xl p-4">
                <p className="text-white/80 text-sm font-medium">Professional transfers since day one</p>
                <p className="text-white/40 text-xs mt-0.5">Airport · Corporate · Private</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="mission-heading">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our Mission</p>
            <h2 id="mission-heading" className="text-3xl font-bold text-slate-900 mb-4">Why we do what we do</h2>
            <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-6" aria-hidden="true" />
            <blockquote className="text-xl text-slate-600 leading-relaxed italic font-light">
              &ldquo;To provide reliable, transparent, and professional shuttle transfers that give every traveller — from a first-time
              visitor to a regular corporate client — the confidence that they will arrive on time, in comfort, and without surprises.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="values-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">What We Stand For</p>
              <h2 id="values-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center hover:shadow-md hover:border-[#C9A84C]/40 transition-all duration-200">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${color}18`, color }}>
                    <Icon size={26} aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="why-heading">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Why Us</p>
              <h2 id="why-heading" className="text-3xl font-bold text-slate-900 mb-4">Why choose Traveler Shuttles?</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mb-8" aria-hidden="true" />
              <ul className="space-y-4">
                {whyUs.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] shrink-0">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <p className="text-slate-600 leading-relaxed pt-2">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {[
                { val: "500+", label: "Transfers completed" },
                { val: "5★", label: "Average client rating" },
                { val: "24/7", label: "Service availability" },
                { val: "0", label: "Hidden fees, ever" },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-6">
                  <p className="text-3xl font-bold text-[#1B3A6B] min-w-[80px]">{val}</p>
                  <p className="text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-20 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(135deg, #1B4D2E, #1B3A6B)" }}
          aria-labelledby="about-cta-heading"
        >
          <h2 id="about-cta-heading" className="text-3xl font-bold text-white mb-4">Ready to travel with us?</h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">Book your transfer online in minutes, or contact us to discuss your requirements.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors">
              Book a Transfer <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors">
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
