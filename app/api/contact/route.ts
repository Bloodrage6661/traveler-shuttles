import { NextRequest, NextResponse } from "next/server";
import { sendEnquiry } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await sendEnquiry({ name, email, phone, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
