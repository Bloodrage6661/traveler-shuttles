"use client";

import { createElement, Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
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

/**
 * Fires once when the element's top scrolls into view (or is already above it).
 * A plain scroll-position check rather than IntersectionObserver: it can't
 * silently miss, so content is never left hidden. `early` fires as soon as the
 * element peeks in.
 */
function useInViewOnce<T extends HTMLElement>(early = false) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    const check = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().top < window.innerHeight * (early ? 0.96 : 0.9)) setSeen(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [seen, early]);
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

export type PaneFx = "rise" | "wipe" | "iris" | "split" | "zoom" | "diagonal" | "shutter";

/**
 * A whole section that arrives with its own pane transition when scrolled to.
 * The wrapper itself is never clipped (a fully clipped box never intersects),
 * the effect is applied to the section inside it.
 */
export function Pane({ fx, children }: { fx: PaneFx; children: React.ReactNode }) {
  // Start as soon as the section peeks in, so there is never a blank gap.
  const [ref, seen] = useInViewOnce<HTMLDivElement>(true);
  return <div ref={ref} className="pane" data-fx={fx} data-in={seen ? "" : undefined}>{children}</div>;
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
        <Fragment key={i}>
          <span className="wr-word">
            <span className="wr-inner" data-in={on ? "" : undefined} style={{ "--d": `${i * step}s` } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}
