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
  { id: "team-building", name: "Corporate Team Building", shortName: "Team Building", slug: "corporate-team-building", unit: "pax", amount: 180 },
  { id: "dinner-dance", name: "Corporate Dinner & Dance", shortName: "Dinner & Dance", slug: "corporate-dinner-and-dance", unit: "pax", amount: 250 },
  { id: "retreat-overseas", name: "Overseas Corporate Retreats", shortName: "Overseas Retreats", slug: "overseas-corporate-retreats", unit: "pax", amount: 500 },
  { id: "family-day", name: "Company Family Days", shortName: "Family Days", slug: "company-family-days", unit: "pax", amount: 200 },
  { id: "conference", name: "Corporate Conference", shortName: "Conference", slug: "corporate-conference", unit: "pax", amount: 350 },
];

export const RATE_GROUPS = [
  {
    title: "Corporate",
    ids: ["team-building", "dinner-dance", "retreat-overseas", "family-day", "conference"],
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
