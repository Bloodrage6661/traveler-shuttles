import Link from "next/link";
import { Plane, Phone, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="text-white"
      style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #0F2B1A 55%, #132950 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Plane size={17} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Traveler Shuttles and Tours</p>
                <p className="text-white/40 text-[11px] mt-0.5">South Africa</p>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Professional shuttle transfers and private chauffeur service across the Western Cape.
              Airport transfers, corporate accounts, and hospitality partnerships.
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <a
                href="https://wa.me/27000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#C9A84C] transition-colors"
              >
                <MessageCircle size={15} /> WhatsApp Us
              </a>
              <a href="tel:+27000000000" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#C9A84C] transition-colors">
                <Phone size={15} /> +27 00 000 0000
              </a>
              <a href="mailto:info@travelershuttles.co.za" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#C9A84C] transition-colors">
                <Mail size={15} /> info@travelershuttles.co.za
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Services</h3>
            <ul className="space-y-2.5">
              {[
                "Airport Transfers",
                "Corporate Transport",
                "Hotel & B&B",
                "Point-to-Point",
                "Group Transport",
                "Long Distance",
              ].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-white/60 hover:text-[#C9A84C] transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Book Online", href: "/book" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "POPIA", href: "/popia" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-[#C9A84C] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs">© 2026 Traveler Shuttles and Tours. All rights reserved.</p>
          <p className="text-white/25 text-xs">Cape Town, Western Cape, South Africa</p>
        </div>
      </div>
    </footer>
  );
}
