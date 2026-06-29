import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const SECRET = process.env.COOKIE_SECRET ?? "traveler-shuttles-secret-2026";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function sign(value: string) {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(value);
  return value + "." + hmac.digest("base64url");
}

export function verifyAdminCookie(signed: string | undefined): boolean {
  if (!signed || !signed.includes(".")) return false;
  const last = signed.lastIndexOf(".");
  const value = signed.slice(0, last);
  return sign(value) === signed && value === "authenticated";
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const signed = sign("authenticated");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", signed, {
    httpOnly: true,
    maxAge: 4 * 60 * 60,
    sameSite: "lax",
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.redirect(`${BASE_URL}/admin`);
  res.cookies.delete("admin_session");
  return res;
}
