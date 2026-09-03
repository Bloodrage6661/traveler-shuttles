import { NextRequest, NextResponse } from "next/server";
import { getFlightStatus } from "@/lib/flight";

// Live flight lookup: /api/flight-status?flight=BA349&date=2026-09-10
// Always fresh (no caching) so the admin panel shows real-time status.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const flight = req.nextUrl.searchParams.get("flight")?.trim();
  const date = req.nextUrl.searchParams.get("date")?.trim();

  if (!flight || !date) {
    return NextResponse.json({ error: "Missing flight or date" }, { status: 400 });
  }

  if (!process.env.AERODATABOX_RAPIDAPI_KEY) {
    return NextResponse.json({ error: "Flight tracking not configured", status: null }, { status: 200 });
  }

  const status = await getFlightStatus(flight, date);
  return NextResponse.json(
    { status },
    { headers: { "Cache-Control": "no-store" } }
  );
}
