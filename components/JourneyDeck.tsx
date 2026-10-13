"use client";

import { useEffect, useRef } from "react";
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    let raf = 0;

    const update = () => {
      const sec = sectionRef.current;
      const track = trackRef.current;
      if (!sec || !track) return;
      if (!mq.matches) { track.style.transform = ""; return; }
      const total = sec.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;
      track.style.transform = `translate3d(-${p * (panels.length - 1) * 100}vw, 0, 0)`;
      const active = Math.round(p * (panels.length - 1));
      dotsRef.current?.querySelectorAll<HTMLElement>("[data-dot]").forEach((d, i) => {
        d.classList.toggle("jd-dot-on", i === active);
      });
    };

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-label="How a Traveler trip works">
      {/* Desktop: pinned horizontal pane deck */}
      <div ref={sectionRef} className="hidden lg:block relative" style={{ height: `${panels.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
            <span className="w-8 h-0.5 bg-[#C9A84C] rounded" aria-hidden="true" />
            <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase">Your Journey with Traveler</span>
          </div>

          <div ref={trackRef} className="flex h-full" style={{ width: `${panels.length * 100}vw`, willChange: "transform", transition: "transform 0.08s linear" }}>
            {panels.map(({ n, tag, title, copy, icon: Icon, grad }) => (
              <div key={n} className="relative w-screen h-full shrink-0 flex items-center px-[8vw]" style={{ background: grad }}>
                {/* giant watermark number */}
                <span aria-hidden="true" className="pointer-events-none absolute right-[4vw] bottom-[-2vh] font-bold leading-none text-white/[0.06] select-none" style={{ fontSize: "42vh" }}>{n}</span>
                {/* dotted texture */}
                <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-[#C9A84C]"><Icon size={24} aria-hidden="true" /></span>
                    <span className="text-[#C9A84C] text-xs font-bold tracking-[0.25em] uppercase">Step {n} · {tag}</span>
                  </div>
                  <h3 className="text-white font-bold leading-[1.05] mb-5" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)" }}>{title}</h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-md">{copy}</p>
                  {n === panels[panels.length - 1].n && (
                    <Link href="/book" className="inline-flex items-center gap-2 mt-8 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-7 py-3.5 rounded-full transition-colors">
                      Book a Transfer <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* progress dots */}
          <div ref={dotsRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {panels.map((p, i) => (
              <span key={p.n} data-dot className={`jd-dot${i === 0 ? " jd-dot-on" : ""}`} aria-hidden="true" />
            ))}
          </div>
          <span className="absolute bottom-7 right-8 z-20 text-white/40 text-xs tracking-wide">Scroll to continue →</span>
        </div>
      </div>

      {/* Mobile: clean stacked cards */}
      <div className="lg:hidden px-4 sm:px-6 py-16 bg-[#0F2B1A] overflow-x-clip">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-8 h-0.5 bg-[#C9A84C] rounded" aria-hidden="true" />
          <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase">Your Journey with Traveler</span>
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          {panels.map(({ n, tag, title, copy, icon: Icon, grad }, i) => (
            <Reveal key={n} className={i % 2 ? "rv-r" : "rv-l"}>
            <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: grad }}>
              <span aria-hidden="true" className="pointer-events-none absolute right-2 -bottom-3 font-bold leading-none text-white/[0.07]" style={{ fontSize: "7rem" }}>{n}</span>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-[#C9A84C]"><Icon size={19} aria-hidden="true" /></span>
                  <span className="text-[#C9A84C] text-[11px] font-bold tracking-[0.2em] uppercase">Step {n} · {tag}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{copy}</p>
              </div>
            </div>
            </Reveal>
          ))}
          <Link href="/book" className="w-full inline-flex items-center justify-center gap-2 mt-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-7 py-3.5 rounded-full transition-colors">
            Book a Transfer <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
