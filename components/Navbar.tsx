"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Fleet", href: "/#fleet" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace("/#", "/"));

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || open
            ? "linear-gradient(90deg, #133820 0%, #132950 100%)"
            : "transparent",
          boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Plane size={17} className="text-white" />
              </div>
              <div className="leading-none">
                <p className="text-white font-bold text-sm leading-tight">Traveler Shuttles and Tours</p>
                <p className="text-white/45 text-[11px] mt-0.5">South Africa</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive(l.href)
                      ? "text-[#C9A84C]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <Link href="/dashboard" className="ml-3 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-colors">
                  <LayoutDashboard size={14} aria-hidden="true" /> Dashboard
                </Link>
              ) : (
                <Link href="/login" className="ml-2 text-white/70 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                  Sign in
                </Link>
              )}
              <Link
                href="/book"
                className="ml-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Book a Transfer
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="md:hidden border-t border-white/10 px-4 pb-4 pt-2"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? "text-[#C9A84C] bg-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-colors">
                <LayoutDashboard size={15} aria-hidden="true" /> Dashboard
              </Link>
            ) : (
              <Link href="/login" className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-colors">
                Sign in
              </Link>
            )}
            <Link
              href="/book"
              className="block mt-2 bg-[#C9A84C] hover:bg-[#D4B870] text-[#133820] font-bold px-4 py-3 rounded-xl text-sm text-center transition-colors"
            >
              Book a Transfer
            </Link>
          </div>
        )}
      </header>
      {/* Spacer for non-hero pages */}
      {pathname !== "/" && <div className="h-16 sm:h-18" style={{ background: "linear-gradient(90deg, #133820 0%, #132950 100%)" }} />}
    </>
  );
}
