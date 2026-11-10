import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEnquiry } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import { verifyTurnstile } from "@/lib/turnstile";
import { BUSINESS_CATEGORIES, CORPORATE_SERVICES } from "@/lib/corporate";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Corporate / partnership enquiry. Stored as a structured lead (ready to push to
// Zoho CRM later), emailed + WhatsApped to Greg. Marketing consent is recorded
// separately, with its time, and only when the box was ticked.
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`corporate:${clientIp(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    const b = await req.json();
    if (!(await verifyTurnstile(b.turnstileToken, clientIp(req)))) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
    // Honeypot: bots get a normal-looking success.
    if (str(b.hp)) return NextResponse.json({ ok: true });

    const lead = {
      company_name: str(b.companyName),
      contact_person: str(b.contactPerson),
      job_title: str(b.jobTitle) || null,
      email: str(b.email),
      phone: str(b.phone, 40),
      location: str(b.location),
      category: BUSINESS_CATEGORIES.includes(b.category) ? b.category : "Other",
      services: Array.isArray(b.services) ? b.services.filter((s: unknown) => CORPORATE_SERVICES.includes(s as string)) : [],
      monthly_requirements: str(b.monthly) || null,
      message: str(b.message, 3000) || null,
      marketing_consent: b.marketingConsent === true,
      marketing_consent_at: b.marketingConsent === true ? new Date().toISOString() : null,
      source: "Website",
    };
    if (!lead.company_name || !lead.contact_person || !/^\S+@\S+\.\S+$/.test(lead.email) || !lead.phone || !lead.location) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from("corporate_enquiries").insert(lead);
    if (error) console.error("corporate_enquiries insert failed (enquiry still emailed):", error.message);

    const message = [
      "CORPORATE / PARTNERSHIP ENQUIRY",
      `Company: ${lead.company_name}`,
      `Contact: ${lead.contact_person}${lead.job_title ? ` (${lead.job_title})` : ""}`,
      `Location: ${lead.location}`,
      `Category: ${lead.category}`,
      `Services: ${lead.services.join(", ") || "—"}`,
      `Monthly requirements: ${lead.monthly_requirements ?? "—"}`,
      `Marketing consent: ${lead.marketing_consent ? `Yes (${lead.marketing_consent_at})` : "No"}`,
      lead.message ? `\n${lead.message}` : "",
    ].join("\n");

    await Promise.allSettled([
      sendEnquiry({ name: `${lead.contact_person} — ${lead.company_name}`, email: lead.email, phone: lead.phone, message }),
      sendWhatsAppAlert(`New corporate enquiry: ${lead.company_name}`, `${lead.contact_person} · ${lead.category} · ${lead.services.join(", ")}`, `${BASE_URL}/admin`),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Corporate enquiry error:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
