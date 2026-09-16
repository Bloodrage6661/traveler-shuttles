import { NextRequest, NextResponse } from "next/server";
import { sendEnquiry } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const { name, email, phone, message, hp, elapsed } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Spam filters — for bots we return a normal success so they don't learn
    // they were blocked, but we never send the email.
    const honeypotFilled = typeof hp === "string" && hp.trim() !== "";
    const tooFast = typeof elapsed === "number" && elapsed < 2500;
    // Real enquiries contain words; the spam we get is just a phone number.
    const messageHasNoLetters = !/[a-z]/i.test(String(message));

    if (honeypotFilled || tooFast || messageHasNoLetters) {
      console.warn("Contact spam dropped:", {
        email,
        reason: honeypotFilled ? "honeypot" : tooFast ? "timing" : "no-letters",
      });
      return NextResponse.json({ ok: true });
    }

    await sendEnquiry({ name, email, phone, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
