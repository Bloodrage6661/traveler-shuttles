import Link from "next/link";
import type { Metadata } from "next";
import {
  Plane, Car, Building2, Hotel, MapPin, Users, Route, Star,
  CheckCircle2, ArrowRight, Clock, Shield, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingGate from "@/components/PricingGate";

export const metadata: Metadata = {
  title: "Traveler Shuttles and Tours | Cape Town Airport Transfers & Shuttle Service",
  description: "Professional airport shuttles, corporate transfers, and private chauffeur service across the Western Cape. Book online in minutes.",
  openGraph: {
    title: "Traveler Shuttles and Tours | Cape Town Airport Transfers",
    description: "Professional airport shuttles, corporate transfers, and private chauffeur service across the Western Cape.",
    type: "website",
  },
};

const services = [
  { icon: Plane, title: "Airport Transfers", desc: "To and from Cape Town International Airport with real-time flight tracking, any hour of the day." },
  { icon: Building2, title: "Corporate Transport", desc: "Executive transfers on account. Reliable, punctual, and tailored to your business schedule." },
  { icon: Hotel, title: "Hotel & B&B Transfers", desc: "Partner rates for hospitality businesses arranging transfers on behalf of their guests." },
  { icon: MapPin, title: "Point-to-Point", desc: "Door-to-door transfers between any two locations across the Western Cape." },
  { icon: Users, title: "Group Transport", desc: "Up to 8 passengers. Minibus available on request for larger groups and events." },
  { icon: Route, title: "Long Distance", desc: "Garden Route, Hermanus, Langebaan and beyond. Custom quotes for extended journeys." },
];

const steps = [
  { n: "01", title: "Fill in your details", desc: "Your name, contact info, pickup and drop-off addresses." },
  { n: "02", title: "See your fare instantly", desc: "We measure the distance from your addresses — pricing is shown instantly, no surprises." },
  { n: "03", title: "Pick a date", desc: "Choose from available dates. The driver confirms within the hour." },
];


const fleet = [
  {
    name: "Sedan", cap: "1–3 passengers", color: "from-[#1B4D2E] to-[#246038]",
    features: ["Comfortable & air-conditioned", "Ample boot space", "Ideal for airport transfers", "Executive interior"],
  },
  {
    name: "SUV", cap: "1–3 passengers", color: "from-[#1B3A6B] to-[#224889]",
    features: ["Extra luggage capacity", "Elevated ride comfort", "Perfect for family trips", "Premium finish"],
  },
  {
    name: "Minibus", cap: "Up to 8 passengers", color: "from-[#133820] to-[#132950]",
    features: ["Group & event transfers", "High luggage volume", "Enquire for availability", "Coordinated service"],
  },
];

const testimonials = [
  { quote: "Punctual, professional and great value. We use them for all our hotel airport transfers.", name: "Cape Grace Hotel", location: "Cape Town", accent: "#1B4D2E" },
  { quote: "Our corporate account is seamlessly managed. Drivers are always on time, every time.", name: "ABC Logistics", location: "Bellville", accent: "#1B3A6B" },
  { quote: "Booked for a family airport run at 4am — driver was early, helped with luggage. Highly recommend.", name: "Sarah M.", location: "Stellenbosch", accent: "#1B4D2E" },
];

const areas = [
  "Cape Town CBD", "V&A Waterfront", "Stellenbosch", "Franschhoek", "Paarl",
  "Somerset West", "Hermanus", "George", "Langebaan", "Bloubergstrand",
  "Constantia", "Garden Route", "All CTIA transfers",
];

const stats = [
  { value: "500+", label: "Transfers completed" },
  { value: "5★", label: "Client rated" },
  { value: "3", label: "Passenger tiers" },
  { value: "24/7", label: "Service availability" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section
          className="relative min-h-screen flex flex-col justify-center pt-16 pb-20 px-4 sm:px-6 overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 45%, #1B3A6B 100%)" }}
          aria-labelledby="hero-heading"
        >
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }} aria-hidden="true" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-8">
              <Plane size={12} aria-hidden="true" /> Cape Town International Airport Shuttle
            </div>
            <h1 id="hero-heading" className="font-bold text-white leading-[1.1] mb-6" style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}>
              Your Cape Town Transfer,<br />Sorted.
            </h1>
            <p className="text-white/65 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Professional airport shuttles, corporate transfers, and private chauffeur service across the Western Cape.
              Transparent pricing. Confirmed bookings. Zero hassle.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Flight tracking included", "Door-to-door service", "Corporate accounts welcome"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-sm px-4 py-2 rounded-full">
                  <CheckCircle2 size={14} className="text-[#C9A84C]" aria-hidden="true" /> {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors text-base">
                Book a Transfer <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors text-base">
                View Services
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative z-10 max-w-4xl mx-auto w-full mt-20">
            <div className="bg-white/8 border border-white/12 backdrop-blur-sm rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-[#C9A84C]">{value}</p>
                  <p className="text-white/55 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="services-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">What We Offer</p>
              <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Transfer Solutions for Every Need</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-500 max-w-xl mx-auto">From solo airport runs to corporate fleets and group events — professional transfers tailored to you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-[#C9A84C]/40 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mb-4">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                  <Link href="/services" className="inline-flex items-center gap-1 text-[#1B3A6B] text-sm font-semibold hover:gap-2 transition-all">
                    Learn more <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="how-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Simple Process</p>
              <h2 id="how-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Book in 3 Simple Steps</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {steps.map(({ n, title, desc }, i) => (
                <div key={n} className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-[#C9A84C]/40 to-transparent" aria-hidden="true" />
                  )}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 relative z-10"
                    style={{ background: "linear-gradient(135deg, #1B4D2E, #1B3A6B)" }}>
                    {n}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/book" className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold px-8 py-4 rounded-full transition-colors">
                Start Booking <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing gate ── */}
        <PricingGate />

        {/* ── Fleet ── */}
        <section id="fleet" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="fleet-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our Fleet</p>
              <h2 id="fleet-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Comfortable, Reliable Vehicles</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-500 max-w-xl mx-auto">All vehicles are air-conditioned, well-maintained, and GPS tracked for your peace of mind.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fleet.map(({ name, cap, color, features }) => (
                <div key={name} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-[#C9A84C]/40 transition-all duration-200">
                  <div className={`h-44 bg-gradient-to-br ${color} flex items-center justify-center relative`} aria-hidden="true">
                    <Car size={56} className="text-white/25" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{cap}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-slate-900 mb-4">{name}</h3>
                    <ul className="space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={14} className="text-[#1B4D2E] shrink-0" aria-hidden="true" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Client Reviews</p>
              <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
              <div className="flex justify-center gap-1" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#C9A84C" className="text-[#C9A84C]" aria-hidden="true" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ quote, name, location, accent }) => (
                <div key={name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4" aria-label="5 stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#C9A84C" className="text-[#C9A84C]" aria-hidden="true" />)}
                  </div>
                  <blockquote className="text-slate-600 text-sm leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: accent }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{name}</p>
                      <p className="text-slate-400 text-xs">{location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coverage ── */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="coverage-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Service Area</p>
              <h2 id="coverage-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">We Cover the Western Cape</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto" aria-hidden="true" />
            </div>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {areas.map((area) => (
                    <span key={area} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors">
                      {area}
                    </span>
                  ))}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  We operate across the entire Western Cape region. Whether you need a transfer from a wine estate in Franschhoek,
                  a business pickup in the CBD, or a long-distance run to the Garden Route — we&apos;ve got you covered.
                  Contact us for destinations beyond 75km.
                </p>
                <Link href="/book" className="inline-flex items-center gap-2 bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
                  Check Your Route <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <div
                className="rounded-2xl h-72 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #0F2B1A 0%, #1B4D2E 40%, #1B3A6B 100%)" }}
                aria-label="Western Cape service area map placeholder"
              >
                <MapPin size={48} className="text-white/20 mb-3" aria-hidden="true" />
                <p className="text-white/70 font-semibold text-lg">Western Cape</p>
                <p className="text-white/40 text-sm mt-1">Cape Town & surrounds</p>
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Corporate CTA ── */}
        <section
          className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
          style={{ background: "linear-gradient(135deg, #0F2B1A 0%, #1B4D2E 45%, #1B3A6B 100%)" }}
          aria-labelledby="corporate-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
              <Building2 size={12} aria-hidden="true" /> Corporate & Hospitality Partners
            </div>
            <h2 id="corporate-heading" className="text-3xl sm:text-4xl font-bold text-white mb-5">Partner With Us</h2>
            <p className="text-white/65 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Register for a corporate or hotel account and receive preferential rates, priority service, and monthly invoicing.
              Designed for businesses and hospitality partners with regular transfer needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors">
                Register Interest <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/book" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors">
                View Partner Rates
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
