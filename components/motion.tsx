"use client";

import { createElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Lenis smooth scrolling for the whole page. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.1, smoothWheel: true, touchMultiplier: 1.6 }}>
      {children}
    </ReactLenis>
  );
}

/**
 * Turns scroll reveals on. Until this runs (or if JS never runs) every `.rv`
 * element stays in its visible resting state, so content is never hidden behind
 * an animation that can't play (good for SEO and no-JS).
 */
export function MotionReady() {
  useIso(() => {
    document.documentElement.classList.add("motion-ok");
  }, []);
  return null;
}

/** Fires once when the element scrolls into view. */
function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

type Tag = "div" | "section" | "li" | "p" | "span" | "h2" | "figure";

/** Rises/fades into place when scrolled into view. `delay` (s) staggers siblings. */
export function Reveal({
  as = "div", delay = 0, className, children,
}: { as?: Tag; delay?: number; className?: string; children: React.ReactNode }) {
  const [ref, seen] = useInViewOnce<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      className: `rv${className ? " " + className : ""}`,
      "data-in": seen ? "" : undefined,
      style: delay ? ({ "--d": `${delay}s` } as React.CSSProperties) : undefined,
    },
    children,
  );
}

/** A photo that reveals with a clip-path wipe + slow zoom when scrolled into view. */
export function RevealImage({
  src, alt, className, imgClassName, delay = 0,
}: { src: string; alt: string; className?: string; imgClassName?: string; delay?: number }) {
  const [ref, seen] = useInViewOnce<HTMLElement>();
  return (
    <figure
      ref={ref as React.Ref<HTMLElement>}
      className={`rv img-reveal${className ? " " + className : ""}`}
      data-in={seen ? "" : undefined}
      style={delay ? ({ "--d": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName} />
    </figure>
  );
}

/** Counts up to the number in `value` when scrolled into view, keeping any suffix (e.g. "500+", "5★"). */
export function Counter({ value, className }: { value: string; className?: string }) {
  const [ref, seen] = useInViewOnce<HTMLSpanElement>();
  // Only count values that are a single number + non-digit suffix ("500+",
  // "5★", "3"). Leave things like "24/7" static.
  const m = /^(\d+)([^\d]*)$/.exec(value.trim());
  const target = m ? parseInt(m[1], 10) : null;
  const suffix = m ? m[2] : "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen || target == null) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]);

  return (
    <span ref={ref} className={className}>
      {target == null ? value : `${n}${suffix}`}
    </span>
  );
}

/** Splits a heading into words that rise out of a mask, staggered, on mount. */
export function WordRise({ text, className, step = 0.06 }: { text: string; className?: string; step?: number }) {
  const [on, setOn] = useState(false);
  useIso(() => { setOn(true); }, []);
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="wr-word">
          <span className="wr-inner" data-in={on ? "" : undefined} style={{ "--d": `${i * step}s` } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
