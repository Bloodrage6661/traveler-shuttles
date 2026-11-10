import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy & POPIA",
  description: "How Traveler Shuttles & Tours collects, uses and protects your personal information under POPIA.",
  alternates: { canonical: "/privacy" },
};

const sections: [string, string][] = [
  ["What we collect", "When you book, enquire or create an account we collect the details you give us: your name, email address, phone number, pickup and drop-off addresses, travel dates, passenger numbers, flight numbers, company details and anything you write in a message (such as dietary or medical notes for tours)."],
  ["Why we collect it", "We use your information only to provide and confirm your transport or tour, communicate with you about your booking or enquiry, manage business partnerships, and meet our legal and accounting obligations."],
  ["Marketing", "We only send you marketing about our services and offers if you have actively agreed to it (the consent box is never pre-ticked). We record when you gave consent, and you can withdraw it at any time by contacting us. Submitting an enquiry or booking never subscribes you to marketing."],
  ["Sharing", "We do not sell your information. We share it only with service providers who help us run the business (such as our booking database, email delivery and, in future, our customer-relationship system), under appropriate safeguards, or where the law requires it."],
  ["Security & retention", "Your information is sent over secure (HTTPS) connections and stored with access limited to our team. We keep it only as long as needed for the purposes above or as required by law."],
  ["Your rights", "Under the Protection of Personal Information Act (POPIA) you may ask to see, correct or delete the personal information we hold about you, object to its use, or withdraw marketing consent. You may also lodge a complaint with the Information Regulator of South Africa."],
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-slate-50">
        <section className="py-20 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(160deg, #0F2B1A 0%, #1B4D2E 50%, #1B3A6B 100%)" }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy &amp; POPIA</h1>
        </section>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
          {sections.map(([h, p]) => (
            <div key={h}>
              <h2 className="font-bold text-slate-900 text-lg mb-2">{h}</h2>
              <p className="text-slate-600 leading-relaxed">{p}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-white border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-2">Privacy requests &amp; contact</h2>
            <p className="text-slate-600">Traveler Shuttles &amp; Tours, Cape Town<br />
              Email: <a className="text-[#1B3A6B] underline" href="mailto:traveler@unicape.co.za">traveler@unicape.co.za</a><br />
              Phone / WhatsApp: <a className="text-[#1B3A6B] underline" href="tel:+27766432418">076 643 2418</a></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
