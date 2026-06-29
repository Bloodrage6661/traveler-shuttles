import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traveler Shuttles and Tours",
  description: "Book your airport transfer — Cape Town International Airport and beyond.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen antialiased">
        {children}

        {/* WhatsApp floating button */}
        <a
          href="https://wa.me/27000000000"
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
