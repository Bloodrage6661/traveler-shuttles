import { NextRequest, NextResponse } from "next/server";
import { getBand, getFare } from "@/lib/pricing";
import type { CustomerTier } from "@/lib/pricing";

type Point = { lat: number; lon: number };

export async function POST(req: NextRequest) {
  const { pickup, dropoff, passengers, customerTier } = (await req.json()) as {
    pickup?: Point;
    dropoff?: Point;
    passengers?: number;
    customerTier?: CustomerTier;
  };

  if (!pickup?.lat || !pickup?.lon || !dropoff?.lat || !dropoff?.lon) {
    return NextResponse.json({ error: "Missing pickup or drop-off location" }, { status: 400 });
  }

  const apiKey = process.env.GEOAPIFY_SERVER_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Distance service not configured" }, { status: 500 });
  }

  // Geoapify Routing API — driving distance between the two points.
  // The waypoint separator "|" must be percent-encoded (%7C) or Node's fetch rejects the URL.
  const waypoints = `${pickup.lat},${pickup.lon}%7C${dropoff.lat},${dropoff.lon}`;
  const url =
    `https://api.geoapify.com/v1/routing` +
    `?waypoints=${waypoints}` +
    `&mode=drive&units=metric&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const meters = data?.features?.[0]?.properties?.distance;
    if (typeof meters !== "number") {
      return NextResponse.json(
        { error: "Could not calculate a driving route for those addresses" },
        { status: 422 }
      );
    }

    const distanceKm = Math.round((meters / 1000) * 10) / 10;
    const band = getBand(distanceKm);
    const fare = getFare(band, passengers ?? 1, customerTier ?? "General");

    return NextResponse.json({ distanceKm, band, fare });
  } catch (err) {
    console.error("calculate-fare routing error:", err);
    return NextResponse.json({ error: "Distance service unavailable" }, { status: 502 });
  }
}
