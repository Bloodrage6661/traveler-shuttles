export default function InvalidPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0F2B1A, #1B3A6B)" }}>
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h1>
        <p className="text-slate-500 text-sm">This confirmation link is invalid or has expired.</p>
      </div>
    </div>
  );
}
