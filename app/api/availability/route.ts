import { NextRequest, NextResponse } from "next/server";
import { getUnavailableDates } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month param required (YYYY-MM)" }, { status: 400 });
  }
  try {
    const unavailableDates = await getUnavailableDates(month);
    return NextResponse.json({ busyDates: unavailableDates });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json({ busyDates: [] });
  }
}
