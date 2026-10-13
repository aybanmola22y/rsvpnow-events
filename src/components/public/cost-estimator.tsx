"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { cn } from "@/lib/utils";

type EstimateType = {
  id: string;
  label: string;
  proposalType: string;
  low: number;
  high: number;
};

const types: EstimateType[] = [
  { id: "team-building", label: "Team building", proposalType: "Company Party", low: 50, high: 80 },
  { id: "dinner-dance", label: "Dinner and dance", proposalType: "Company Party", low: 90, high: 150 },
  { id: "family-day", label: "Family day", proposalType: "Private Celebration", low: 40, high: 70 },
  { id: "conference", label: "Conference", proposalType: "Conference", low: 65, high: 110 },
  { id: "gala", label: "Gala dinner", proposalType: "Corporate", low: 120, high: 200 },
  { id: "virtual", label: "Virtual or hybrid", proposalType: "Seminar", low: 25, high: 45 },
];

const shares = [
  { label: "Planning and coordination", share: 0.15 },
  { label: "Program and activities", share: 0.25 },
  { label: "Catering and hospitality", share: 0.4 },
  { label: "Venue and production", share: 0.2 },
];

function volumeFactor(guests: number) {
  if (guests < 30) return 1.12;
  if (guests < 80) return 1.05;
  if (guests <= 150) return 1;
  if (guests < 400) return 0.94;
  return 0.88;
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString("en-SG")}`;
}

export function CostEstimator() {
  const [typeId, setTypeId] = useState(types[0].id);
  const [guests, setGuests] = useState(100);
  const [open, setOpen] = useState(false);
  const selected = types.find((item) => item.id === typeId) ?? types[0];

  const estimate = useMemo(() => {
    const factor = volumeFactor(guests);
    const lowEach = selected.low * factor;
    const highEach = selected.high * factor;
    const low = lowEach * guests;
    const high = highEach * guests;
    return {
      lowEach,
      highEach,
      low,
      high,
      lines: shares.map((part) => ({
        label: part.label,
        low: low * part.share,
        high: high * part.share,
      })),
    };
  }, [guests, selected]);

  const proposalHref = `/request-proposal?event=${encodeURIComponent(selected.proposalType)}&estimate=${encodeURIComponent(selected.label)}&guests=${guests}&budget=${Math.round((estimate.low + estimate.high) / 2)}`;

  return (
    <section className="border-y border-stone-200 bg-white py-20 md:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Estimate</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">
              A {selected.label.toLowerCase()} for {guests.toLocaleString("en-SG")} guests.
            </h2>
            <p className="mt-8 font-display text-3xl md:text-4xl">
              {money(estimate.low)} to {money(estimate.high)}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              About {money(estimate.lowEach)} to {money(estimate.highEach)} a person, in SGD. This is a starting figure. The quotation is written after we know the date and the room.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={publicButtonClass}>
                <Link href={proposalHref}>Request a proposal</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className={publicButtonClass}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? "Hide the breakdown" : "Read the breakdown"}
              </Button>
            </div>
            {open ? (
              <ul className="mt-10 border-t border-stone-200">
                {estimate.lines.map((line) => (
                  <li key={line.label} className="flex items-baseline justify-between gap-6 border-b border-stone-200 py-4 text-sm">
                    <span>{line.label}</span>
                    <span className="shrink-0">{money(line.low)} – {money(line.high)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="lg:pt-10">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">The occasion</p>
            <ul className="mt-4">
              {types.map((item, index) => {
                const active = item.id === selected.id;
                return (
                  <li key={item.id} className="border-b border-stone-200">
                    <button
                      type="button"
                      onClick={() => setTypeId(item.id)}
                      className={cn(
                        "flex w-full items-baseline gap-4 py-4 text-left transition",
                        active ? "text-ink" : "text-stone-400 hover:text-ink",
                      )}
                    >
                      <span className="w-8 text-[11px] tracking-[0.16em] text-gold">0{index + 1}</span>
                      <span className={cn("font-display text-3xl", active && "underline decoration-gold decoration-1 underline-offset-8")}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Guests</p>
                <p className="font-display text-4xl">{guests.toLocaleString("en-SG")}</p>
              </div>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
                aria-label="Number of guests"
                className="mt-4 w-full accent-[#9c7a45]"
              />
              <div className="mt-2 flex justify-between text-xs text-stone-400">
                <span>10</span>
                <span>2,000</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
