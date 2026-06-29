export type PricingBand = "25km" | "50km" | "75km" | "custom";
export type CustomerTier = "Corporate" | "Hotel/B&B" | "General";

const RATES: Record<Exclude<PricingBand, "custom">, Record<CustomerTier, Record<number, number>>> = {
  "25km": {
    "Corporate": { 1: 338, 2: 328, 3: 318 },
    "Hotel/B&B": { 1: 375, 2: 356, 3: 338 },
    "General":   { 1: 405, 2: 385, 3: 365 },
  },
  "50km": {
    "Corporate": { 1: 575, 2: 558, 3: 541 },
    "Hotel/B&B": { 1: 624, 2: 594, 3: 563 },
    "General":   { 1: 675, 2: 641, 3: 608 },
  },
  "75km": {
    "Corporate": { 1: 863,   2: 837, 3: 811 },
    "Hotel/B&B": { 1: 938,   2: 891, 3: 844 },
    "General":   { 1: 1013, 2: 962, 3: 912 },
  },
};

export function getFare(band: PricingBand, passengers: number, tier: CustomerTier = "General"): number | null {
  if (band === "custom") return null;
  return RATES[band][tier][passengers] ?? null;
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
