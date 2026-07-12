import { NextRequest, NextResponse } from "next/server";
import { getUnavailableDates } from "@/lib/availability";
import { getGoogleCalendarBusyDates } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month param required (YYYY-MM)" }, { status: 400 });
  }
  try {
    // Combine dates Greg blocked manually in /admin with days he's busy in his Google Calendar.
    const [adminDates, calendarDates] = await Promise.all([
      getUnavailableDates(month),
      getGoogleCalendarBusyDates(month),
    ]);
    const busyDates = [...new Set([...adminDates, ...calendarDates])];
    return NextResponse.json({ busyDates });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json({ busyDates: [] });
  }
}
