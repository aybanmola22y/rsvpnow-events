"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container, publicButtonClass } from "@/components/shared/chrome";
import { EVENT_RATES, RATE_GROUPS, formatRate, shortRate, startingTotal } from "@/lib/event-rates";
import { cn } from "@/lib/utils";

function money(value: number) {
  return `S$${Math.round(value).toLocaleString("en-SG")}`;
}

export function CostEstimator() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [typeId, setTypeId] = useState(EVENT_RATES[0].id);
  const [guests, setGuests] = useState(100);

  const group = RATE_GROUPS[groupIndex];
  const groupRates = useMemo(
    () => group.ids.map((id) => EVENT_RATES.find((item) => item.id === id)!).filter(Boolean),
    [group],
  );
  const selected = EVENT_RATES.find((item) => item.id === typeId) ?? EVENT_RATES[0];
  const total = useMemo(() => startingTotal(selected, guests), [guests, selected]);
  const proposalHref = `/request-proposal?event=${encodeURIComponent(selected.name)}&estimate=${encodeURIComponent(formatRate(selected))}&guests=${guests}${total == null ? "" : `&budget=${total}`}`;

  function pickGroup(index: number) {
    setGroupIndex(index);
    const first = RATE_GROUPS[index].ids[0];
    if (first) setTypeId(first);
  }

  function nudgeGuests(delta: number) {
    setGuests((current) => Math.min(2000, Math.max(10, current + delta)));
  }

  return (
    <section className="border-y border-stone-200 bg-ivory py-16 md:py-20">
      <Container>
        <div className="overflow-hidden border border-stone-200 bg-white lg:grid lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col bg-ink px-6 py-8 text-ivory md:px-9 md:py-9">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Estimate</p>
            <h2 className="mt-3 font-display text-3xl leading-[1.08] text-balance md:text-4xl">
              {selected.shortName}
            </h2>
            <p className="mt-1 text-sm tracking-wide text-white/55">
              for {guests.toLocaleString("en-SG")} guests
            </p>

            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-[11px] tracking-[0.18em] text-white/40 uppercase">Starting from</p>
              <p className="mt-2 font-display text-5xl leading-none tracking-tight md:text-[3.5rem]">
                {total == null ? "Custom" : money(total)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {formatRate(selected)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">
                Indicative, and subject to event requirements.
              </p>
            </div>

            <Button
              asChild
              className={cn(publicButtonClass, "mt-8 w-full bg-white text-ink hover:bg-stone-100 sm:w-auto")}
            >
              <Link href={proposalHref}>Request a quotation</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-8 px-5 py-7 md:px-8 md:py-9">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">The occasion</p>
              {RATE_GROUPS.length > 1 ? (
                <div className="mt-3 grid grid-cols-2 border border-stone-200">
                  {RATE_GROUPS.map((item, index) => {
                    const active = index === groupIndex;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => pickGroup(index)}
                        className={cn(
                          "h-11 text-[11px] tracking-[0.14em] uppercase transition",
                          active ? "bg-ink text-white" : "bg-white text-stone-500 hover:text-ink",
                        )}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <ul className={cn("grid gap-2 sm:grid-cols-2", RATE_GROUPS.length > 1 ? "mt-4" : "mt-3")}>
                {groupRates.map((rate) => {
                  const active = rate.id === selected.id;
                  return (
                    <li key={rate.id}>
                      <button
                        type="button"
                        onClick={() => setTypeId(rate.id)}
                        className={cn(
                          "flex h-full w-full flex-col border px-3 py-2.5 text-left transition",
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-stone-200 bg-white hover:border-stone-400",
                        )}
                      >
                        <span className="text-sm leading-snug">{rate.shortName}</span>
                        <span className={cn("mt-1 text-xs tabular-nums", active ? "text-white/70" : "text-stone-500")}>
                          {shortRate(rate)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Guests</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Fewer guests"
                    onClick={() => nudgeGuests(-10)}
                    className="flex h-9 w-9 items-center justify-center border border-stone-300 text-lg leading-none text-ink hover:border-ink"
                  >
                    −
                  </button>
                  <p className="min-w-16 text-center font-display text-3xl leading-none">
                    {guests.toLocaleString("en-SG")}
                  </p>
                  <button
                    type="button"
                    aria-label="More guests"
                    onClick={() => nudgeGuests(10)}
                    className="flex h-9 w-9 items-center justify-center border border-stone-300 text-lg leading-none text-ink hover:border-ink"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
                aria-label="Number of guests"
                className="mt-5 w-full accent-[#111111]"
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
