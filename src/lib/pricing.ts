import type { EventPackage, QuotationLine, Service, Venue } from "@/lib/types";
import { packagePrice } from "@/lib/format";

export type CostLine = {
  label: string;
  amount: number;
};

export function lineAmount(line: QuotationLine) {
  const gross = line.quantity * line.unitPrice;
  return gross - gross * (line.discountPercent / 100);
}

export function quoteTotals(items: QuotationLine[], depositPercent: number) {
  const subtotal = items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const discount = items.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice * (line.discountPercent / 100),
    0,
  );
  const grandTotal = subtotal - discount;
  const deposit = grandTotal * (depositPercent / 100);
  const balance = grandTotal - deposit;
  return { subtotal, discount, grandTotal, deposit, balance };
}

export function serviceAmount(service: Service, guests: number, hours: number) {
  if (service.pricingType === "Per Person") return service.price * Math.max(guests, 0);
  if (service.pricingType === "Per Hour") return service.price * Math.max(hours, 1);
  return service.price;
}

export function estimateEvent(input: {
  venue?: Venue | null;
  clientVenue: boolean;
  eventPackage?: EventPackage | null;
  services: Service[];
  guests: number;
  hours: number;
}) {
  const lines: CostLine[] = [];
  if (input.venue && !input.clientVenue) {
    lines.push({ label: input.venue.name, amount: input.venue.startingPrice });
  }
  if (input.eventPackage) {
    lines.push({
      label: input.eventPackage.name,
      amount: packagePrice(input.eventPackage.price, input.eventPackage.salePrice),
    });
  }
  for (const service of input.services) {
    lines.push({
      label: service.name,
      amount: serviceAmount(service, input.guests, input.hours),
    });
  }
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { lines, total };
}
