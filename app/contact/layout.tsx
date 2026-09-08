import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Cape Town Shuttle Enquiries & Quotes",
  description: "Get in touch with Traveler Shuttles and Tours for airport transfers, corporate accounts, and quotes across Cape Town and the Western Cape. We respond within the hour.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Traveler Shuttles and Tours",
    description: "Questions, quotes, or corporate account enquiries for Cape Town shuttle and transfer services.",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
