"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { EVENT_TYPES } from "@/lib/types";
import { packagePrice } from "@/lib/format";
import { useDemoStore } from "@/lib/store/demo-store";

export function PackagesPage() {
  const params = useSearchParams();
  const venueSlug = params.get("venue") ?? "";
  const venues = useDemoStore((state) => state.venues);
  const packageList = useDemoStore((state) => state.packages);
  const packages = useMemo(() => packageList.filter((item) => item.published && !item.archived), [packageList]);
  const venue = venues.find((item) => item.slug === venueSlug);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("any");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    const next = packages.filter((item) => {
      if (venue && !item.venueIds.includes(venue.id)) return false;
      if (eventType !== "any" && item.eventType !== eventType) return false;
      if (search && !`${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    next.sort((a, b) => {
      const priceA = packagePrice(a.price, a.salePrice);
      const priceB = packagePrice(b.price, b.salePrice);
      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      return a.name.localeCompare(b.name);
    });
    return next;
  }, [packages, venue, eventType, search, sort]);

  return (
    <div className="py-16">
      <Container>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Packages</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Choose a starting point</h1>
        {venue ? (
          <p className="mt-4 text-sm">
            Showing packages available at {venue.name}.{" "}
            <Link href="/packages" className="underline">Clear venue filter</Link>
          </p>
        ) : (
          <p className="mt-4 max-w-2xl text-stone-600">Wedding, debut, birthday, and corporate programs with a published price.</p>
        )}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search packages" className={publicControlClass} />
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className={publicControlClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All event types</SelectItem>
              {EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
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
            <EmptyState title="No packages found" description="Adjust the filters or view every published package." action={<Button asChild><Link href="/packages">Show all packages</Link></Button>} />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="flex flex-col bg-white">
                <img src={item.image} alt={item.name} className="aspect-[3/2] w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{item.eventType}</p>
                  <h2 className="mt-2 font-display text-3xl">{item.name}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{item.description}</p>
                  <p className="mt-4 text-sm">
                    From <CurrencyDisplay value={packagePrice(item.price, item.salePrice)} />
                    {item.salePrice ? <span className="ml-2 text-muted-foreground line-through"><CurrencyDisplay value={item.price} /></span> : null}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild className={publicButtonClass}><Link href={`/packages/${item.slug}`}>View Package</Link></Button>
                    <Button asChild variant="outline" className={publicButtonClass}><Link href={`/request-proposal?package=${item.slug}`}>Request Proposal</Link></Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export function PackageDetail({ slug }: { slug: string }) {
  const eventPackage = useDemoStore((state) => state.packages.find((item) => item.slug === slug && item.published && !item.archived));
  const venues = useDemoStore((state) => state.venues);
  const services = useDemoStore((state) => state.services);
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
        <img src={eventPackage.image} alt={eventPackage.name} className="h-[460px] w-full object-cover" />
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{eventPackage.eventType}</p>
          <h1 className="mt-3 font-display text-5xl">{eventPackage.name}</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">{eventPackage.description}</p>
          <p className="mt-6 font-display text-4xl"><CurrencyDisplay value={price} /></p>
          {eventPackage.salePrice ? <p className="text-sm text-muted-foreground line-through"><CurrencyDisplay value={eventPackage.price} /></p> : null}
          <p className="mt-2 text-sm text-muted-foreground">Styled for up to {eventPackage.guestCapacity} guests</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className={publicButtonClass}><Link href={`/build-event?package=${eventPackage.slug}`}>Select Package</Link></Button>
            <Button asChild variant="outline" className={publicButtonClass}><Link href={`/build-event?package=${eventPackage.slug}&step=3`}>Customize Package</Link></Button>
            <Button asChild variant="outline" className={publicButtonClass}><Link href={`/request-proposal?package=${eventPackage.slug}`}>Request Proposal</Link></Button>
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
            <div key={service.id} className="border border-stone-200 bg-white p-5">
              <p className="font-display text-2xl">{service.name}</p>
              <p className="mt-2 text-sm text-stone-600">{service.description}</p>
              <p className="mt-3 text-sm"><CurrencyDisplay value={service.price} /> · {service.pricingType}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href={`/request-proposal?package=${eventPackage.slug}&service=${service.id}`}>Add to request</Link>
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
