import { X } from "lucide-react";

export default function DeclinedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
          <X size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Declined</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          The booking has been declined and the client has been notified with a polite message.
        </p>
      </div>
    </div>
  );
}
