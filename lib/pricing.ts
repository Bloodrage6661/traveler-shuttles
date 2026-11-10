export type PricingBand = "25km" | "50km" | "75km" | "custom";
export type CustomerTier = "Corporate" | "Hotel/B&B" | "General";

// Greg's price list (Nov 2026): trip TOTAL for 1, 2 and 3 passengers, by
// distance band and customer type (rate per person × passengers, as on his
// sheet). More than 3 passengers, or over 75 km, is a custom quote.
const TOTALS: Record<Exclude<PricingBand, "custom">, Record<CustomerTier, [number, number, number]>> = {
  "25km": { Corporate: [390, 761, 1114],   "Hotel/B&B": [429, 837, 1225],   General: [472, 921, 1347] },
  "50km": { Corporate: [600, 1171, 1713],  "Hotel/B&B": [660, 1288, 1885],  General: [726, 1417, 2073] },
  "75km": { Corporate: [1000, 1951, 2855], "Hotel/B&B": [1100, 2146, 3141], General: [1210, 2361, 3455] },
};

export function getBand(distanceKm: number): PricingBand {
  if (distanceKm <= 25) return "25km";
  if (distanceKm <= 50) return "50km";
  if (distanceKm <= 75) return "75km";
  return "custom";
}

export function getFare(band: PricingBand, passengers: number, tier: CustomerTier = "General"): number | null {
  if (band === "custom") return null;
  const pax = Math.min(3, Math.max(1, passengers || 1));
  return (TOTALS[band][tier] ?? TOTALS[band].General)[pax - 1];
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
