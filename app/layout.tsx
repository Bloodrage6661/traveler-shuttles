import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.travelershuttlesandtours.co.za"),
  title: {
    default: "Traveler Shuttles and Tours | Cape Town Airport Transfers & Shuttle Service",
    template: "%s | Traveler Shuttles and Tours",
  },
  description: "Reliable Cape Town airport transfers, corporate shuttles, and private transfers across the Western Cape. Transparent pricing, real-time flight tracking, and driver-confirmed bookings. Available 24/7.",
  applicationName: "Traveler Shuttles and Tours",
  keywords: [
    "Cape Town airport shuttle",
    "Cape Town airport transfer",
    "airport shuttle Cape Town",
    "shuttle service Cape Town",
    "Western Cape transfers",
    "corporate shuttle Cape Town",
    "CTIA airport transfer",
    "private transfer Cape Town",
    "hotel shuttle Cape Town",
    "airport taxi Cape Town",
  ],
  authors: [{ name: "Traveler Shuttles and Tours" }],
  creator: "Traveler Shuttles and Tours",
  publisher: "Traveler Shuttles and Tours",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "Traveler Shuttles and Tours | Cape Town Airport Transfers",
    description: "Airport transfers, corporate & private shuttles across Cape Town and the Western Cape. Transparent pricing, real-time flight tracking, available 24/7.",
    url: "https://www.travelershuttlesandtours.co.za",
    siteName: "Traveler Shuttles and Tours",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traveler Shuttles and Tours | Cape Town Airport Transfers",
    description: "Airport transfers, corporate & private shuttles across Cape Town and the Western Cape.",
  },
  category: "travel",
};

// Structured data (schema.org) — tells Google this is a Cape Town transport
// business, powering local/rich results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TaxiService"],
  "@id": "https://www.travelershuttlesandtours.co.za/#business",
  name: "Traveler Shuttles and Tours",
  description: "Cape Town airport transfers, corporate shuttles, and private transfers across the Western Cape.",
  url: "https://www.travelershuttlesandtours.co.za",
  logo: "https://www.travelershuttlesandtours.co.za/logo.png",
  image: "https://www.travelershuttlesandtours.co.za/opengraph-image.png",
  telephone: "+27766432418",
  priceRange: "R",
  areaServed: [
    { "@type": "City", name: "Cape Town" },
    { "@type": "AdministrativeArea", name: "Western Cape" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cape Town",
    addressRegion: "Western Cape",
    addressCountry: "ZA",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}

        {/* WhatsApp floating button */}
        <a
          href="https://wa.me/27766432418"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
            <MessageCircle size={26} className="text-white" aria-hidden="true" />
          </div>
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>
      </body>
    </html>
  );
}
