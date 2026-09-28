import { NextRequest, NextResponse } from "next/server";
import { sendEnquiry } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendWhatsAppAlert } from "@/lib/whatsapp";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const { name, email, phone, message, hp, elapsed, turnstileToken } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cloudflare Turnstile: if configured, a valid token is required. This also
    // stops bots that POST straight to this API (they can't produce a token).
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret) {
      const token = typeof turnstileToken === "string" ? turnstileToken : "";
      if (!token || token.length > 2048) {
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
      }
      let verify: { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[] } = { success: false };
      try {
        const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: AbortSignal.timeout(10_000),
          body: new URLSearchParams({ secret, response: token, remoteip: clientIp(req) }),
        });
        if (!r.ok) throw new Error(`siteverify ${r.status}`);
        verify = await r.json();
      } catch {
        return NextResponse.json({ error: "Verification unavailable. Please try again." }, { status: 400 });
      }

      // Optional allowlist of the frontend domains that may submit tokens.
      const allowedHosts = new Set(
        (process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map((h) => h.trim()).filter(Boolean),
      );
      const okAction = verify.action === "contact" || verify.action === undefined;
      const okHost = allowedHosts.size === 0 || (verify.hostname ? allowedHosts.has(verify.hostname) : false);

      if (!verify.success || !okAction || !okHost) {
        console.warn("Turnstile verification rejected:", {
          success: verify.success, action: verify.action, hostname: verify.hostname, errors: verify["error-codes"],
        });
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
      }
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
    // WhatsApp Greg the enquiry + a link to the dashboard.
    await sendWhatsAppAlert(
      `New enquiry from ${name}`,
      `${email}${phone ? " · " + phone : ""} — ${message}`,
      `${BASE_URL}/admin`,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
