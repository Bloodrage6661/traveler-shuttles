export type PricingBand = "25km" | "50km" | "75km" | "custom";
export type CustomerTier = "Corporate" | "Hotel/B&B" | "General";

// Flat fare per passenger count — the SAME for every customer type (Corporate,
// Hotel/B&B, General) and every distance band up to 75 km. Market-test pricing
// from the client (2026-10-02). Trips over 75 km still get a custom quote.
const FLAT_FARES: Record<number, number> = {
  1: 380,
  2: 388,
  3: 395,
};

export function getBand(distanceKm: number): PricingBand {
  if (distanceKm <= 25) return "25km";
  if (distanceKm <= 50) return "50km";
  if (distanceKm <= 75) return "75km";
  return "custom";
}

// One flat price per passenger count; distance band and customer tier don't
// change it (tier is still recorded for the booking). >75 km → custom quote.
export function getFare(band: PricingBand, passengers: number, _tier: CustomerTier = "General"): number | null {
  if (band === "custom") return null;
  return FLAT_FARES[passengers] ?? FLAT_FARES[3];
}

// Surcharge added to the fare for trips on a Saturday or Sunday.
export const WEEKEND_SURCHARGE = 0.05;

// dateStr is "YYYY-MM-DD". Parsed as a local calendar date so the weekday is correct.
export function isWeekendDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

// Applies the weekend surcharge when the trip date falls on a Sat/Sun.
export function applyWeekendSurcharge(fare: number | null, dateStr: string | null): number | null {
  if (fare == null || !dateStr || !isWeekendDate(dateStr)) return fare;
  return Math.round(fare * (1 + WEEKEND_SURCHARGE));
}

export function formatRand(amount: number) {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

export const BAND_LABELS: Record<PricingBand, string> = {
  "25km":   "Up to 25 km",
  "50km":   "Up to 50 km",
  "75km":   "Up to 75 km",
  "custom": "Over 75 km",
};

export const TIER_LABELS: Record<CustomerTier, string> = {
  "Corporate": "Corporate",
  "Hotel/B&B": "Hotel / B&B",
  "General":   "General",
};

export const TIER_DESCRIPTIONS: Record<CustomerTier, string> = {
  "Corporate": "Registered business or account holder",
  "Hotel/B&B": "Hotel, guesthouse or B&B partner",
  "General":   "Individual traveller or once-off booking",
};
