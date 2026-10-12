import Link from "next/link";
import type { Metadata } from "next";
import {
  Plane, Car, Building2, Hotel, MapPin, Star, Grape,
  CheckCircle2, ArrowRight, Clock, ShieldCheck, ChevronRight, Users, Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingGate from "@/components/PricingGate";
import JourneyDeck from "@/components/JourneyDeck";
import { Reveal, RevealImage, Counter, WordRise } from "@/components/motion";

export const metadata: Metadata = {
  title: { absolute: "Traveler Shuttles and Tours | Cape Town Airport Transfers & Shuttle Service" },
  description: "Professional Cape Town airport shuttles, corporate transfers, and private transfers across the Western Cape. Transparent pricing, real-time flight tracking, driver-confirmed. Book online in minutes.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Traveler Shuttles and Tours | Cape Town Airport Transfers",
    description: "Professional airport shuttles, corporate transfers, and private transfers across the Western Cape.",
    type: "website",
  },
};

// Free stock lifestyle photography (Unsplash CDN). Swap these for Greg's own
// branded shots anytime — just replace the URLs.
const IMG = {
  capeTown: "https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=1920&q=70",
  car: "https://images.unsplash.com/photo-1681164823899-2715b1eb3dad?auto=format&fit=crop&w=1400&q=72",
  vineyard: "https://images.unsplash.com/photo-1571113606406-f3ca1c36e7e7?auto=format&fit=crop&w=1400&q=72",
  airport: "https://images.unsplash.com/photo-1772991221654-49aa6e0a98bc?auto=format&fit=crop&w=1920&q=70",
};

const services = [
  { icon: Plane, title: "Airport Transfers", desc: "To and from Cape Town International Airport with real-time flight tracking, any hour of the day." },
  { icon: Building2, title: "Corporate Transport", desc: "Executive transfers on account. Reliable, punctual, and tailored to your business schedule." },
  { icon: Hotel, title: "Hotel & B&B Transfers", desc: "Partner rates for hospitality businesses arranging transfers on behalf of their guests." },
  { icon: MapPin, title: "Point-to-Point", desc: "Door-to-door transfers between any two locations across the Western Cape." },
];

const whyPoints = [
  { icon: ShieldCheck, title: "Driver-confirmed bookings", desc: "Every trip is personally accepted. No auto-bookings, no surprises." },
  { icon: Plane, title: "Live flight tracking", desc: "We watch your flight so your driver is there when you land — even if it's delayed." },
  { icon: Clock, title: "Any hour, door to door", desc: "Early mornings, late nights, 24/7 — picked up and dropped at the door." },
];

const testimonials = [
  { quote: "I must give 5★ to this company. Always on time. The drivers are very professional and reliable. We use them at least once a month and always feel safe even at night. The door-to-door pickup is such a bonus — they also do late evenings and very early morning pickups to the airport and back.", name: "Crystal De La Pierre", location: "Google review", accent: "#1B4D2E" },
  { quote: "Best and safest shuttle to use. Best pricing in the market.", name: "Nic Swanepoel", location: "Local Guide · Google review", accent: "#1B3A6B" },
  { quote: "Thanks Greg for your great service — a safe transfer to Cape Town Airport, smooth and carefree journey! Highly recommend if you want a hassle-free journey in and around Cape Town.", name: "Ilze Brand", location: "Google review", accent: "#1B4D2E" },
];

const areas = [
  "Cape Town CBD", "V&A Waterfront", "Stellenbosch", "Franschhoek", "Paarl",
  "Somerset West", "George", "Langebaan", "Bloubergstrand",
  "Constantia", "All CTIA transfers",
];

const stats = [
  { value: "500+", label: "Transfers completed" },
  { value: "5★", label: "Client rated" },
  { value: "3", label: "Passenger tiers" },
  { value: "24/7", label: "Service availability" },
];

const tripTypes = ["To Airport", "From Airport", "Point-to-point"];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section
          className="relative min-h-[100svh] flex items-center pt-32 pb-16 px-4 sm:px-6 overflow-hidden"
          style={{ backgroundColor: "#0F2B1A" }}
          aria-labelledby="hero-heading"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.capeTown}
            alt="Cape Town with Table Mountain and the coastline"
            className="absolute inset-0 w-full h-full object-cover object-[center_42%]"
            fetchPriority="high"
          />
          <div className="absolute inset-0" aria-hidden="true" style={{
            background: "linear-gradient(135deg, rgba(15,43,26,0.92) 0%, rgba(27,77,46,0.55) 42%, rgba(27,58,107,0.72) 100%)"
          }} />
          <div className="absolute inset-0" aria-hidden="true" style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, transparent 28%, transparent 60%, rgba(15,43,26,0.55) 100%)"
          }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }} aria-hidden="true" />

          <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
            {/* Left: headline */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-7">
                <Plane size={12} aria-hidden="true" /> Cape Town International Airport Shuttle
              </div>
              <h1 id="hero-heading" className="font-bold text-white leading-[1.05] mb-6" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
                <WordRise text="Your Cape Town" /><br />
                <WordRise text="Transfer, Sorted." step={0.06} />
              </h1>
              <p className="text-white/70 text-lg sm:text-xl max-w-xl leading-relaxed mb-8">
                Professional airport shuttles, corporate transfers and private chauffeur service across the Western Cape.
                Transparent pricing. Confirmed bookings. Zero hassle.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Flight tracking included", "Door-to-door", "Pay on the day"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-sm px-4 py-2 rounded-full">
                    <CheckCircle2 size={14} className="text-[#C9A84C]" aria-hidden="true" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Book-a-trip card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 p-6 sm:p-7 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#1B4D2E]/10 text-[#1B4D2E]"><Car size={18} aria-hidden="true" /></span>
                <h2 className="font-bold text-slate-900 text-lg">Book your transfer</h2>
              </div>
              <p className="text-slate-500 text-sm mb-5">Get a fare in under a minute — you&apos;re not charged now.</p>

              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">I need a…</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {tripTypes.map((t) => (
                  <Link key={t} href="/book" className="text-center rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-700 hover:border-[#1B4D2E] hover:text-[#1B4D2E] hover:bg-[#1B4D2E]/[0.03] transition">
                    {t}
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 mb-5">
                <span className="flex items-center gap-2 text-sm text-slate-600"><Users size={15} className="text-slate-400" aria-hidden="true" /> Passengers</span>
                <span className="text-sm font-semibold text-slate-800">1–3</span>
              </div>

              <Link href="/book" className="w-full inline-flex items-center justify-center gap-2 bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
                Book a Transfer <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="tel:+27766432418" className="w-full mt-2.5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1B3A6B] py-2 transition-colors">
                <Phone size={14} aria-hidden="true" /> Or call 076 643 2418
              </a>
              <p className="text-[11px] text-slate-400 text-center mt-1">Driver confirms within the hour · No payment now</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-5 left-0 right-0 z-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto bg-white/8 border border-white/12 backdrop-blur-sm rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <Counter value={value} className="text-xl sm:text-2xl font-bold text-[#C9A84C] tabular-nums" />
                  <p className="text-white/55 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="services-heading">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">What We Offer</p>
              <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Transfer Solutions for Every Need</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-500 max-w-xl mx-auto">From solo airport runs to corporate fleets and group events — professional transfers tailored to you.</p>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.08} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-[#C9A84C]/40 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mb-4">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                  <Link href="/services" className="inline-flex items-center gap-1 text-[#1B3A6B] text-sm font-semibold hover:gap-2 transition-all">
                    Learn more <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why travel with us (image split) ── */}
        <section id="fleet" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF] scroll-mt-24" aria-labelledby="why-heading">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="relative order-1 lg:order-none">
              <RevealImage src={IMG.car} alt="Passenger relaxing in the back of a chauffeured car" className="rounded-3xl aspect-[4/3] shadow-xl" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-white/95 backdrop-blur rounded-2xl pl-3 pr-4 py-2.5 shadow-lg">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]"><Star size={16} fill="#C9A84C" aria-hidden="true" /></span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-slate-900">5.0 rating</p>
                  <p className="text-[11px] text-slate-500">Trusted on Google</p>
                </div>
              </div>
            </div>
            <div>
              <Reveal>
                <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Experience</p>
                <h2 id="why-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Arrive Relaxed, Every Time</h2>
                <p className="text-slate-500 max-w-md mb-8">Sit back in a clean, air-conditioned vehicle with a professional driver who knows the Cape. We handle the logistics so you don&apos;t have to.</p>
              </Reveal>
              <div className="space-y-4">
                {whyPoints.map(({ icon: Icon, title, desc }, i) => (
                  <Reveal key={title} delay={i * 0.08} className="flex gap-4">
                    <span className="grid place-items-center shrink-0 w-11 h-11 rounded-xl bg-white border border-slate-100 text-[#1B4D2E] shadow-sm"><Icon size={19} aria-hidden="true" /></span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Journey (pinned pane deck) ── */}
        <JourneyDeck />

        {/* ── Winelands & tours (image split) ── */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="tours-heading">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <Reveal>
                <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3 flex items-center gap-2"><Grape size={14} aria-hidden="true" /> Beyond the Airport</p>
                <h2 id="tours-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Cape Winelands &amp; Scenic Day Trips</h2>
                <p className="text-slate-500 max-w-md mb-6">Make a day of it. We&apos;ll take you through Stellenbosch, Franschhoek and the Constantia valley — or wherever the Cape calls. Comfortable, unhurried, and planned around you.</p>
                <ul className="space-y-2 mb-8">
                  {["Private, at-your-own-pace day trips", "Wine estates, scenic routes & landmarks", "Your driver waits while you explore"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={15} className="text-[#1B4D2E] shrink-0" aria-hidden="true" /> {t}</li>
                  ))}
                </ul>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
                  Ask about a tour <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
            <div className="relative">
              <RevealImage src={IMG.vineyard} alt="Rows of vines in the Cape Winelands with mountains behind" className="rounded-3xl aspect-[4/3] shadow-xl" delay={0.05} />
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0F2B1A]/85 backdrop-blur text-white rounded-full pl-3 pr-4 py-2 shadow-lg">
                <Grape size={14} className="text-[#C9A84C]" aria-hidden="true" />
                <span className="text-xs font-semibold">Stellenbosch · Franschhoek · Constantia</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing gate ── */}
        <PricingGate />

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Client Reviews</p>
              <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto mb-4" aria-hidden="true" />
              <div className="flex justify-center gap-1" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#C9A84C" className="text-[#C9A84C]" aria-hidden="true" />)}
              </div>
              <p className="text-slate-500 text-sm mt-3">Rated <strong className="text-slate-700">5.0</strong> from real Google reviews</p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ quote, name, location, accent }, i) => (
                <Reveal key={name} delay={i * 0.08} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4" aria-label="5 stars">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#C9A84C" className="text-[#C9A84C]" aria-hidden="true" />)}
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
                </Reveal>
              ))}
            </div>
            <Reveal className="text-center mt-12">
              <a
                href="https://www.google.com/search?q=Traveler+Shuttles+and+Tours&ludocid=7520964266875884465#lrd=0x1dcc57b71d1318fd:0x685fd527278b13b1,1,,,"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#C9A84C] shadow-sm hover:shadow-md text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-full transition-all"
              >
                <Star size={16} fill="#C9A84C" className="text-[#C9A84C]" aria-hidden="true" />
                Read all our reviews on Google
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── Coverage ── */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F5EF]" aria-labelledby="coverage-heading">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Service Area</p>
              <h2 id="coverage-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">We Cover the Western Cape</h2>
              <div className="w-12 h-0.5 bg-[#C9A84C] rounded mx-auto" aria-hidden="true" />
            </Reveal>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <Reveal>
                <div className="flex flex-wrap gap-2 mb-8">
                  {areas.map((area) => (
                    <span key={area} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors">
                      {area}
                    </span>
                  ))}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  We operate across the entire Western Cape region. Whether you need a transfer from a wine estate in Franschhoek,
                  a business pickup in the CBD, or a point-to-point run across the Cape — we&apos;ve got you covered.
                  Contact us for destinations beyond 75&nbsp;km.
                </p>
                <Link href="/book" className="inline-flex items-center gap-2 bg-[#1B4D2E] hover:bg-[#246038] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
                  Check Your Route <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Reveal>
              <RevealImage src={IMG.capeTown} alt="Cape Town and the Western Cape coastline" className="rounded-3xl h-72 lg:h-80 shadow-xl" delay={0.05} />
            </div>
          </div>
        </section>

        {/* ── Final CTA (airport image) ── */}
        <section className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="cta-heading">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.airport} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />
          <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(135deg, rgba(15,43,26,0.94) 0%, rgba(27,77,46,0.80) 45%, rgba(27,58,107,0.90) 100%)" }} />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/70 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-7">
                <Plane size={12} aria-hidden="true" /> Ready when you are
              </div>
              <h2 id="cta-heading" className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">Book your transfer in minutes</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Transparent pricing, a driver who confirms within the hour, and nothing to pay until the day. Let&apos;s get you moving.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors">
                  Book a Transfer <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors">
                  <Building2 size={16} aria-hidden="true" /> Corporate accounts
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
