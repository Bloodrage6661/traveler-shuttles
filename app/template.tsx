"use client";

import { usePathname } from "next/navigation";

// Re-keys on every route change so the CSS `page-enter` animation re-fires.
// Pure CSS with a visible resting state means content is never gated on JS.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
