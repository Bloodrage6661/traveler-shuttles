import Link from "next/link";
import type { Metadata } from "next";
import { Plane, Building2, Hotel, MapPin, Users, Route, Car, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Shuttle Services | Airport Transfers, Corporate & Private | Traveler Shuttles",
  description: "Full range of shuttle and transfer services across Cape Town and the Western Cape — airport, corporate, hotel, point-to-point, group, and long distance.",
  openGraph: {
    title: "Shuttle Services | Traveler Shuttles and Tours",
    description: "Airport transfers, corporate transport, hotel shuttles and more across the Western Cape.",
    type: "website",
  },
};

const services = [
  {
    icon: Plane,
    title: "Airport Transfers",
    subtitle: "Cape Town International Airport — to & from",
    desc: "Our most popular service. We provide reliable, punctual transfers to and from Cape Town International Airport (CTIA) for individuals, families, and groups. Your driver monitors your flight in real time and adjusts pickup times automatically for delays — no stressful waits, no missed flights.",
    detail: "Available 24 hours a day, 7 days a week. Door-to-door service from your accommodation to the terminal, or from arrivals straight to your destination.",
    tiers: ["Corporate", "Hotel/B&B", "General"],
    points: ["Real-time flight tracking", "Meet & greet on request", "All hours, all days", "Up to 3 passengers"],
    color: "from-[#0F2B1A] to-[#1B4D2E]",
  },
  {
    icon: Building2,
    title: "Corporate Transport",
    subtitle: "Executive transfers on account",
    desc: "Designed for businesses with regular transfer needs. Open a corporate account and enjoy preferential rates, monthly invoicing, and a dedicated service level that keeps your team moving professionally. Executive vehicles, punctual drivers, and zero-hassle coordination.",
    detail: "Suitable for employee airport transfers, client pickups, inter-office travel, and VIP guest transport. Account holders receive priority booking and a dedicated contact.",
    tiers: ["Corporate"],
    points: ["Monthly invoicing", "Preferential rates", "Priority booking", "Dedicated account manager"],
    color: "from-[#132950] to-[#1B3A6B]",
  },
  {
    icon: Hotel,
    title: "Hotel & B&B Transfers",
    subtitle: "Hospitality partner rates",
    desc: "Hotels, guesthouses, and B&Bs that arrange transfers on behalf of their guests benefit from our hospitality partner programme. Coordinate multiple guest pickups and drop-offs under a single account with simplified billing.",
    detail: "We work directly with your front desk or concierge to ensure seamless guest experiences. Our drivers are professional, presentable, and familiar with the expectations of hospitality clients.",
    tiers: ["Hotel/B&B"],
    points: ["Partner account rates", "Multi-guest coordination", "Concierge-level service", "Flexible billing"],
    color: "from-[#1B4D2E] to-[#246038]",
  },
  {
    icon: MapPin,
    title: "Point-to-Point Transfers",
    subtitle: "Any origin to any destination",
    desc: "Need to get from A to B without it being an airport? Our point-to-point service covers any two locations within the Western Cape. Wine estates, hospitals, wedding venues, hotels, shopping centres — wherever you need to go.",
    detail: "Pricing is based on the distance band between your pickup and drop-off points, displayed clearly before you confirm your booking.",
    tiers: ["Corporate", "Hotel/B&B", "General"],
    points: ["Any Western Cape destination", "Transparent distance-based pricing", "1–3 passengers", "Return trips available"],
    color: "from-[#133820] to-[#1B3A6B]",
  },
  {
    icon: Users,
    title: "Group Transport",
    subtitle: "Up to 8 passengers",
    desc: "Travelling with a larger group? Our minibus service accommodates up to 8 passengers, ideal for corporate teams, tour groups, wedding parties, and families travelling together. One vehicle, one invoice, everyone arrives together.",
    detail: "Please enquire in advance for group bookings to confirm minibus availability on your preferred date. Group rates apply.",
    tiers: ["Corporate", "General"],
    points: ["Up to 8 passengers", "Minibus vehicle", "Group rate pricing", "Enquire for availability"],
    color: "from-[#0F2B1A] to-[#132950]",
  },
  {
    icon: Route,
    title: "Long Distance Travel",
    subtitle: "Beyond 75 km — custom quotes",
    desc: "For destinations beyond our standard 75km pricing bands — Garden Route, Hermanus, Langebaan, George, and further — we provide custom quotes based on your specific journey. No hidden fees, just a fair price for the distance covered.",
    detail: "Submit your booking request with your pickup and destination details and we&apos;ll respond with a personalised quote within the hour.",
    tiers: ["Corporate", "Hotel/B&B", "General"],
    points: ["Garden Route & beyond", "Custom quote within the hour", "Any passenger count", "Return journeys available"],
    color: "from-[#1B3A6B] to-[#224889]",
  },
  {
    icon: Car,
    title: "Private Chauffeur Service",
    subtitle: "Full-day or half-day hire",
    desc: "Require a driver at your disposal for a half-day or full-day? Our private chauffeur service gives you a professional driver and vehicle for as long as you need — perfect for corporate visitors, wine tours, day trips, or multi-stop itineraries.",
    detail: "Enquire via our contact form with your dates and requirements and we&apos;ll tailor a package to suit your needs.",
    tiers: ["Corporate", "General"],
    points: ["Half-day or full-day", "Multiple stops", "Flexible itinerary", "Professional presentation"],
    color: "from-[#1B4D2E] to-[#132950]",
  },
];

const tierColors: Record<string, string> = {
  "Corporate": "bg-[#1B3A6B]/10 text-[#1B3A6B]",
  "Hotel/B&B": "bg-[#1B4D2E]/10 text-[#1B4D2E]",
  "General": "bg-[#C9A84C]/15 text-[#7A5F1A]",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section
          className="py-24 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}
          aria-labelledby="services-hero-heading"
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mb-4">What We Offer</p>
            <h1 id="services-hero-heading" className="text-4xl sm:text-5xl font-bold text-white mb-5">
              Transfer Solutions<br />for Every Need
            </h1>
            <p className="text-white/65 text-lg max-w-xl mx-auto">
              From solo airport runs to full corporate fleets — professional transfers tailored to individuals, businesses, and hospitality partners.
            </p>
          </div>
        </section>

        {/* Services list */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col gap-16">
            {services.map(({ icon: Icon, title, subtitle, desc, detail, tiers, points, color }, idx) => (
              <section
                key={title}
                className="grid lg:grid-cols-[1fr_340px] gap-10 items-start"
                aria-labelledby={`service-${idx}`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id={`service-${idx}`} className="text-2xl font-bold text-slate-900">{title}</h2>
                      <p className="text-slate-400 text-sm">{subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-5">
                    {tiers.map((t) => (
                      <span key={t} className={`text-xs font-semibold px-3 py-1 rounded-full ${tierColors[t]}`}>{t}</span>
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-3">{desc}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{detail}</p>
                  <div className="mt-6">
                    <Link href="/book" className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#224889] text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
                      Book This Service <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">What&apos;s included</h3>
                  <ul className="space-y-3">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 size={15} className="text-[#1B4D2E] mt-0.5 shrink-0" aria-hidden="true" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                {idx < services.length - 1 && (
                  <div className="lg:col-span-2 border-b border-slate-100" aria-hidden="true" />
                )}
              </section>
            ))}
          </div>
        </div>

        {/* CTA */}
        <section
          className="py-20 px-4 sm:px-6 text-center"
          style={{ background: "linear-gradient(135deg, #1B4D2E, #1B3A6B)" }}
          aria-labelledby="services-cta-heading"
        >
          <h2 id="services-cta-heading" className="text-3xl font-bold text-white mb-4">Ready to Book?</h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">Choose your service, enter your details, and get your fare in seconds.</p>
          <Link href="/book" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-8 py-4 rounded-full transition-colors">
            Book a Transfer <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
