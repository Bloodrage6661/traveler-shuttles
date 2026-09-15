import { NextRequest, NextResponse } from "next/server";
import { checkSlot } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const time = req.nextUrl.searchParams.get("time");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !/^\d{1,2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) and time (HH:MM) required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await checkSlot(date, time));
  } catch (err) {
    console.error("Slot check error:", err);
    // Fail open: don't block a booking if the check itself errors.
    return NextResponse.json({ available: true, message: "" });
  }
}
