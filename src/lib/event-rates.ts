export type EventRateUnit = "pax" | "event" | "custom";

export type EventRate = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  unit: EventRateUnit;
  amount: number | null;
};

export const EVENT_RATES: EventRate[] = [
  { id: "team-building", name: "Corporate Team Building", shortName: "Team building", slug: "corporate-team-building", unit: "pax", amount: 35 },
  { id: "dinner-dance", name: "Corporate Dinner & Dance", shortName: "Dinner & dance", slug: "corporate-dinner-and-dance", unit: "pax", amount: 80 },
  { id: "retreat-local", name: "Corporate Retreats (Local)", shortName: "Local retreats", slug: "corporate-retreats-local", unit: "pax", amount: 120 },
  { id: "retreat-overseas", name: "Overseas Corporate Retreats", shortName: "Overseas retreats", slug: "overseas-corporate-retreats", unit: "pax", amount: 400 },
  { id: "family-day", name: "Company Family Days", shortName: "Family days", slug: "company-family-days", unit: "pax", amount: 45 },
  { id: "festive", name: "Festive Corporate Celebrations", shortName: "Festive celebrations", slug: "festive-corporate-celebrations", unit: "pax", amount: 50 },
  { id: "birthday", name: "Birthday Parties", shortName: "Birthday parties", slug: "birthday-parties", unit: "event", amount: 500 },
  { id: "bachelorette", name: "Bachelorette / Hen Parties", shortName: "Hen parties", slug: "bachelorette-hen-parties", unit: "pax", amount: 65 },
  { id: "private", name: "Private Celebrations", shortName: "Private celebrations", slug: "private-celebrations", unit: "event", amount: 800 },
  { id: "launch", name: "Product Launches & Brand Activations", shortName: "Product launches", slug: "product-launches-and-brand-activations", unit: "event", amount: 1500 },
  { id: "workshop", name: "Corporate Workshops", shortName: "Workshops", slug: "corporate-workshops", unit: "pax", amount: 45 },
  { id: "popup", name: "Pop-up Markets & Bazaars", shortName: "Pop-up markets", slug: "pop-up-markets-and-bazaars", unit: "custom", amount: null },
];

export const RATE_GROUPS = [
  {
    title: "Corporate",
    ids: ["team-building", "dinner-dance", "retreat-local", "retreat-overseas", "family-day", "workshop"],
  },
  {
    title: "Celebrations & more",
    ids: ["festive", "birthday", "bachelorette", "private", "launch", "popup"],
  },
] as const;

export function formatRate(rate: EventRate) {
  if (rate.unit === "custom" || rate.amount == null) return "Custom quotation";
  const amount = `S$${rate.amount.toLocaleString("en-SG")}`;
  return rate.unit === "pax" ? `From ${amount}/pax` : `From ${amount}/event`;
}

export function shortRate(rate: EventRate) {
  if (rate.unit === "custom" || rate.amount == null) return "Custom";
  const amount = `S$${rate.amount.toLocaleString("en-SG")}`;
  return rate.unit === "pax" ? `${amount}/pax` : `${amount}/event`;
}

export function startingTotal(rate: EventRate, guests: number) {
  if (rate.unit === "custom" || rate.amount == null) return null;
  if (rate.unit === "event") return rate.amount;
  return rate.amount * Math.max(guests, 0);
}
