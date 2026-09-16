import type { NextConfig } from "next";
import path from "node:path";

// React/Turbopack use eval() in development only; production never does.
// Cloudflare Turnstile (bot check on the contact form) loads its script here.
const scriptSrc = process.env.NODE_ENV === "production"
  ? "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Turnstile renders its widget in an iframe.
  "frame-src https://challenges.cloudflare.com",
  // Browser talks to Supabase (auth/db), Geoapify (autocomplete), Turnstile.
  "connect-src 'self' https://*.supabase.co https://api.geoapify.com https://challenges.cloudflare.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  // Pin the workspace root so Turbopack doesn't misdetect it from a parent
  // lockfile (C:\Users\bloodrage\package-lock.json), which broke the RSC manifest.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
