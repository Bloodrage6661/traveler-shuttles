import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const SESSION_MS = 4 * 60 * 60 * 1000; // 4 hours

// Fail closed: no hard-coded fallbacks. If the secret isn't configured, the
// admin panel simply cannot authenticate anyone.
function getSecret(): string | null {
  const s = process.env.COOKIE_SECRET;
  return s && s.length >= 16 ? s : null;
}

function sign(value: string, secret: string) {
  return value + "." + crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Validates the signed session cookie: correct signature, and not expired. */
export function verifyAdminCookie(signed: string | undefined): boolean {
  const secret = getSecret();
  if (!secret || !signed) return false;
  const last = signed.lastIndexOf(".");
  if (last < 0) return false;
  const value = signed.slice(0, last); // "authenticated.<expiryMs>"
  if (!safeEqual(sign(value, secret), signed)) return false;
  const [tag, expStr] = value.split(".");
  if (tag !== "authenticated") return false;
  const exp = Number(expStr);
  return Number.isFinite(exp) && Date.now() < exp;
}

export async function POST(req: NextRequest) {
  // Throttle password attempts per IP to blunt brute force.
  if (!rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const secret = getSecret();
  const expected = process.env.ADMIN_PASSWORD;
  if (!secret || !expected) {
    console.error("Admin login not configured: set ADMIN_PASSWORD and COOKIE_SECRET.");
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !safeEqual(password, expected)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const value = `authenticated.${Date.now() + SESSION_MS}`;
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", sign(value, secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", { httpOnly: true, secure: true, maxAge: 0, sameSite: "lax", path: "/" });
  return res;
}
