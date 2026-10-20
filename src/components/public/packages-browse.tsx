"use client";

import Image from "next/image";
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
import { EVENT_RATES, formatRate, type EventRate } from "@/lib/event-rates";
import { packagePrice } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

export function PackagesPage() {
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("any");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    const next = EVENT_RATES.filter((item) => {
      if (eventType !== "any" && item.name !== eventType) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    next.sort((a, b) => {
      const priceA = a.amount ?? Number.POSITIVE_INFINITY;
      const priceB = b.amount ?? Number.POSITIVE_INFINITY;
      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      return a.name.localeCompare(b.name);
    });
    return next;
  }, [eventType, search, sort]);

  return (
    <div className="py-16">
      <Container>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Pricing</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Starting prices</h1>
        <p className="mt-4 max-w-2xl text-sm text-stone-500">Shown in Singapore dollars. Prices are indicative and subject to event requirements.</p>
        <p className="mt-4 max-w-2xl text-stone-600">Each figure is a starting price for that kind of event.</p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" className={publicControlClass} />
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All event types</SelectItem>
              {EVENT_RATES.map((rate) => <SelectItem key={rate.id} value={rate.name}>{rate.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Name</SelectItem>
              <SelectItem value="price-asc">Price low to high</SelectItem>
              <SelectItem value="price-desc">Price high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No events found" description="Adjust the filters or view every starting price." action={<Button asChild><Link href="/packages">Show all prices</Link></Button>} />
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="flex flex-col border border-stone-200 bg-white p-4">
                <h2 className="font-display text-2xl leading-tight">{item.name}</h2>
                <p className="mt-2 text-sm text-stone-600">{formatRate(item)}</p>
                <Button asChild variant="outline" className={cn(publicButtonClass, "mt-4 h-10 w-fit px-4")}>
                  <Link href={`/request-proposal?event=${encodeURIComponent(item.name)}`}>Quote</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

function RateDetail({ rate }: { rate: EventRate }) {
  return (
    <Container className="py-16">
      <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Starting price</p>
      <h1 className="mt-3 font-display text-5xl">{rate.name}</h1>
      <p className="mt-6 font-display text-4xl">{formatRate(rate)}</p>
      <p className="mt-3 max-w-md text-sm text-stone-500">Prices are indicative and subject to event requirements.</p>
      <Button asChild className={cn(publicButtonClass, "mt-8")}>
        <Link href={`/request-proposal?event=${encodeURIComponent(rate.name)}`}>Request a quotation</Link>
      </Button>
    </Container>
  );
}

export function PackageDetail({ slug }: { slug: string }) {
  const eventPackage = useDemoStore((state) => state.packages.find((item) => item.slug === slug && item.published && !item.archived));
  const venues = useDemoStore((state) => state.venues);
  const services = useDemoStore((state) => state.services);
  const rate = EVENT_RATES.find((item) => item.slug === slug);
  if (rate) return <RateDetail rate={rate} />;
  if (!eventPackage) {
    return (
      <Container className="py-24">
        <EmptyState title="Package unavailable" description="This package is archived or unpublished." action={<Button asChild><Link href="/packages">Back to packages</Link></Button>} />
      </Container>
    );
  }
  const price = packagePrice(eventPackage.price, eventPackage.salePrice);
  const availableVenues = venues.filter((venue) => eventPackage.venueIds.includes(venue.id) && venue.published);
  const addOns = services.filter((service) => eventPackage.serviceIds.includes(service.id) && service.active);
  return (
    <div className="pb-16">
      <Container className="grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative h-[460px] w-full">
          <Image
            src={eventPackage.image}
            alt={eventPackage.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{eventPackage.eventType}</p>
          <h1 className="mt-3 font-display text-5xl">{eventPackage.name}</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">{eventPackage.description}</p>
          <p className="mt-6 text-[11px] tracking-[0.18em] text-stone-500 uppercase">Starting from</p>
          <p className="mt-2 font-display text-4xl"><CurrencyDisplay value={price} /></p>
          <p className="mt-3 max-w-md text-sm text-stone-500">Prices are indicative and subject to event requirements.</p>
          <p className="mt-2 text-sm text-muted-foreground">Styled for up to {eventPackage.guestCapacity} guests</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className={publicButtonClass}><Link href={`/build-event?package=${eventPackage.slug}`}>Select Package</Link></Button>
            <Button asChild variant="outline" className={publicButtonClass}><Link href={`/build-event?package=${eventPackage.slug}&step=3`}>Customize Package</Link></Button>
            <Button asChild variant="outline" className={publicButtonClass}><Link href={`/request-proposal?package=${eventPackage.slug}`}>Request a quotation</Link></Button>
          </div>
        </div>
      </Container>
      <Container className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Inclusions</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">{eventPackage.inclusions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h2 className="font-display text-3xl">Exclusions</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">{eventPackage.exclusions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </Container>
      <Container className="mt-12">
        <h2 className="font-display text-3xl">Available venues</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {availableVenues.map((venue) => (
            <Button key={venue.id} asChild variant="outline"><Link href={`/venues/${venue.slug}`}>{venue.name}</Link></Button>
          ))}
        </div>
        <h2 className="mt-10 font-display text-3xl">Recommended add-ons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {addOns.map((service) => (
            <div key={service.id} className="flex flex-col border border-stone-200 bg-white p-5">
              <p className="font-display text-2xl">{service.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{service.description}</p>
              <div className="mt-auto pt-4">
                <p className="text-sm"><CurrencyDisplay value={service.price} /> · {service.pricingType}</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={`/request-proposal?package=${eventPackage.slug}&service=${service.id}`}>Add to request</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
