// Day tours from the Traveler Shuttles & Tours brochure (Oct 2026).
// Rates are per person, by group size: [2 pax, 3–4 pax, 5–7 pax, 8–10 pax].

export type Tour = {
  n: string;
  title: string;
  hours: string;
  includes: string[];
  excludes: string;
  rates: [number, number, number, number];
};

const T = "Return transfers with experienced tour guide";
const W = "Water on vehicle";

export const TOURS: Tour[] = [
  { n: "01", title: "Full Day Table Mountain & Peninsula", hours: "08h00–17h30",
    includes: [T, W, "Table Mountain tickets (weather dependent)", "Boulders Beach penguins entrance", "Chapman's Peak drive", "Cape of Good Hope entrance + return funicular"],
    excludes: "Lunch", rates: [3740, 3440, 2710, 2370] },
  { n: "02", title: "Full Day Peninsula Tour", hours: "08h00/08h30–17h30",
    includes: [T, W, "Choice of Seal Island cruise OR Constantia wine tasting", "Boulders Beach penguins entrance", "Lunch at a local restaurant", "Chapman's Peak drive"],
    excludes: "None", rates: [4080, 3770, 3060, 2720] },
  { n: "03", title: "Full Day City + Cape Malay Cooking Class", hours: "08h00–16h00",
    includes: [T, W, "City tour + Bo-Kaap walking tour", "Cape Malay cooking class in a local Bo-Kaap home, including meal", "Kirstenbosch Gardens entrance", "Greenmarket Square + District Six"],
    excludes: "Optional Table Mountain add-on", rates: [3580, 3340, 2600, 2240] },
  { n: "04", title: "Full Day Winelands Tour", hours: "09h00–17h30",
    includes: [T, W, "2 standard wine tastings", "1 premium wine tasting", "Cheese or chocolate included with one tasting/pairing", "Free time in Stellenbosch, time permitting"],
    excludes: "Lunch", rates: [2890, 2580, 1860, 1780] },
  { n: "05", title: "Winelands Game Drive & Wine Tasting", hours: "08h00–17h30",
    includes: [T, W, "Game drive at Villiera Wine Estate", "1 wine tasting at Villiera", "1 wine tasting at a local wine estate", "Wine & chocolate pairing at Waterford"],
    excludes: "Lunch", rates: [3140, 2800, 2120, 1790] },
  { n: "06", title: "Beach Horse Ride & Wine Tasting", hours: "08h30–17h30",
    includes: [T, W, "1.5-hour Noordhoek Beach horse ride", "Chapman's Peak drive", "2 wine tastings"],
    excludes: "Lunch", rates: [3670, 3360, 2650, 2320] },
  { n: "07", title: "Penguins & Wine", hours: "08h00–17h30",
    includes: [T, W, "Boulders Beach penguins entrance", "Chapman's Peak drive", "2 wine tastings in Stellenbosch"],
    excludes: "Lunch", rates: [3020, 2740, 2740, 1680] },
  { n: "08", title: "Franschhoek E-Bike & Wine", hours: "07h30–17h30",
    includes: [T, W, "3.5-hour e-bike tour through Franschhoek", "Stops at 2 wine estates", "Burger lunch paired with craft ale/beer", "Wine tasting at Rickety Bridge"],
    excludes: "None", rates: [4930, 4590, 3920, 3580] },
  { n: "09", title: "Elgin Canopy Zipline & Wine", hours: "TBC–17h00",
    includes: [T, W, "4.5-hour Elgin Valley canopy zipline tour", "4x4 mountain trip + guided zipline experience", "Park fees", "Wet-weather gear where required"],
    excludes: "Lunch; optional wine tasting subject to time", rates: [4030, 3700, 2990, 2690] },
  { n: "10", title: "Full Day Skydiving & Wine", hours: "TBC",
    includes: [T, W, "Tandem skydiving experience", "1 wine tasting in Paarl"],
    excludes: "None", rates: [7130, 6760, 5990, 5600] },
  { n: "11", title: "Full Day Aquila Safari", hours: "06h30–16h30",
    includes: [T, W, "Welcome drink + breakfast at Aquila", "2–3 hour game drive", "Lunch at Aquila", "Optional pool time"],
    excludes: "None", rates: [4820, 4540, 3770, 3640] },
  { n: "12", title: "Full Day Shark Cage Diving", hours: "TBC",
    includes: [T, W, "Shark diving gear", "Light snack and refreshments", "Optional free time in Hermanus, time dependent on boat trip"],
    excludes: "Lunch", rates: [4030, 3770, 3020, 2690] },
  { n: "13", title: "Full Day History Tour", hours: "08h15–17h00",
    includes: [T, W, "Robben Island tour (weather dependent)", "District Six Museum", "City orientation", "Lunch at Bo-Kaap Kombuis"],
    excludes: "None", rates: [3670, 3400, 2710, 2410] },
  { n: "14", title: "Half Day Peninsula", hours: "08h00–14h00",
    includes: [T, W, "Cape of Good Hope + funicular", "Boulders Beach penguins entrance", "Chapman's Peak"],
    excludes: "Lunch", rates: [3140, 2910, 2130, 1790] },
  { n: "15", title: "Half Day City", hours: "08h00–14h00",
    includes: [T, W, "Table Mountain cableway", "Kirstenbosch Gardens entrance", "City orientation: Bo-Kaap + Greenmarket Square"],
    excludes: "Lunch", rates: [2800, 2630, 1900, 1620] },
];

export const BAND_LABELS = ["2 pax", "3–4 pax", "5–7 pax", "8–10 pax"];

/** Index into Tour.rates for a group size, or null when it's priced on request (1 or 11+). */
export function bandFor(guests: number): number | null {
  if (guests === 2) return 0;
  if (guests >= 3 && guests <= 4) return 1;
  if (guests >= 5 && guests <= 7) return 2;
  if (guests >= 8 && guests <= 10) return 3;
  return null;
}

// Create-your-own-itinerary: private vehicle + qualified guide, per day.
export const VEHICLES = [
  { name: "Sedan", maxPax: 3, perDay: 3810 },
  { name: "H1", maxPax: 5, perDay: 4700 },
  { name: "Quantum", maxPax: 10, perDay: 5940 },
];
export const AFTER_HOURS_PER_HOUR = 220;
export const DEPOSIT_PER_PERSON = 500;

/** Smallest vehicle that fits the group, or null if it needs more than one. */
export const vehicleFor = (guests: number) => VEHICLES.find((v) => guests <= v.maxPax) ?? null;
