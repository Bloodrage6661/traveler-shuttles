"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion";
import { PencilLine, ShieldCheck, Plane, ArrowRight } from "lucide-react";

type Panel = {
  n: string; tag: string; title: string; copy: string;
  icon: React.ElementType; grad: string;
};

const panels: Panel[] = [
  {
    n: "01", tag: "Book", title: "Tell us your trip",
    copy: "Pickup, drop-off and when — it takes under a minute, and you'll see your fare instantly. No payment to book.",
    icon: PencilLine, grad: "linear-gradient(135deg, #0F2B1A 0%, #1B4D2E 55%, #246038 100%)",
  },
  {
    n: "02", tag: "Confirm", title: "We confirm it personally",
    copy: "No automated bookings. Your driver reviews every request and confirms — usually within the hour.",
    icon: ShieldCheck, grad: "linear-gradient(135deg, #10243f 0%, #1B3A6B 55%, #2b5aa0 100%)",
  },
  {
    n: "03", tag: "Travel", title: "We get you there",
    copy: "Door-to-door, flight-tracked and on time. Relax in the back — pay on the day, not before.",
    icon: Plane, grad: "linear-gradient(135deg, #1B4D2E 0%, #1B3A6B 60%, #0F2B1A 100%)",
  },
];

export default function JourneyDeck() {
  return (
    <section aria-label="How a Traveler trip works" className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-[#0F2B1A] overflow-x-clip">
      <div className="flex items-center gap-2 mb-8 lg:mb-12 justify-center">
        <span className="w-8 h-0.5 bg-[#C9A84C] rounded" aria-hidden="true" />
        <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase">Your Journey with Traveler</span>
      </div>
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 max-w-md lg:max-w-6xl mx-auto">
        {panels.map(({ n, tag, title, copy, icon: Icon, grad }, i) => (
          <Reveal key={n} delay={i * 0.1} className={i % 2 ? "rv-r" : "rv-l"}>
            <div className="relative h-full rounded-2xl p-6 lg:p-8 overflow-hidden" style={{ background: grad }}>
              <span aria-hidden="true" className="pointer-events-none absolute right-2 -bottom-3 font-bold leading-none text-white/[0.07]" style={{ fontSize: "7rem" }}>{n}</span>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-[#C9A84C]"><Icon size={19} aria-hidden="true" /></span>
                  <span className="text-[#C9A84C] text-[11px] font-bold tracking-[0.2em] uppercase">Step {n} · {tag}</span>
                </div>
                <h3 className="text-white font-bold text-xl lg:text-2xl mb-2">{title}</h3>
                <p className="text-white/70 text-sm lg:text-base leading-relaxed">{copy}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="text-center mt-8 lg:mt-12">
        <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-7 py-3.5 rounded-full transition-colors">
          Book a Transfer <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
