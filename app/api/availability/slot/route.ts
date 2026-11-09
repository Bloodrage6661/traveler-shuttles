import { NextRequest, NextResponse } from "next/server";
import { checkSlot } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const time = req.nextUrl.searchParams.get("time");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !/^\d{1,2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) and time (HH:MM) required" }, { status: 400 });
  }
  try {
    // exclude: the booking being changed, so it doesn't clash with itself (the save re-checks this with auth).
    const exclude = req.nextUrl.searchParams.get("exclude") ?? undefined;
    return NextResponse.json(await checkSlot(date, time, exclude && /^[0-9a-f-]{36}$/i.test(exclude) ? exclude : undefined));
  } catch (err) {
    console.error("Slot check error:", err);
    // Fail open: don't block a booking if the check itself errors.
    return NextResponse.json({ available: true, message: "" });
  }
}
