import { NextRequest, NextResponse } from "next/server";
import { getFare } from "@/lib/pricing";
import type { PricingBand } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const { band, passengers } = await req.json();
  if (!band || !passengers) {
    return NextResponse.json({ error: "Missing band or passengers" }, { status: 400 });
  }
  const fare = getFare(band as PricingBand, passengers);
  return NextResponse.json({ fare });
}
