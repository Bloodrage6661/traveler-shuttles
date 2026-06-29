import { Check } from "lucide-react";

export default function AcceptedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#1B4D2E]/10 flex items-center justify-center text-[#1B4D2E] mx-auto mb-4">
          <Check size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Accepted</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          The booking has been confirmed and the client notified. A calendar event has been created on your Google Calendar.
        </p>
      </div>
    </div>
  );
}
