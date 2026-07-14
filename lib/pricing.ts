export type PricingBand = "25km" | "50km" | "75km" | "custom";
export type CustomerTier = "Corporate" | "Hotel/B&B" | "General";

// Base fare per distance band + customer tier — this is the price for ONE passenger.
// The total fare is this base multiplied by the number of passengers (see getFare).
const BASE_RATES: Record<Exclude<PricingBand, "custom">, Record<CustomerTier, number>> = {
  "25km": { "Corporate": 338, "Hotel/B&B": 375, "General": 405 },
  "50km": { "Corporate": 575, "Hotel/B&B": 624, "General": 675 },
  "75km": { "Corporate": 863, "Hotel/B&B": 938, "General": 1013 },
};

export function getBand(distanceKm: number): PricingBand {
  if (distanceKm <= 25) return "25km";
  if (distanceKm <= 50) return "50km";
  if (distanceKm <= 75) return "75km";
  return "custom";
}

// Fare scales linearly with passengers: 1 pax = base, 2 pax = 2×, 3 pax = 3×, etc.
export function getFare(band: PricingBand, passengers: number, tier: CustomerTier = "General"): number | null {
  if (band === "custom") return null;
  const base = BASE_RATES[band][tier];
  if (base == null) return null;
  return base * passengers;
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
