"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container, publicButtonClass, publicControlClass } from "@/components/shared/chrome";
import { CurrencyDisplay } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { EVENT_RATES, RATE_GROUPS, formatRate } from "@/lib/event-rates";
import { EVENT_TYPES } from "@/lib/types";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

const priceBands = [
  { id: "any", label: "Any price" },
  { id: "under-50", label: "Under S$50,000" },
  { id: "50-80", label: "S$50,000 – S$80,000" },
  { id: "over-80", label: "Over S$80,000" },
];

export function VenuesPage() {
  const venueList = useDemoStore((state) => state.venues);
  const venues = useMemo(() => venueList.filter((venue) => venue.published), [venueList]);
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState("");
  const [price, setPrice] = useState("any");
  const [eventType, setEventType] = useState("any");
  const [location, setLocation] = useState("any");
  const [sort, setSort] = useState("name");
  const locations = Array.from(new Set(venues.map((venue) => venue.location)));

  const filtered = useMemo(() => {
    const guestCount = Number(guests);
    const next = venues.filter((venue) => {
      const haystack = `${venue.name} ${venue.location} ${venue.shortDescription}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (guests && Number.isFinite(guestCount)) {
        if (venue.minCapacity > guestCount || venue.maxCapacity < guestCount) return false;
      }
      if (price === "under-50" && venue.startingPrice >= 50000) return false;
      if (price === "50-80" && (venue.startingPrice < 50000 || venue.startingPrice > 80000)) return false;
      if (price === "over-80" && venue.startingPrice <= 80000) return false;
      if (eventType !== "any" && !venue.eventTypes.includes(eventType)) return false;
      if (location !== "any" && venue.location !== location) return false;
      return true;
    });
    next.sort((a, b) => {
      if (sort === "price-asc") return a.startingPrice - b.startingPrice;
      if (sort === "price-desc") return b.startingPrice - a.startingPrice;
      if (sort === "capacity") return b.maxCapacity - a.maxCapacity;
      return a.name.localeCompare(b.name);
    });
    return next;
  }, [venues, search, guests, price, eventType, location, sort]);

  function clearFilters() {
    setSearch("");
    setGuests("");
    setPrice("any");
    setEventType("any");
    setLocation("any");
    setSort("name");
  }

  return (
    <div className="py-16">
      <Container>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Venues</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Find the room</h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Filter by the number of guests, the city, and the kind of evening you are planning.
        </p>
        <div className="mt-8 grid gap-3 rounded-none border border-stone-200 bg-white p-4 md:grid-cols-3 lg:grid-cols-6">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search venue" className={publicControlClass} />
          <Input value={guests} onChange={(event) => setGuests(event.target.value)} placeholder="Guest count" type="number" min={1} className={publicControlClass} />
          <Select value={price} onValueChange={setPrice}>
            <SelectTrigger className={publicControlClass}><SelectValue placeholder="Price" /></SelectTrigger>
            <SelectContent>
              {priceBands.map((band) => <SelectItem key={band.id} value={band.id}>{band.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className={publicControlClass}><SelectValue placeholder="Event type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All event types</SelectItem>
              {EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className={publicControlClass}><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All locations</SelectItem>
              {locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className={publicControlClass}><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-asc">Price low to high</SelectItem>
              <SelectItem value="price-desc">Price high to low</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="ghost" onClick={clearFilters}>Clear filters</Button>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title="No venues found"
            description="Try a different guest count, city, or event type."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className="mt-6 grid items-stretch gap-6 md:grid-cols-2">
            {filtered.map((venue) => (
              <article key={venue.id} className="overflow-hidden bg-white">
                <img src={venue.images[0]} alt={venue.name} className="aspect-[3/2] w-full object-cover" />
                <div className="space-y-3 p-6">
                  <h2 className="font-display text-3xl">{venue.name}</h2>
                  <p className="text-sm text-muted-foreground">{venue.location} · {venue.minCapacity}–{venue.maxCapacity} guests</p>
                  <p className="text-sm leading-relaxed text-stone-600">{venue.shortDescription}</p>
                  <p className="text-sm">From <CurrencyDisplay value={venue.startingPrice} /></p>
                  <Button asChild className={publicButtonClass}>
                    <Link href={`/venues/${venue.slug}`}>View Venue</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export function VenueDetail({ slug }: { slug: string }) {
  const venue = useDemoStore((state) => state.venues.find((item) => item.slug === slug && item.published));
  const [active, setActive] = useState(0);
  if (!venue) {
    return (
      <Container className="py-24">
        <EmptyState
          title="Venue unavailable"
          description="This room is not published in the current demo."
          action={<Button asChild><Link href="/venues">Back to venues</Link></Button>}
        />
      </Container>
    );
  }
  const image = venue.images[active] ?? venue.images[0];
  const facts = [
    { title: "Amenities", items: venue.amenities },
    { title: "Facilities", items: venue.facilities },
    { title: "Event types", items: venue.eventTypes },
  ];
  return (
    <div>
      <div className="bg-white">
        <Container className="grid items-start gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div>
            <img src={image} alt={venue.name} className="aspect-[3/2] w-full object-cover" />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {venue.images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show photograph ${index + 1} of ${venue.name}`}
                  className={cn(
                    "overflow-hidden border-2",
                    index === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="lg:pt-2">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{venue.location}</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">{venue.name}</h1>
            <p className="mt-5 text-base leading-relaxed text-stone-600">{venue.description}</p>
            <dl className="mt-8 grid grid-cols-2 border-y border-stone-200 py-5">
              <div>
                <dt className="text-[11px] tracking-[0.16em] text-stone-400 uppercase">Capacity</dt>
                <dd className="mt-2 font-display text-3xl">{venue.minCapacity}–{venue.maxCapacity}</dd>
                <dd className="text-sm text-stone-500">guests</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.16em] text-stone-400 uppercase">Starting price</dt>
                <dd className="mt-2 font-display text-3xl"><CurrencyDisplay value={venue.startingPrice} /></dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild className={cn(publicButtonClass, "w-full")}>
                <Link href={`/request-proposal?venue=${venue.slug}`}>Request a quotation</Link>
              </Button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className={cn(publicButtonClass, "w-full")}>
                  <Link href={`/build-event?venue=${venue.slug}`}>Build Event</Link>
                </Button>
                <Button asChild variant="outline" className={cn(publicButtonClass, "w-full")}>
                  <Link href="/packages">Starting prices</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Container className="grid gap-12 py-16 md:grid-cols-3">
        {facts.map((group) => (
          <div key={group.title}>
            <h2 className="border-b border-stone-300 pb-3 font-display text-3xl">{group.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-stone-600">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <section className="bg-white py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Starting prices</p>
              <h2 className="mt-3 font-display text-4xl">What the event can start from</h2>
            </div>
            <Button asChild variant="outline" className={publicButtonClass}>
              <Link href="/packages">See all prices</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {RATE_GROUPS.map((group) => (
              <div key={group.title} className="border border-stone-200 p-4">
                <p className="text-[11px] tracking-[0.18em] text-gold uppercase">{group.title}</p>
                <ul className="mt-2.5">
                  {group.ids.map((id) => {
                    const rate = EVENT_RATES.find((item) => item.id === id);
                    if (!rate) return null;
                    return (
                      <li key={rate.id} className="flex items-baseline justify-between gap-3 border-t border-stone-200 py-1.5 first:border-t-0 first:pt-0">
                        <span className="text-sm">{rate.shortName}</span>
                        <span className="shrink-0 text-sm tabular-nums text-stone-600">{formatRate(rate)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
